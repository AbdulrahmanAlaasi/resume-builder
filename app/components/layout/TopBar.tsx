'use client';

interface Props {
  fileTitle: string;
  mobileTab: 'edit' | 'preview';
  onMobileTabChange: (t: 'edit' | 'preview') => void;
  onReset: () => void;
  onExportDocx: () => void;
  onExportPdf: () => void;
  exporting: null | 'pdf' | 'docx';
}

export default function TopBar({
  fileTitle, mobileTab, onMobileTabChange, onReset, onExportDocx, onExportPdf, exporting,
}: Props) {
  return (
    <header className="top-bar" style={{
      background: 'var(--surface)', borderBottom: '1px solid var(--border)',
      padding: '0 20px', height: 58, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', flexShrink: 0, zIndex: 10,
    }}>
      <div className="top-brand" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo32.png" alt="Resu logo" width={36} height={36} style={{ borderRadius: 8, display: 'block' }} />
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.2 }}>Resume Builder</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>YU Career Center · Student Template</div>
        </div>
      </div>

      <div className="top-title" style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>
        {fileTitle}
      </div>

      <div className="top-actions" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div className="mobile-tabs" style={{ display: 'none', gap: 4 }} role="tablist" aria-label="Editor view">
          {(['edit', 'preview'] as const).map((t) => (
            <button
              key={t}
              className={`toptab ${mobileTab === t ? 'active' : ''}`}
              onClick={() => onMobileTabChange(t)}
              type="button"
              role="tab"
              aria-selected={mobileTab === t}
            >
              {t === 'edit' ? 'Edit' : 'Preview'}
            </button>
          ))}
        </div>
        <button className="btn-ghost" onClick={onReset} type="button">Reset</button>
        <button
          className="btn-ghost"
          onClick={onExportDocx}
          disabled={!!exporting}
          type="button"
          aria-label="Export as Word document"
        >
          {exporting === 'docx' ? 'Exporting…' : <><span aria-hidden>📝</span> Word</>}
        </button>
        <button
          className="btn-primary"
          onClick={onExportPdf}
          disabled={!!exporting}
          type="button"
          aria-label="Export as PDF"
        >
          {exporting === 'pdf' ? 'Exporting…' : <><span aria-hidden>⬇</span> PDF</>}
        </button>
      </div>

      {/* Polite live region so screen readers announce export progress. */}
      <div className="sr-only" role="status" aria-live="polite">
        {exporting === 'pdf' ? 'Exporting PDF, please wait'
          : exporting === 'docx' ? 'Exporting Word document, please wait'
          : ''}
      </div>
    </header>
  );
}
