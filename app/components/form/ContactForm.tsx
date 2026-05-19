'use client';
import { useResumeStore } from '../../store/resumeStore';
import { FORM_PLACEHOLDERS as P } from '../../lib/placeholders';

export default function ContactForm() {
  const { data, updateContact } = useResumeStore();
  const c = data.contact;

  return (
    <div className="fade-in-up">
      <p className="form-caption">Your basic contact details appear at the top of the resume.</p>

      <div className="form-grid">
        <div className="full">
          <label className="form-label">Full Name</label>
          <input className="form-input" placeholder={P.contactFullName} value={c.fullName}
            onChange={(e) => updateContact({ fullName: e.target.value })} />
        </div>
        <div>
          <label className="form-label">Phone</label>
          <input className="form-input" placeholder={P.contactPhone} value={c.phone}
            onChange={(e) => updateContact({ phone: e.target.value })} />
        </div>
        <div>
          <label className="form-label">Email</label>
          <input className="form-input" type="email" placeholder={P.contactEmail} value={c.email}
            onChange={(e) => updateContact({ email: e.target.value })} />
        </div>
        <div>
          <label className="form-label">City</label>
          <input className="form-input" placeholder={P.contactCity} value={c.city}
            onChange={(e) => updateContact({ city: e.target.value })} />
        </div>
        <div>
          <label className="form-label">Country</label>
          <input className="form-input" placeholder={P.contactCountry} value={c.country}
            onChange={(e) => updateContact({ country: e.target.value })} />
        </div>
        <div className="full">
          <label className="form-label">LinkedIn URL</label>
          <input className="form-input" placeholder={P.contactLinkedIn} value={c.linkedin}
            onChange={(e) => updateContact({ linkedin: e.target.value })} />
        </div>
      </div>
    </div>
  );
}
