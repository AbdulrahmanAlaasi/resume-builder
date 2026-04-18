'use client';
import { useResumeStore } from '../../store/resumeStore';

export default function ContactForm() {
  const { data, updateContact } = useResumeStore();
  const c = data.contact;

  return (
    <div className="fade-in-up">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
          Contact Information
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
          Your basic contact details appear at the top of the resume.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Full Name</label>
          <input className="form-input" placeholder="Ahmed Al-Rashidi" value={c.fullName}
            onChange={(e) => updateContact({ fullName: e.target.value })} />
        </div>
        <div>
          <label className="form-label">Phone Number</label>
          <input className="form-input" placeholder="+966 55 123 4567" value={c.phone}
            onChange={(e) => updateContact({ phone: e.target.value })} />
        </div>
        <div>
          <label className="form-label">Email Address</label>
          <input className="form-input" type="email" placeholder="ahmed@university.edu.sa" value={c.email}
            onChange={(e) => updateContact({ email: e.target.value })} />
        </div>
        <div>
          <label className="form-label">City</label>
          <input className="form-input" placeholder="Riyadh" value={c.city}
            onChange={(e) => updateContact({ city: e.target.value })} />
        </div>
        <div>
          <label className="form-label">Country</label>
          <input className="form-input" placeholder="Saudi Arabia" value={c.country}
            onChange={(e) => updateContact({ country: e.target.value })} />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">LinkedIn Profile URL</label>
          <input className="form-input" placeholder="https://linkedin.com/in/yourprofile" value={c.linkedin}
            onChange={(e) => updateContact({ linkedin: e.target.value })} />
        </div>
      </div>
    </div>
  );
}
