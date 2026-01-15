import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCertificate } from "../services/enrollmentService";
import ThemeToggle from "../components/ThemeToggle";
import "../styles/courseDetails.css";
import "../styles/certificate.css";

const Certificate = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  /*
  // TEMP: Mock data for visual verification
  const [certificate, setCertificate] = useState({
    studentName: "Alex Johnson",
    courseTitle: "Advanced Web Development",
    mentorName: "Dr. Sarah Chen",
    completionDate: new Date().toISOString(),
    certificateId: "CERT-2026-XYZ-123"
  });
  const [loading, setLoading] = useState(false); // Disable loading
  */

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
      const element = containerRef.current;

      // Temporary styling for better capture
      const originalBoxShadow = element.style.boxShadow;
      element.style.boxShadow = "none"; // Remove shadow for cleaner edge

      const canvas = await html2canvas(element, {
        scale: 3, // Higher quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        x: 0,
        y: 0,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
      });

      // Restore styling
      element.style.boxShadow = originalBoxShadow;

      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `Certificate-${certificate.studentName.replace(/\s+/g, '_')}-${certificate.courseTitle.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download failed:", err);
      // fallback to print dialog
      handlePrint();
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading certificate...</p>
      </div>
    );
  }

  return (
    <div className="certificate-page">
      <div className="certificate-header">
        <div className="header-content">
          <h1 className="page-title">Certificate of Completion</h1>
          <p className="page-subtitle">Your achievement is ready to share</p>
        </div>
        <div className="certificate-actions">
          <button
            className="action-btn back-btn"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
          <button
            className="action-btn primary-btn"
            onClick={handlePrint}
          >
            🖨️ Print / Save PDF
          </button>
          <button
            className="action-btn secondary-btn"
            onClick={handleDownloadPNG}
          >
            📥 Download PNG
          </button>
        </div>
      </div>

      <div className="certificate-container">
        <div id="certificate" ref={containerRef} className="certificate-card">
          {/* Decorative Border Elements */}
          <div className="border-corner top-left"></div>
          <div className="border-corner top-right"></div>
          <div className="border-corner bottom-left"></div>
          <div className="border-corner bottom-right"></div>

          {/* Header */}
          <div className="certificate-header-decoration">
            <div className="certificate-seal">
              <div className="seal-inner">
                <span>✓</span>
              </div>
            </div>
            <h2 className="cert-title">Certificate of Completion</h2>
            <div className="decoration-line"></div>
          </div>

          {/* Content */}
          <div className="certificate-content">
            <p className="cert-sub">This is to certify that</p>
            <h1 className="cert-name">{certificate.studentName}</h1>
            <p className="cert-text">
              has successfully completed the course with distinction
            </p>
            <h2 className="cert-course">{certificate.courseTitle}</h2>

            <div className="certificate-details">
              <div className="detail-item">
                <span className="detail-label">Mentor:</span>
                <span className="detail-value">{certificate.mentorName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Completed on:</span>
                <span className="detail-value">
                  {new Date(certificate.completionDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="cert-footer">
            <div className="certificate-id">
              <span className="id-label">Certificate ID:</span>
              <strong className="id-value">{certificate.certificateId}</strong>
            </div>
            <div className="signature-section">
              <div className="signature-line"></div>
              <div className="cert-sign">Authorized Signature</div>
            </div>
          </div>

          {/* Watermark */}
          <div className="certificate-watermark">ACHIEVEMENT</div>
        </div>
      </div>

      <div className="certificate-info">
        <p className="info-text">
          💡 <strong>Tip:</strong> Use the buttons above to print, save as PDF, or download as PNG.
          For best print results, use landscape orientation.
        </p>
      </div>
    </div>
  );
};

export default Certificate;