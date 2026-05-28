import React from 'react';
import { formatDate } from "../utils/helpers";

const CertificateTemplate = React.forwardRef(({ studentName, title, description, certificateId, date }, ref) => {
  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        top: '-9999px',
        left: '-9999px',
        width: '1056px',  // Match your image's aspect ratio/width
        height: '750px',
        fontFamily: "'Inter', sans-serif",
        color: '#0f172a',
        overflow: 'hidden',
        boxSizing: 'border-box',
        backgroundColor: '#fff' // Fallback
      }}
    >
      {/* Background Image Template */}
      <img
        src="/certificate-bg.jpg"
        alt="Certificate Background"
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1, objectFit: 'cover' }}
      />

      {/* Dynamic Text Overlay */}
      <div style={{ position: 'relative', zIndex: 2, width: '100%', height: '100%' }}>

        {/* Student Name */}
        <div style={{
          position: 'absolute',
          top: '310px', // Adjusted to sit properly on the line
          left: '0',
          width: '100%',
          textAlign: 'center',
          fontFamily: "'Great Vibes', cursive",
          fontSize: '60px',
          color: '#0f172a', // Changed to dark black/slate
          letterSpacing: '1px',
          lineHeight: '1'
        }}>
          {studentName}
        </div>

        {/* Course / Achievement Title */}
        <div style={{
          position: 'absolute',
          top: '435px', // Moved up into the gap below "has successfully completed the"
          left: '0',
          width: '100%',
          textAlign: 'center',
          fontFamily: "'Playfair Display', serif",
          fontSize: '34px',
          fontWeight: '700',
          color: '#0f172a',
        }}>
          {title}
        </div>

        {/* Description / Subtext */}
        <div style={{
          position: 'absolute',
          top: '480px', // Adjusted for longer text
          left: '0',
          width: '100%',
          textAlign: 'center',
          fontSize: '13px',
          lineHeight: '1.6',
          color: '#475569',
          padding: '0 180px', // Constrain width to force wrapping into 2-3 lines
          boxSizing: 'border-box'
        }}>
          <span style={{ fontWeight: '600', color: '#0f172a' }}>{description}</span>
        </div>

        {/* Certificate Details (Bottom Left) */}
        <div style={{
          position: 'absolute',
          top: '595px',
          left: '70px',
          textAlign: 'left'
        }}>
          {/* Certificate ID */}
          <div style={{ fontSize: '10px', fontWeight: '700', color: '#0f172a', letterSpacing: '1px', marginBottom: '2px' }}>CERTIFICATE ID</div>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#d4af37', marginBottom: '18px' }}>{certificateId}</div>

          {/* Issued Date */}
          <div style={{ fontSize: '10px', fontWeight: '700', color: '#0f172a', letterSpacing: '1px', marginBottom: '2px' }}>ISSUED ON</div>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>{formatDate(date || new Date())}</div>
        </div>

      </div>
    </div>
  );
});

export default CertificateTemplate;
