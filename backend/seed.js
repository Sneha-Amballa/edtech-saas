const mongoose = require("mongoose");
require("dotenv").config();
const bcrypt = require("bcryptjs"); // Ensure bcryptjs is installed

const User = require("./src/models/User");
const Course = require("./src/models/Course");
const Enrollment = require("./src/models/Enrollment");
const Chat = require("./src/models/Chat");

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");

        console.log("Clearing existing data...");
        await User.deleteMany({ role: { $ne: 'admin' } }); // Keep admin if exists, or just clear all? User didn't specify admin, but server creates it. Let's clear students/mentors.
        // Actually, to be safe and clean, let's clear students and mentors specifically.
        // But duplicate checks might fail if I don't clear.
        // Let's clear EVERYTHING except Admin to be safe, or just everything and let server.js recreate admin if needed?
        // The user instruction implies a fresh set. "Create 4 students..."
        // I'll delete all users that match the emails I'm about to create, or just all non-admins.
        await User.deleteMany({ role: { $in: ['student', 'mentor'] } });
        await Course.deleteMany({});
        await Enrollment.deleteMany({});
        await Chat.deleteMany({});

        console.log("Seeding Users...");
        const salt = await bcrypt.genSalt(10);
        const studentPass = await bcrypt.hash("Student@123", salt);
        const mentorPass = await bcrypt.hash("Mentor@123", salt);

        const studentsData = [
            { name: "Karan Malhotra", email: "karan@student.com", password: studentPass, role: "student" },
            { name: "Pooja Iyer", email: "pooja@student.com", password: studentPass, role: "student" },
            { name: "Aditya Kulkarni", email: "aditya@student.com", password: studentPass, role: "student" },
            { name: "Nisha Fernandes", email: "nisha@student.com", password: studentPass, role: "student" },
        ];

        const mentorsData = [
            { name: "Vikram Desai", email: "vikram@mentor.com", password: mentorPass, role: "mentor" },
            { name: "Shalini Gupta", email: "shalini@mentor.com", password: mentorPass, role: "mentor" },
            { name: "Mohit Khanna", email: "mohit@mentor.com", password: mentorPass, role: "mentor" },
            { name: "Ritika Banerjee", email: "ritika@mentor.com", password: mentorPass, role: "mentor" },
        ];

        const students = await User.insertMany(studentsData);
        const mentors = await User.insertMany(mentorsData);

        // Helpers to find IDs
        const findStudent = (name) => students.find(u => u.name === name);
        const findMentor = (name) => mentors.find(u => u.name === name);

        console.log("Seeding Courses...");

        // Lesson Structure Template
        const createLessons = () => [
            { title: "Course Overview & How This Course Works", type: "text", content: "Welcome to the course! Here is what you will learn...", isFree: true },
            { title: "Introduction to Topic", type: "text", content: "Let's dive into the basics.", isFree: false },
            { title: "Topic Demo – Free Preview", type: "video", content: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", isFree: true }, // Placeholder video
            { title: "Full Topic Implementation", type: "video", content: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", isFree: false },
            { title: "Best Practices & Common Mistakes", type: "text", content: "Avoid these common pitfalls...", isFree: false },
            { title: "Build a Real-World Example", type: "video", content: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", isFree: false },
        ];

        const coursesList = [
            // HTML / CSS
            { title: "HTML – From Basics to Real Websites", category: "HTML/CSS", mentor: "Vikram Desai", published: true, price: 499 },
            { title: "Advanced HTML & Semantic Web", category: "HTML/CSS", mentor: "Vikram Desai", published: false, price: 599 },
            { title: "CSS – Styling Beautiful Websites", category: "HTML/CSS", mentor: "Shalini Gupta", published: true, price: 599 },
            { title: "CSS Flexbox & Grid Mastery", category: "HTML/CSS", mentor: "Shalini Gupta", published: true, price: 699 },

            // JavaScript
            { title: "JavaScript for Beginners", category: "JavaScript", mentor: "Mohit Khanna", published: true, price: 999 },
            { title: "Advanced JavaScript Concepts", category: "JavaScript", mentor: "Mohit Khanna", published: false, price: 1199 },
            { title: "DOM Manipulation & Events", category: "JavaScript", mentor: "Mohit Khanna", published: true, price: 799 },

            // React
            { title: "React Basics – Components & Props", category: "React", mentor: "Ritika Banerjee", published: true, price: 1299 },
            { title: "React Hooks Deep Dive", category: "React", mentor: "Ritika Banerjee", published: false, price: 1499 },
            { title: "Build Projects with React", category: "React", mentor: "Ritika Banerjee", published: true, price: 1999 },

            // Backend
            { title: "Node.js & Express Fundamentals", category: "Backend", mentor: "Vikram Desai", published: true, price: 1599 },
            { title: "MongoDB for Developers", category: "Backend", mentor: "Vikram Desai", published: true, price: 1299 },
            { title: "REST APIs & Authentication", category: "Backend", mentor: "Vikram Desai", published: false, price: 1499 },

            // Career / Tools
            { title: "Git & GitHub for Developers", category: "Tools", mentor: "Shalini Gupta", published: true, price: 499 },
            { title: "Placement Preparation for Developers", category: "Career", mentor: "Shalini Gupta", published: true, price: 2999 },
        ];

        const courseDocs = [];
        for (const c of coursesList) {
            const mentorObj = findMentor(c.mentor);
            if (!mentorObj) console.error(`Mentor not found: ${c.mentor}`);

            const newCourse = await Course.create({
                title: c.title,
                description: `Learn ${c.title} from expert mentor ${c.mentor}.`,
                price: c.price,
                category: c.category,
                mentor: mentorObj._id,
                published: c.published,
                lessons: createLessons(),
                enrolledCount: 0 // Will update later
            });
            courseDocs.push(newCourse);
        }

        const findCourse = (title) => courseDocs.find(c => c.title.includes(title)); // loose match for "HTML - From Basics" vs "HTML – From Basics to Real Websites"

        console.log("Seeding Enrollments...");
        const enrollmentsData = [
            { student: "Karan Malhotra", course: "HTML – From Basics", percent: 40 },
            { student: "Karan Malhotra", course: "CSS – Styling Beautiful Websites", percent: 25 }, // Match title carefully
            { student: "Pooja Iyer", course: "HTML – From Basics", percent: 65 },
            { student: "Pooja Iyer", course: "JavaScript for Beginners", percent: 30 },
            { student: "Aditya Kulkarni", course: "React Basics", percent: 55 },
            { student: "Aditya Kulkarni", course: "Node.js & Express", percent: 20 },
            { student: "Nisha Fernandes", course: "Git & GitHub", percent: 80 },
            { student: "Nisha Fernandes", course: "Placement Preparation", percent: 35 },
        ];

        for (const e of enrollmentsData) {
            const stu = findStudent(e.student);
            const crs = findCourse(e.course);

            if (stu && crs) {
                // Calculate completed lessons based on percentage
                const totalLessons = crs.lessons.length;
                const completeCount = Math.floor((e.percent / 100) * totalLessons);
                const completedLessonIds = crs.lessons.slice(0, completeCount).map(l => l._id);

                await Enrollment.create({
                    student: stu._id,
                    course: crs._id,
                    completedLessons: completedLessonIds,
                    progress: e.percent,
                    status: e.percent === 100 ? "completed" : "in-progress"
                });

                // Update enrolled count
                crs.enrolledCount += 1;
                await crs.save();
            } else {
                console.log(`Missing student or course for enrollment: ${e.student} -> ${e.course}`);
            }
        }

        console.log("Seeding Chats...");
        // Karan <-> Vikram (HTML Course)
        // Pooja <-> Mohit (JavaScript Course)
        // Aditya <-> Ritika (React Course)

        const chatsToCreate = [
            { student: "Karan Malhotra", mentor: "Vikram Desai", course: "HTML – From Basics" },
            { student: "Pooja Iyer", mentor: "Mohit Khanna", course: "JavaScript for Beginners" },
            { student: "Aditya Kulkarni", mentor: "Ritika Banerjee", course: "React Basics" },
        ];

        for (const ch of chatsToCreate) {
            const s = findStudent(ch.student);
            const m = findMentor(ch.mentor);
            const c = findCourse(ch.course);

            if (s && m && c) {
                await Chat.create({
                    student: s._id,
                    mentor: m._id,
                    course: c._id,
                    messages: [
                        { sender: s._id, content: "Hi mentor, I’m confused about this concept", status: "read" },
                        { sender: m._id, content: "No worries, I’ll explain it clearly", status: "read" },
                        { sender: s._id, content: "Got it now, thank you!", status: "delivered" }
                    ]
                });
            }
        }

        console.log("Database seeded successfully!");
        process.exit();
    } catch (err) {
        console.error("Error seeding database:", err.message);
        process.exit(1);
    }
};

seedDatabase();
