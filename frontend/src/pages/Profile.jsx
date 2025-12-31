import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyProfile } from "../services/profileService";
import "../styles/studentDashboard.css";
import "../styles/profile.css";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await getMyProfile();
        setProfile(res.data);
      } catch (err) {
        alert(err.response?.data?.message || "Failed to load profile");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  if (loading) return <div>Loading profile...</div>;
  if (!profile) return <div>No profile data</div>;

  return (
    <div className="profile-page">
      <h1>Profile</h1>
      <div className="profile-card">
        <div><strong>Name:</strong> {profile.name}</div>
        <div><strong>Email:</strong> {profile.email}</div>
        <div><strong>Role:</strong> {profile.role}</div>

        {profile.role === "student" && (
          <>
            <div><strong>Total enrolled courses:</strong> {profile.totalEnrolled}</div>
            <div><strong>In-progress:</strong> {profile.inProgress}</div>
            <div><strong>Completed:</strong> {profile.completed}</div>

            <h3>Completed Courses</h3>
            {profile.completedCourses?.length ? (
              <ul>
                {profile.completedCourses.map((c, idx) => (
                  <li key={`${c.certificateId || idx}`}>
                    <div><strong>{c.courseTitle}</strong></div>
                    <div>Completed: {new Date(c.completionDate).toLocaleDateString()}</div>
                    {c.certificateId && <div>ID: {c.certificateId}</div>}
                  </li>
                ))}
              </ul>
            ) : (
              <div>No completed courses yet</div>
            )}
          </>
        )}

        {profile.role === "mentor" && (
          <>
            <div><strong>Total courses created:</strong> {profile.totalCourses}</div>
            <div><strong>Total student enrollments:</strong> {profile.totalEnrollments}</div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
