const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const crypto = require("crypto");
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* ---------------- ENROLL STUDENT ---------------- */
exports.enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course || !course.published) {
      return res.status(404).json({ message: "Course not available" });
    }

    const alreadyEnrolled = await Enrollment.findOne({
      student: studentId,
      course: courseId,
    });

    if (alreadyEnrolled) {
      return res
        .status(400)
        .json({ message: "Already enrolled in this course" });
    }

    // If course is free, enroll directly
    if (course.price === 0) {
      const enrollment = await Enrollment.create({
        student: studentId,
        course: courseId,
        completedLessons: [],
        status: "in-progress",
        progress: 0,
      });

      course.enrolledCount += 1;
      await course.save();

      return res.status(201).json({
        message: "Enrolled successfully",
        enrollment,
        enrolledCount: course.enrolledCount,
      });
    }

    return res.status(400).json({ message: "Course requires payment" });

  } catch (error) {
    res.status(500).json({ message: "Enrollment failed" });
  }
};


/* ---------------- CREATE PAYMENT ORDER ---------------- */
exports.createPaymentOrder = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if already enrolled
    const alreadyEnrolled = await Enrollment.findOne({
      student: studentId,
      course: courseId,
    });

    if (alreadyEnrolled) {
      return res.status(400).json({ message: "Already enrolled in this course" });
    }

    const options = {
      amount: Math.round(course.price * 100), // amount in lowest currency unit
      currency: "INR",
      receipt: `receipt_${courseId}_${studentId.toString().slice(-4)}`,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID, // Send key to frontend
      course: {
        title: course.title,
        description: course.description
      },
      user: {
        name: req.user.name,
        email: req.user.email,
        contact: req.user.phone || ""
      }
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Could not create payment order" });
  }
};

/* ---------------- VERIFY PAYMENT & ENROLL ---------------- */
exports.verifyPayment = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const studentId = req.user._id;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Payment success, enroll student
      const course = await Course.findById(courseId);

      // Double check enrollment just in case
      const alreadyEnrolled = await Enrollment.findOne({
        student: studentId,
        course: courseId,
      });

      if (alreadyEnrolled) {
        return res.status(200).json({ message: "Payment verified, already enrolled", enrollment: alreadyEnrolled });
      }

      const enrollment = await Enrollment.create({
        student: studentId,
        course: courseId,
        completedLessons: [],
        status: "in-progress",
        progress: 0,
        paymentId: razorpay_payment_id, // Store payment ID if you added field to model (optional but good)
        orderId: razorpay_order_id
      });

      course.enrolledCount += 1;
      await course.save();

      res.status(201).json({
        message: "Payment verified and Enrolled successfully",
        enrollment,
      });
    } else {
      res.status(400).json({ message: "Payment verification failed" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


/* ---------------- MARK LESSON COMPLETE ---------------- */
exports.markLessonComplete = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const studentId = req.user._id;

    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
    });

    if (!enrollment) {
      return res.status(403).json({
        message: "You are not enrolled in this course",
      });
    }

    const alreadyCompleted = enrollment.completedLessons.some(
      (id) => id.toString() === lessonId
    );

    if (alreadyCompleted) {
      return res.json({ message: "Lesson already completed" });
    }

    enrollment.completedLessons.push(lessonId);

    const course = await Course.findById(courseId);
    if (!course || !course.lessons) {
      return res.status(404).json({ message: "Course not found" });
    }

    const total = course.lessons.length;
    const completed = enrollment.completedLessons.length;

    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
    enrollment.progress = progress;

    if (progress === 100) {
      enrollment.completedAt = new Date();
      enrollment.status = "completed";
      // generate certificate if not already present
      if (!enrollment.certificateId) {
        const cid = `CERT-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
        enrollment.certificateId = cid;
        enrollment.certificateIssuedAt = new Date();
      }
    } else {
      enrollment.status = "in-progress";
    }

    await enrollment.save();

    // return updated enrollment + user counts so frontend can update dashboard
    const inProgressCount = await Enrollment.countDocuments({
      student: studentId,
      status: "in-progress",
    });

    const completedCount = await Enrollment.countDocuments({
      student: studentId,
      status: "completed",
    });

    const enrolledCount = await Enrollment.countDocuments({
      student: studentId,
    });

    res.json({
      message: "Lesson marked complete",
      enrollment,
      counts: {
        enrolledCount,
        inProgressCount,
        completedCount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to mark lesson complete" });
  }
};


/* ---------------- MY COURSES (STUDENT) ---------------- */
exports.getMyCourses = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      student: req.user._id,
    })
      .populate("course")
      .lean();

    const formatted = enrollments.map((e) => {
      const totalLessons = e.course.lessons?.length || 0;
      const completedLessonsArray = e.completedLessons || [];
      const completedLessonsCount = completedLessonsArray.length;

      const progress = e.progress ?? (totalLessons === 0 ? 0 : Math.round((completedLessonsCount / totalLessons) * 100));

      return {
        _id: e._id,
        course: e.course,
        status: e.status,
        progress,
        completedLessons: completedLessonsArray,
        completedLessonsCount,
        totalLessons,
      };
    });

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch enrolled courses" });
  }
};


exports.getCounts = async (req, res) => {
  try {
    const studentId = req.user._id;

    const enrolledCount = await Enrollment.countDocuments({ student: studentId });
    const inProgressCount = await Enrollment.countDocuments({ student: studentId, status: "in-progress" });
    const completedCount = await Enrollment.countDocuments({ student: studentId, status: "completed" });

    res.json({ enrolledCount, inProgressCount, completedCount });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch counts" });
  }
};


exports.getCertificate = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user._id;

    const enrollment = await Enrollment.findOne({ student: studentId, course: courseId })
      .populate({ path: "course", populate: { path: "mentor", select: "name" } })
      .lean();

    if (!enrollment || enrollment.status !== "completed") {
      return res.status(404).json({ message: "Certificate not available" });
    }

    const certificate = {
      studentName: req.user.name || `${req.user.email}`,
      courseTitle: enrollment.course.title,
      mentorName: enrollment.course.mentor?.name || "",
      completionDate: enrollment.certificateIssuedAt || enrollment.completedAt,
      certificateId: enrollment.certificateId,
    };

    res.json({ certificate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch certificate" });
  }
};


