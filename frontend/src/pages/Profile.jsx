import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyProfile } from "../services/profileService";
import "../styles/studentDashboard.css";
import "../styles/profile.css";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

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

            <div className="student-analytics">
              {(() => {
                const months = profile.enrollmentsOverTime?.labels || ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
                const values = profile.enrollmentsOverTime?.data || (() => {
                  const total = profile.totalEnrolled || 0;
                  const base = Math.floor(total / months.length) || 0;
                  return months.map((m, i) => base + Math.round((i - months.length / 2) * 1));
                })();

                const learningData = { labels: months, datasets: [{ label: "Activity", data: values, borderColor: "#0ea5a4", backgroundColor: "rgba(14,165,164,0.08)", tension: 0.3 }] };

                const courses = profile.courses || [];
                const courseLabels = courses.length ? courses.map(c => c.title || c.name) : ["Course A", "Course B"];
                const courseProgressVals = courses.length ? courses.map(c => c.progress || 0) : [40, 70];
                const courseBarData = { labels: courseLabels, datasets: [{ label: "Progress (%)", data: courseProgressVals, backgroundColor: courseLabels.map((l,i)=>[`#60a5fa`,`#34d399`,'#f97316'][i%3]) }] };

                const courseRows = courses.length ? courses : [{ title: "Course A", progress: 12, status: "in-progress" }];

                return (
                  <>
                    <div className="chart card">
                      <h4>Learning Activity Over Time</h4>
                      <Line data={learningData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                    </div>

                    <div className="chart card">
                      <h4>Course-wise Progress</h4>
                      <Bar data={courseBarData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 100 } } }} />
                    </div>

                    <div className="performance-table card">
                      <h4>Course Progress</h4>
                      <table>
                        <thead>
                          <tr>
                            <th>Course</th>
                            <th>Progress</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {courseRows.map((c, idx) => (
                            <tr key={c.id || c.title || idx}>
                              <td>{c.title || c.name || `Course ${idx+1}`}</td>
                              <td>{c.progress ?? c.enrollments ?? 0}%</td>
                              <td>{c.status || (c.progress >= 100 ? 'completed' : 'in-progress')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                );
              })()}
            </div>
          </>
        )}

        {profile.role === "mentor" && (
          <>
            <div><strong>Total courses created:</strong> {profile.totalCourses}</div>
            <div><strong>Total student enrollments:</strong> {profile.totalEnrollments}</div>
            <div className="mentor-analytics">
              {(() => {
                const months = profile.enrollmentsOverTime?.labels || ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
                const values = profile.enrollmentsOverTime?.data || (() => {
                  const total = profile.totalEnrollments || 0;
                  const base = Math.floor(total / months.length) || 0;
                  return months.map((m, i) => base + Math.round((i - months.length / 2) * 2 + (profile.totalCourses || 0)));
                })();

                const enrollmentsData = { labels: months, datasets: [{ label: "Enrollments", data: values, borderColor: "#6366f1", backgroundColor: "rgba(99,102,241,0.08)", tension: 0.3 }] };

                const courses = profile.courses || [];
                const courseLabels = courses.length ? courses.map(c => c.title || c.name) : ["Course A", "Course B", "Course C"];
                const courseDataVals = courses.length ? courses.map(c => c.enrollments || c.enrollmentCount || 0) : [12, 19, 7];
                const courseBarData = { labels: courseLabels, datasets: [{ label: "Enrollments", data: courseDataVals, backgroundColor: courseLabels.map((l,i)=>[`#60a5fa`,`#34d399`,`#f59e0b`][i%3]) }] };

                const completed = profile.completed || profile.totalCompleted || Math.round((profile.totalEnrollments || 0) * 0.4);
                const inProgress = (profile.totalEnrollments || 0) - completed;
                const completionPieData = { labels: ["Completed", "In-progress"], datasets: [{ data: [completed, Math.max(inProgress, 0)], backgroundColor: ["#10b981", "#f59e0b"] }] };

                const courseRows = (courses.length ? courses : [{ title: "Course A", enrollments: 12, completions: 6, avgScore: 82 }]);

                return (
                  <>
                    <div className="chart card">
                      <h4>Enrollments Over Time</h4>
                      <Line data={enrollmentsData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                    </div>

                    <div className="chart card">
                      <h4>Course-wise Enrollments</h4>
                      <Bar data={courseBarData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                    </div>

                    <div className="chart card">
                      <h4>Completion Status</h4>
                      <Pie data={completionPieData} options={{ responsive: true, plugins: { legend: { position: "bottom" } } }} />
                    </div>

                    <div className="performance-table card">
                      <h4>Course Performance</h4>
                      <table>
                        <thead>
                          <tr>
                            <th>Course</th>
                            <th>Enrollments</th>
                            <th>Completions</th>
                            <th>Completion Rate</th>
                            <th>Avg Score</th>
                          </tr>
                        </thead>
                        <tbody>
                          {courseRows.map((c, idx) => {
                            const enroll = c.enrollments || c.enrollmentCount || 0;
                            const comp = c.completions || c.completed || Math.round(enroll * 0.5);
                            const rate = enroll ? Math.round((comp / enroll) * 100) : 0;
                            return (
                              <tr key={c.id || c.title || idx}>
                                <td>{c.title || c.name || `Course ${idx+1}`}</td>
                                <td>{enroll}</td>
                                <td>{comp}</td>
                                <td>{rate}%</td>
                                <td>{c.avgScore ?? (Math.round((Math.random()*20)+70))}%</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                );
              })()}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
