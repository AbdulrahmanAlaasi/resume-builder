'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useResumeStore } from './store/resumeStore';
import { ActiveSection, PaperSize, Density } from './types/resume';

import ContactForm from './components/form/ContactForm';
import ObjectiveForm from './components/form/ObjectiveForm';
import EducationForm from './components/form/EducationForm';
import SkillsForm from './components/form/SkillsForm';
import ExperienceForm from './components/form/ExperienceForm';
import ProjectsForm from './components/form/ProjectsForm';
import VolunteerForm from './components/form/VolunteerForm';
import CertificationsForm from './components/form/CertificationsForm';
import ExtracurricularForm from './components/form/ExtracurricularForm';

const ResumePreview = dynamic(() => import('./components/preview/ResumePreview'), { ssr: false });

const SECTIONS: { id: ActiveSection; label: string; component: React.ComponentType }[] = [
  { id: 'contact',         label: 'Contact Information', component: ContactForm },
  { id: 'objective',       label: 'Objective',           component: ObjectiveForm },
  { id: 'education',       label: 'Education',           component: EducationForm },
  { id: 'skills',          label: 'Skills',              component: SkillsForm },
  { id: 'experience',      label: 'Work Experience',     component: ExperienceForm },
  { id: 'projects',        label: 'Projects',            component: ProjectsForm },
  { id: 'volunteer',       label: 'Volunteer Leadership',component: VolunteerForm },
  { id: 'certifications',  label: 'Certifications',      component: CertificationsForm },
  { id: 'extracurricular', label: 'Extracurricular',     component: ExtracurricularForm },
];

const FONT_CHOICES = [
  { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { label: 'Georgia',         value: 'Georgia, "Times New Roman", serif' },
  { label: 'Garamond',        value: '"EB Garamond", Garamond, serif' },
  { label: 'Cambria',         value: 'Cambria, Georgia, serif' },
];

const ACCENT_CHOICES = ['#000000', '#1a3a6b', '#4f6ef7', '#7c5cfc', '#0f766e', '#9a2540'];

export default function Home() {
  const {
    data, settings, expandedSections, toggleSection,
    resetData, updateSettings, resetSettings,
  } = useResumeStore();

  const [topTab, setTopTab]         = useState<'builder' | 'templates'>('builder');
  const [exporting, setExporting]   = useState<null | 'pdf' | 'docx'>(null);
  const [showReset, setShowReset]   = useState(false);
  const [previewScale, setPreviewScale] = useState(0.7);
  const [mobileTab, setMobileTab]   = useState<'edit' | 'preview'>('edit');

  const handleExportPDF = useCallback(async () => {
    setExporting('pdf');
    try {
      const { exportToPDF } = await import('./lib/exportUtils');
      await exportToPDF();
    } finally { setExporting(null); }
  }, []);

  const handleExportDOCX = useCallback(async () => {
    setExporting('docx');
    try {
      const { exportToDOCX } = await import('./lib/exportUtils');
      await exportToDOCX(data);
    } finally { setExporting(null); }
  }, [data]);

  const fileTitle = data.contact.fullName.trim()
    ? `${data.contact.fullName.trim()} — Resume`
    : 'Untitled Resume';

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden', background:'var(--bg)' }}>

      {/* ── CREDIT BANNER ── */}
      <div style={{
        background:'linear-gradient(90deg, var(--accent), var(--accent-2))',
        color:'#fff', textAlign:'center', fontSize:12, fontWeight:600,
        padding:'6px 16px', letterSpacing:'0.02em', flexShrink:0,
      }}>
        Built with <span style={{ color:'#ffd1d1' }}>♥</span> by Abdulrahman&nbsp;·&nbsp;Supervised by the Career Center
      </div>

      {/* ── HEADER ── */}
      <header style={{
        background:'var(--surface)', borderBottom:'1px solid var(--border)',
        padding:'0 20px', height:58, display:'flex', alignItems:'center',
        justifyContent:'space-between', flexShrink:0, zIndex:10,
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{
            width:34, height:34, borderRadius:9,
            background:'linear-gradient(135deg, var(--accent), var(--accent-2))',
            display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700,
          }}>R</div>
          <div>
            <div style={{ fontSize:15, fontWeight:700, lineHeight:1.2 }}>Resume Builder</div>
            <div style={{ fontSize:11, color:'var(--text-muted)' }}>YU Career Center · Student Template</div>
          </div>
        </div>

        <div style={{ fontSize:14, fontWeight:500, color:'var(--text-secondary)' }}>
          {fileTitle}
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div className="mobile-tabs" style={{ display:'none', gap:4 }}>
            {(['edit','preview'] as const).map((t) => (
              <button key={t} className={`toptab ${mobileTab===t?'active':''}`} onClick={() => setMobileTab(t)}>
                {t === 'edit' ? 'Edit' : 'Preview'}
              </button>
            ))}
          </div>
          <button className="btn-ghost" onClick={() => setShowReset(true)}>Reset</button>
          <button className="btn-ghost" onClick={handleExportDOCX} disabled={!!exporting}>
            {exporting==='docx' ? 'Exporting…' : '📝 Word'}
          </button>
          <button className="btn-primary" onClick={handleExportPDF} disabled={!!exporting}>
            {exporting==='pdf' ? 'Exporting…' : '⬇ PDF'}
          </button>
        </div>
      </header>

      {/* ── BODY (3 columns) ── */}
      <div style={{ display:'grid', gridTemplateColumns:'320px 1fr 300px', flex:1, overflow:'hidden' }} className="body-grid">

        {/* LEFT — Builder accordion */}
        <aside className="builder-panel" style={{
          background:'var(--surface)', borderRight:'1px solid var(--border)',
          overflowY:'auto', display:'flex', flexDirection:'column',
        }}>
          <div style={{ padding:'16px 16px 12px' }}>
            <div className="toptab-group">
              <button className={`toptab ${topTab==='builder'?'active':''}`} onClick={() => setTopTab('builder')}>Builder</button>
              <button className={`toptab ${topTab==='templates'?'active':''}`} onClick={() => setTopTab('templates')}>Templates</button>
            </div>
          </div>

          {topTab === 'builder' ? (
            <div style={{ flex:1 }}>
              {SECTIONS.map(({ id, label, component: FormComp }) => {
                const open = expandedSections.includes(id);
                return (
                  <div className="accordion-item" key={id}>
                    <button
                      className={`accordion-trigger${open?' active':''}`}
                      onClick={() => toggleSection(id)}
                      aria-expanded={open}
                    >
                      <span>{label}</span>
                      <span className={`accordion-chevron${open?' open':''}`}>+</span>
                    </button>
                    {open && (
                      <div className="accordion-body fade-in-up">
                        <FormComp />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ padding:24, color:'var(--text-secondary)', fontSize:13, lineHeight:1.6 }}>
              <div style={{ fontWeight:600, color:'var(--text-primary)', marginBottom:6 }}>YU Student Template</div>
              <p style={{ margin:0 }}>
                This builder currently ships only the official YU Career Center template. Additional approved templates may be added by the Career Center in future updates.
              </p>
            </div>
          )}
        </aside>

        {/* CENTER — Preview */}
        <main className="preview-area" style={{
          background:'var(--preview-bg)', overflowY:'auto',
          display:'flex', flexDirection:'column', alignItems:'center', padding:'28px 24px',
        }}>
          <div style={{
            fontSize:13, color:'var(--text-secondary)', marginBottom:14,
            display:'flex', alignItems:'center', gap:8,
          }}>
            <span>{fileTitle}</span>
            <span style={{
              fontSize:10, fontWeight:600, letterSpacing:'0.05em', textTransform:'uppercase',
              color:'var(--text-muted)', border:'1px solid var(--border)', padding:'2px 8px',
              borderRadius:99, background:'var(--surface)',
            }}>
              {settings.paperSize === 'a4' ? 'A4' : 'US Letter'}
            </span>
          </div>

          <div style={{
            transformOrigin:'top center',
            transform:`scale(${previewScale})`,
            boxShadow:'0 16px 48px rgba(20,23,43,0.12), 0 2px 8px rgba(20,23,43,0.06)',
            borderRadius:4,
            marginBottom: previewScale < 1 ? `calc((${previewScale} - 1) * 1056px)` : 0,
          }}>
            <ResumePreview data={data} settings={settings} />
          </div>
        </main>

        {/* RIGHT — Properties panel */}
        <aside className="props-panel" style={{
          background:'var(--surface)', borderLeft:'1px solid var(--border)',
          overflowY:'auto', padding:'20px 18px',
        }}>
          <PropsGroup title="Paper Size">
            <Segmented<PaperSize>
              value={settings.paperSize}
              options={[{ value:'letter', label:'US Letter' }, { value:'a4', label:'A4' }]}
              onChange={(v) => updateSettings({ paperSize: v })}
            />
          </PropsGroup>

          <PropsGroup title="Density">
            <Segmented<Density>
              value={settings.density}
              options={[
                { value:'compact', label:'Compact' },
                { value:'normal',  label:'Normal'  },
                { value:'roomy',   label:'Roomy'   },
              ]}
              onChange={(v) => updateSettings({ density: v })}
            />
          </PropsGroup>

          <PropsGroup title="Font (Serif Only)">
            <select
              value={settings.fontFamily}
              onChange={(e) => updateSettings({ fontFamily: e.target.value })}
              style={{
                width:'100%', padding:'8px 10px', borderRadius:8,
                border:'1.5px solid var(--border)', background:'var(--surface)',
                fontFamily:'inherit', fontSize:13, color:'var(--text-primary)',
              }}>
              {FONT_CHOICES.map((f) => (
                <option key={f.value} value={f.value} style={{ fontFamily:f.value }}>{f.label}</option>
              ))}
            </select>
          </PropsGroup>

          <PropsGroup title="Section Heading Color">
            <div className="swatch-row">
              {ACCENT_CHOICES.map((c) => (
                <button
                  key={c}
                  className={`swatch${settings.accentColor===c?' active':''}`}
                  style={{ background:c }}
                  onClick={() => updateSettings({ accentColor: c })}
                  aria-label={`Set accent ${c}`}
                />
              ))}
            </div>
            <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:6 }}>
              Black is the template default.
            </div>
          </PropsGroup>

          <PropsGroup title="Show Horizontal Rules">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontSize:13, color:'var(--text-secondary)' }}>
                {settings.showRules ? 'On' : 'Off'}
              </span>
              <div
                className={`toggle${settings.showRules?' on':''}`}
                onClick={() => updateSettings({ showRules: !settings.showRules })}
                role="switch"
                aria-checked={settings.showRules}
              />
            </div>
          </PropsGroup>

          <PropsGroup title="Preview Zoom">
            <input
              type="range" min={40} max={100}
              value={Math.round(previewScale*100)}
              onChange={(e) => setPreviewScale(Number(e.target.value)/100)}
              style={{ width:'100%', accentColor:'var(--accent)' }}
            />
            <div style={{ textAlign:'center', fontSize:11, color:'var(--text-muted)' }}>
              {Math.round(previewScale*100)}%
            </div>
          </PropsGroup>

          <button className="btn-ghost" style={{ width:'100%', marginTop:8 }} onClick={resetSettings}>
            Reset to YU defaults
          </button>
        </aside>
      </div>

      {/* RESET MODAL */}
      {showReset && (
        <div onClick={() => setShowReset(false)} style={{
          position:'fixed', inset:0, background:'rgba(20,23,43,0.45)',
          display:'flex', alignItems:'center', justifyContent:'center',
          zIndex:200, backdropFilter:'blur(4px)',
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background:'var(--surface)', border:'1px solid var(--border)',
            borderRadius:14, padding:28, maxWidth:380, width:'90%', textAlign:'center',
            boxShadow:'0 24px 64px rgba(20,23,43,0.18)',
          }}>
            <div style={{ fontSize:34, marginBottom:10 }}>⚠️</div>
            <div style={{ fontSize:17, fontWeight:700, marginBottom:6 }}>Reset all data?</div>
            <div style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:22, lineHeight:1.55 }}>
              This will clear your entire resume. This action cannot be undone.
            </div>
            <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
              <button className="btn-ghost" onClick={() => setShowReset(false)}>Cancel</button>
              <button className="btn-primary" style={{ background:'var(--danger)' }}
                onClick={() => { resetData(); setShowReset(false); }}>
                Yes, Reset
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 1180px) {
          .body-grid { grid-template-columns: 280px 1fr 260px !important; }
        }
        @media (max-width: 980px) {
          .body-grid { grid-template-columns: 1fr !important; }
          .builder-panel { display: ${mobileTab==='edit' ? 'flex' : 'none'} !important; }
          .preview-area  { display: ${mobileTab==='preview' ? 'flex' : 'none'} !important; }
          .props-panel { display: none !important; }
          .mobile-tabs { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

/* ── helper components ── */

function PropsGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{
        fontSize:10, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase',
        color:'var(--text-muted)', marginBottom:8,
      }}>{title}</div>
      {children}
    </div>
  );
}

function Segmented<T extends string>({
  value, options, onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="segmented">
      {options.map((o) => (
        <button
          key={o.value}
          className={value === o.value ? 'active' : ''}
          onClick={() => onChange(o.value)}
        >{o.label}</button>
      ))}
    </div>
  );
}
