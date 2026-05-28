import { useState, useEffect, useRef } from "react";
import { getCertificates, checkCertificates } from "../services/api";
import { formatDate } from "../utils/helpers";
import { useAuth } from "../context/AuthContext";
import CertificateTemplate from "../components/CertificateTemplate";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [downloadingCert, setDownloadingCert] = useState(null);
  const { user } = useAuth();
  const templateRef = useRef(null);

  useEffect(() => { fetchCertificates(); }, []);

  const fetchCertificates = async () => {
    try {
      const { data } = await getCertificates();
      setCertificates(data.certificates || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCheck = async () => {
    setChecking(true);
    try {
      const { data } = await checkCertificates();
      if (data.newCertificates?.length > 0) {
        alert(`🎉 You earned ${data.newCertificates.length} new certificate(s)!`);
        fetchCertificates();
      } else {
        alert("No new certificates at this time. Keep practicing!");
      }
    } catch (err) { console.error(err); }
    finally { setChecking(false); }
  };

  const handleDownloadPDF = async (cert) => {
    // Set the currently downloading certificate to render it in the hidden template
    setDownloadingCert(cert);
    
    // We need to wait for React to render the template with the new data
    setTimeout(async () => {
      const element = templateRef.current;
      if (!element) {
        setDownloadingCert(null);
        return;
      }

      try {
        const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: "#fcfcfc" });
        const imgData = canvas.toDataURL("image/png");
        
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "px",
          format: [1056, 816] // Exact dimensions of our template
        });
        
        pdf.addImage(imgData, "PNG", 0, 0, 1056, 816);
        pdf.save(`${cert.title.replace(/\s+/g, "_")}_Certificate.pdf`);
      } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Failed to generate PDF. Please try again.");
      } finally {
        setDownloadingCert(null);
      }
    }, 100); // 100ms delay to ensure the DOM is updated
  };

  const typeIcons = {
    "test-milestone": "📝",
    streak: "🔥",
    "top-performer": "⭐",
    "course-completion": "📚",
  };

  const typeColors = {
    "test-milestone": "#6366f1",
    streak: "#f59e0b",
    "top-performer": "#10b981",
    "course-completion": "#06b6d4",
  };

  if (loading) {
    return <div className="page-container"><div className="loading-screen"><div className="loading-spinner"><div className="spinner"></div><p>Loading certificates...</p></div></div></div>;
  }

  return (
    <div className="certificates-page">
      <div className="certificates-container">
        <div className="certificates-header">
          <div>
            <h1>🏅 Certificates</h1>
            <p>Your achievement certificates and milestones</p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button className="btn-primary" onClick={handleCheck} disabled={checking}>
              {checking ? "Checking..." : "🔍 Check for New Certificates"}
            </button>
          </div>
        </div>

        {certificates.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏅</div>
            <p>No certificates earned yet. Complete milestones to earn certificates!</p>
            <div className="milestone-hints">
              <span className="hint-chip">📝 Complete 10 tests</span>
              <span className="hint-chip">⭐ Achieve 80%+ avg score</span>
              <span className="hint-chip">🔥 Build a streak</span>
            </div>
          </div>
        ) : (
          <div className="certificates-grid">
            {certificates.map((cert) => (
              <div key={cert._id} id={`cert-card-${cert._id}`} className="certificate-card" style={{ borderColor: typeColors[cert.type], position: "relative" }}>
                <div className="cert-header">
                  <span className="cert-icon" style={{ background: `${typeColors[cert.type]}20`, color: typeColors[cert.type] }}>
                    {typeIcons[cert.type] || "🏅"}
                  </span>
                  <span className="cert-type" style={{ color: typeColors[cert.type] }}>{cert.type.replace(/-/g, " ")}</span>
                </div>
                <h3 className="cert-title">{cert.title}</h3>
                <p className="cert-desc">{cert.description}</p>
                <div className="cert-footer">
                  <span className="cert-id">ID: {cert.certificateId}</span>
                  <span className="cert-date">{formatDate(cert.createdAt)}</span>
                </div>
                <button 
                  onClick={() => handleDownloadPDF(cert)} 
                  className="btn-outline" 
                  style={{ marginTop: "16px", width: "100%", borderColor: typeColors[cert.type], color: typeColors[cert.type] }}
                  disabled={downloadingCert !== null}
                >
                  {downloadingCert?._id === cert._id ? "⏳ Generating..." : "📥 Download Certificate"}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Hidden template used for high-res PDF generation */}
        {downloadingCert && (
          <CertificateTemplate 
            ref={templateRef}
            studentName={user?.name || "Student"}
            title={downloadingCert.title}
            description={downloadingCert.description}
            certificateId={downloadingCert.certificateId}
            date={downloadingCert.createdAt}
          />
        )}
      </div>
    </div>
  );
};

export default Certificates;
