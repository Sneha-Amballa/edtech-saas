import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ManageCourse from "./pages/ManageCourse";
import CourseDetails from "./pages/CourseDetails";
import StudentDashboard from "./pages/StudentDashboard";
import MentorDashboard from "./pages/MentorDashboard";
import CreateCourse from "./pages/CreateCourse";
import Courses from "./pages/Courses";
import MentorCoursePreview from "./pages/MentorCoursePreview";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/mentor" element={<MentorDashboard />} />
        <Route path="/mentor/create-course" element={<CreateCourse />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/mentor/course/:id" element={<ManageCourse />} />
        <Route path="/mentor/course/:id" element={<ManageCourse />} />
        <Route path="/course/:id" element={<CourseDetails />} />
        <Route path="/mentor/course/:id" element={<MentorCoursePreview />}/>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
