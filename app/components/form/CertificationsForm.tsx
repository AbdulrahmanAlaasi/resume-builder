'use client';
import { useResumeStore } from '../../store/resumeStore';

export default function CertificationsForm() {
  const { data, updateCertification, addCertification, removeCertification } = useResumeStore();

  return (
    <div className="fade-in-up">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
          Certifications <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 400 }}>(If Applicable)</span>
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
          Workshops, online courses, and professional certifications.
        </p>
      </div>

      {data.certifications.map((cert, i) => (
        <div key={cert.id} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
          <span style={{ color: 'var(--accent)', fontSize: 14, flexShrink: 0 }}>•</span>
          <input className="form-input"
            placeholder="Google Data Analytics Professional Certificate — Coursera (2024)"
            value={cert.text}
            onChange={(e) => updateCertification(cert.id, e.target.value)} />
          {data.certifications.length > 1 && (
            <button className="btn-danger" onClick={() => removeCertification(cert.id)}>✕</button>
          )}
        </div>
      ))}

      <button className="btn-add" onClick={addCertification} style={{ marginTop: 4 }}>+ Add Certification</button>
    </div>
  );
}
