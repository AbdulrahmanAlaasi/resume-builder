'use client';
import { useResumeStore } from '../../store/resumeStore';
import { FORM_PLACEHOLDERS as P } from '../../lib/placeholders';

export default function CertificationsForm() {
  const { data, updateCertification, addCertification, removeCertification } = useResumeStore();

  return (
    <div className="fade-in-up">
      <p className="form-caption">Workshops, online courses, and professional certifications. Optional.</p>

      {data.certifications.map((cert) => (
        <div key={cert.id} className="row-with-remove">
          <input className="form-input"
            placeholder={P.certificationText}
            value={cert.text}
            onChange={(e) => updateCertification(cert.id, e.target.value)} />
          {data.certifications.length > 1 && (
            <button className="btn-danger" onClick={() => removeCertification(cert.id)} type="button">✕</button>
          )}
        </div>
      ))}

      <button className="btn-add" onClick={addCertification} type="button" style={{ marginTop: 4 }}>+ Add Certification</button>
    </div>
  );
}
