import { Link } from "react-router-dom";

const StudentDashboard = () => {
  return (
    <div style={{ padding: "40px" }}>
      <h1>🎓 Student Dashboard</h1>
      <p>Browse and learn new skills</p>

      <Link to="/courses">
        <button>Browse Courses</button>
      </Link>
    </div>
  );
};

export default StudentDashboard;
