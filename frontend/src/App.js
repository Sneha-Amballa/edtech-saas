import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Courses from "./pages/Courses";

import StudentDashboard from "./pages/StudentDashboard";
import StudentCourseDetails from "./pages/CourseDetails";
import Profile from "./pages/Profile";
import Certificate from "./pages/Certificate";

import MentorDashboard from "./pages/MentorDashboard";
import CreateCourse from "./pages/CreateCourse";
import ManageCourse from "./pages/ManageCourse";
import MentorCoursePreview from "./pages/MentorCoursePreview";

import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🌐 Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/courses" element={<Courses />} />

        {/* 🎓 Student Routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/course/:id"
          element={
            <ProtectedRoute role="student">
              <StudentCourseDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/certificate/:courseId"
          element={
            <ProtectedRoute role="student">
              <Certificate />
            </ProtectedRoute>
          }
        />

        {/* 🧑‍🏫 Mentor Routes */}
        <Route
          path="/mentor"
          element={
            <ProtectedRoute role="mentor">
              <MentorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mentor/create-course"
          element={
            <ProtectedRoute role="mentor">
              <CreateCourse />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mentor/course/:id/manage"
          element={
            <ProtectedRoute role="mentor">
              <ManageCourse />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mentor/course/:id"
          element={
            <ProtectedRoute role="mentor">
              <MentorCoursePreview />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
