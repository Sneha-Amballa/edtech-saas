import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCertificate } from "../services/enrollmentService";
import "../styles/courseDetails.css";
import "../styles/certificate.css";
const Certificate = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await getCertificate(courseId);
        setCertificate(res.data.certificate);
      } catch (err) {
        alert(err.response?.data?.message || "Certificate not found");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [courseId, navigate]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPNG = async () => {
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(containerRef.current);
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `${certificate.courseTitle}-${certificate.certificateId}.png`;
      a.click();
    } catch (err) {
      // fallback to print dialog
      handlePrint();
    }
  };

  if (loading) return <div>Loading certificate...</div>;

  return (
    <div className="certificate-page">
      <div className="certificate-actions">
        <button onClick={() => navigate(-1)}>Back</button>
        <button onClick={handlePrint}>Print / Save as PDF</button>
        <button onClick={handleDownloadPNG}>Download PNG</button>
      </div>

      <div id="certificate" ref={containerRef} className="certificate-card">
        <h2 className="cert-title">Certificate of Completion</h2>
        <p className="cert-sub">This certifies that</p>
        <h1 className="cert-name">{certificate.studentName}</h1>
        <p className="cert-text">has successfully completed the course</p>
        <h2 className="cert-course">{certificate.courseTitle}</h2>
        <p className="cert-meta">
          Mentor: {certificate.mentorName} • Completed on: {new Date(certificate.completionDate).toLocaleDateString()}
        </p>

        <div className="cert-footer">
          <div>Certificate ID: <strong>{certificate.certificateId}</strong></div>
          <div className="cert-sign">Authorized Signature</div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
