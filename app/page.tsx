'use client';

import { useState, useCallback } from 'react';
import { useResumeStore } from './store/resumeStore';
import { ActiveSection } from './types/resume';
import dynamic from 'next/dynamic';

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

const NAV_ITEMS: { id: ActiveSection; label: string; icon: string }[] = [
  { id: 'contact',        label: 'Contact',        icon: '👤' },
  { id: 'objective',      label: 'Objective',      icon: '🎯' },
  { id: 'education',      label: 'Education',      icon: '🎓' },
  { id: 'skills',         label: 'Skills',         icon: '⚡' },
  { id: 'experience',     label: 'Experience',     icon: '💼' },
  { id: 'projects',       label: 'Projects',       icon: '🚀' },
  { id: 'volunteer',      label: 'Volunteer',      icon: '🤝' },
  { id: 'certifications', label: 'Certifications', icon: '📜' },
  { id: 'extracurricular',label: 'Extracurricular',icon: '🌟' },
];

function FormSection({ active }: { active: ActiveSection }) {
  switch (active) {
    case 'contact':         return <ContactForm />;
    case 'objective':       return <ObjectiveForm />;
    case 'education':       return <EducationForm />;
    case 'skills':          return <SkillsForm />;
    case 'experience':      return <ExperienceForm />;
    case 'projects':        return <ProjectsForm />;
    case 'volunteer':       return <VolunteerForm />;
    case 'certifications':  return <CertificationsForm />;
    case 'extracurricular': return <ExtracurricularForm />;
    default:                return null;
  }
}

export default function Home() {
  const { data, activeSection, setActiveSection, resetData } = useResumeStore();
  const [mobileTab, setMobileTab]   = useState<'form' | 'preview'>('form');
  const [exporting, setExporting]   = useState<null | 'pdf' | 'docx'>(null);
  const [showReset, setShowReset]   = useState(false);
  const [previewScale, setPreviewScale] = useState(0.72);

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

  const currentIdx = NAV_ITEMS.findIndex((n) => n.id === activeSection);

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden' }}>

      {/* ── CREDIT BANNER ── */}
      <div style={{
        background:'linear-gradient(90deg, var(--accent), var(--accent-2))',
        color:'#fff', textAlign:'center', fontSize:12, fontWeight:600,
        padding:'6px 16px', letterSpacing:'0.02em', flexShrink:0,
      }}>
        Built with <span style={{ color:'#ffb4b4' }}>♥</span> by Abdulrahman&nbsp;·&nbsp;Supervised by the Career Center
      </div>

      {/* ── TOP HEADER ── */}
      <header style={{
        background:'var(--surface)', borderBottom:'1px solid var(--border)',
        padding:'0 20px', height:56, display:'flex', alignItems:'center',
        justifyContent:'space-between', flexShrink:0, zIndex:10,
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{
            width:34, height:34, borderRadius:9,
            background:'linear-gradient(135deg, var(--accent), var(--accent-2))',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:17,
          }}>📄</div>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)', lineHeight:1.2 }}>Resume Builder</div>
            <div style={{ fontSize:11, color:'var(--text-muted)' }}>YU Student Template</div>
          </div>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div className="mobile-tabs" style={{
            display:'none', background:'var(--surface-2)',
            border:'1px solid var(--border)', borderRadius:8, padding:3, gap:3,
          }}>
            {(['form','preview'] as const).map((tab) => (
              <button key={tab} onClick={() => setMobileTab(tab)} style={{
                padding:'5px 14px', borderRadius:6, border:'none', fontSize:12,
                fontWeight:600, cursor:'pointer', fontFamily:'inherit',
                background: mobileTab===tab ? 'var(--accent)' : 'transparent',
                color:       mobileTab===tab ? 'white' : 'var(--text-secondary)',
              }}>{tab === 'form' ? 'Edit' : 'Preview'}</button>
            ))}
          </div>

          <button className="btn-ghost" onClick={() => setShowReset(true)} style={{ fontSize:12, padding:'6px 12px' }}>
            Reset
          </button>
          <button onClick={handleExportDOCX} disabled={!!exporting} style={{
            background:'transparent', border:'1.5px solid var(--border)', borderRadius:8,
            padding:'7px 14px', color:'var(--text-secondary)', fontSize:13, fontWeight:600,
            cursor: exporting ? 'wait' : 'pointer', fontFamily:'inherit',
            display:'flex', alignItems:'center', gap:6, transition:'all 0.2s',
          }}>
            {exporting==='docx' ? '⏳ Exporting…' : '📝 Word'}
          </button>
          <button onClick={handleExportPDF} disabled={!!exporting} className="btn-primary"
            style={{ padding:'7px 16px', fontSize:13, display:'flex', alignItems:'center', gap:6 }}>
            {exporting==='pdf' ? '⏳ Exporting…' : '⬇ PDF'}
          </button>
        </div>
      </header>

      {/* ── BODY ── */}
      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

        {/* LEFT SIDEBAR */}
        <aside className="sidebar" style={{
          width:200, background:'var(--surface)', borderRight:'1px solid var(--border)',
          flexShrink:0, overflowY:'auto', padding:'12px 8px',
        }}>
          <div style={{ padding:'0 8px', marginBottom:8 }}>
            <span style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', letterSpacing:'0.1em', textTransform:'uppercase' }}>
              Sections
            </span>
          </div>
          {NAV_ITEMS.map((item) => (
            <button key={item.id}
              className={`nav-tab${activeSection===item.id?' active':''}`}
              onClick={() => setActiveSection(item.id)}
              style={{ width:'100%', textAlign:'left', display:'flex', alignItems:'center', gap:10, padding:'9px 12px', marginBottom:2 }}>
              <span style={{ fontSize:15 }}>{item.icon}</span>
              <span style={{ fontSize:13 }}>{item.label}</span>
            </button>
          ))}

          <div style={{ borderTop:'1px solid var(--border)', margin:'12px 0', paddingTop:12 }}>
            <div style={{ padding:'0 8px 8px', fontSize:10, fontWeight:700, color:'var(--text-muted)', letterSpacing:'0.1em', textTransform:'uppercase' }}>
              Preview Zoom
            </div>
            <div style={{ padding:'0 8px' }}>
              <input type="range" min={40} max={100} value={Math.round(previewScale*100)}
                onChange={(e) => setPreviewScale(Number(e.target.value)/100)}
                style={{ width:'100%', accentColor:'var(--accent)' }} />
              <div style={{ fontSize:11, color:'var(--text-muted)', textAlign:'center' }}>
                {Math.round(previewScale*100)}%
              </div>
            </div>
          </div>
        </aside>

        {/* CENTER FORM */}
        <main className="form-panel" style={{
          flex:'0 0 480px', overflowY:'auto', padding:'28px 28px', borderRight:'1px solid var(--border)',
        }}>
          {/* Progress bar */}
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:28 }}>
            <div style={{ flex:1, height:3, background:'var(--border)', borderRadius:99 }}>
              <div style={{
                height:'100%', borderRadius:99,
                background:'linear-gradient(90deg, var(--accent), var(--accent-2))',
                width:`${((currentIdx+1)/NAV_ITEMS.length)*100}%`,
                transition:'width 0.4s ease',
              }} />
            </div>
            <span style={{ fontSize:11, color:'var(--text-muted)', whiteSpace:'nowrap' }}>
              {currentIdx+1} / {NAV_ITEMS.length}
            </span>
          </div>

          <FormSection active={activeSection} />

          {/* Prev / Next */}
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:32, paddingTop:20, borderTop:'1px solid var(--border)' }}>
            <button className="btn-ghost" disabled={currentIdx===0}
              onClick={() => currentIdx>0 && setActiveSection(NAV_ITEMS[currentIdx-1].id)}
              style={{ opacity: currentIdx===0 ? 0.3 : 1 }}>
              ← {currentIdx>0 ? NAV_ITEMS[currentIdx-1].label : 'Previous'}
            </button>
            <button
              className={currentIdx===NAV_ITEMS.length-1 ? 'btn-primary' : 'btn-ghost'}
              onClick={() => currentIdx < NAV_ITEMS.length-1 && setActiveSection(NAV_ITEMS[currentIdx+1].id)}
              disabled={currentIdx===NAV_ITEMS.length-1}
              style={{ opacity: currentIdx===NAV_ITEMS.length-1 ? 0.4 : 1 }}>
              {currentIdx<NAV_ITEMS.length-1 ? `${NAV_ITEMS[currentIdx+1].label} →` : 'All Done ✓'}
            </button>
          </div>
        </main>

        {/* RIGHT PREVIEW */}
        <div className="preview-panel" style={{
          flex:1, overflowY:'auto', overflowX:'hidden',
          background:'#23283a', display:'flex', flexDirection:'column',
          alignItems:'center', padding:'28px 24px',
        }}>
          <div style={{ marginBottom:14, display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:11, color:'var(--text-muted)', letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:600 }}>
              Live Preview
            </span>
            <span style={{ fontSize:10, color:'var(--text-muted)', background:'var(--surface)', padding:'2px 8px', borderRadius:20, border:'1px solid var(--border)' }}>
              US Letter
            </span>
          </div>

          <div style={{
            transformOrigin:'top center',
            transform:`scale(${previewScale})`,
            boxShadow:'0 10px 80px rgba(0,0,0,0.7), 0 2px 16px rgba(0,0,0,0.5)',
            borderRadius:2,
            marginBottom: previewScale < 1 ? `calc((${previewScale} - 1) * 1056px)` : 0,
          }}>
            <ResumePreview data={data} />
          </div>
        </div>
      </div>

      {/* RESET MODAL */}
      {showReset && (
        <div style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,0.75)',
          display:'flex', alignItems:'center', justifyContent:'center', zIndex:200,
          backdropFilter:'blur(4px)',
        }} onClick={() => setShowReset(false)}>
          <div style={{
            background:'var(--surface-2)', border:'1px solid var(--border)',
            borderRadius:16, padding:32, maxWidth:360, width:'90%', textAlign:'center',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize:38, marginBottom:12 }}>⚠️</div>
            <div style={{ fontSize:18, fontWeight:700, marginBottom:8, color:'var(--text-primary)' }}>Reset all data?</div>
            <div style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:24, lineHeight:1.6 }}>
              This will clear your entire resume. This action cannot be undone.
            </div>
            <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
              <button className="btn-ghost" onClick={() => setShowReset(false)}>Cancel</button>
              <button className="btn-primary" style={{ background:'#ef4444' }}
                onClick={() => { resetData(); setShowReset(false); }}>
                Yes, Reset
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 1100px) {
          .form-panel { flex: 0 0 380px !important; }
        }
        @media (max-width: 900px) {
          .sidebar { display: none !important; }
          .form-panel {
            flex: none !important; width: 100% !important;
            border-right: none !important;
            display: ${mobileTab==='form' ? 'block' : 'none'} !important;
          }
          .preview-panel {
            display: ${mobileTab==='preview' ? 'flex' : 'none'} !important;
            width: 100% !important;
          }
          .mobile-tabs { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
