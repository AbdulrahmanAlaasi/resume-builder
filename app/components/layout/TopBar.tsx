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
    <header style={{
      background: 'var(--surface)', borderBottom: '1px solid var(--border)',
      padding: '0 20px', height: 58, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', flexShrink: 0, zIndex: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Logo. Place the file at public/logo.png — Cloudflare Pages serves it at /logo.png */}
        <img
          src="/logo.png"
          alt="Resume Builder logo"
          width={36}
          height={36}
          style={{ borderRadius: 8, objectFit: 'contain', flexShrink: 0 }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.2 }}>Resume Builder</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>YU Career Center · Student Template</div>
        </div>
      </div>

      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>
        {fileTitle}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div className="mobile-tabs" style={{ display: 'none', gap: 4 }}>
          {(['edit', 'preview'] as const).map((t) => (
            <button
              key={t}
              className={`toptab ${mobileTab === t ? 'active' : ''}`}
              onClick={() => onMobileTabChange(t)}
              type="button"
            >
              {t === 'edit' ? 'Edit' : 'Preview'}
            </button>
          ))}
        </div>
        <button className="btn-ghost" onClick={onReset} type="button">Reset</button>
        <button className="btn-ghost" onClick={onExportDocx} disabled={!!exporting} type="button">
          {exporting === 'docx' ? 'Exporting…' : '📝 Word'}
        </button>
        <button className="btn-primary" onClick={onExportPdf} disabled={!!exporting} type="button">
          {exporting === 'pdf' ? 'Exporting…' : '⬇ PDF'}
        </button>
      </div>
    </header>
  );
}
