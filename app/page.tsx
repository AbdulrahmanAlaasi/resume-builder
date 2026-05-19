'use client';

import { useCallback, useMemo, useState } from 'react';
import { useResumeStore } from './store/resumeStore';

import CreditBanner     from './components/layout/CreditBanner';
import TopBar           from './components/layout/TopBar';
import BuilderPanel     from './components/layout/BuilderPanel';
import PreviewArea      from './components/layout/PreviewArea';
import PropertiesPanel  from './components/layout/PropertiesPanel';
import ResetModal       from './components/layout/ResetModal';

/**
 * App shell: composes the credit banner, top bar, and the three-column
 * builder layout. All real work lives in the panel components.
 */
export default function Home() {
  const { data, resetData } = useResumeStore();

  const [exporting, setExporting]       = useState<null | 'pdf' | 'docx'>(null);
  const [showReset, setShowReset]       = useState(false);
  const [previewScale, setPreviewScale] = useState(0.7);
  const [mobileTab, setMobileTab]       = useState<'edit' | 'preview'>('edit');

  const fileTitle = useMemo(
    () => data.contact.fullName.trim()
      ? `${data.contact.fullName.trim()} — Resume`
      : 'Untitled Resume',
    [data.contact.fullName],
  );

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

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
      overflow: 'hidden', background: 'var(--bg)',
    }}>
      <CreditBanner />

      <TopBar
        fileTitle={fileTitle}
        mobileTab={mobileTab}
        onMobileTabChange={setMobileTab}
        onReset={() => setShowReset(true)}
        onExportDocx={handleExportDOCX}
        onExportPdf={handleExportPDF}
        exporting={exporting}
      />

      <div className="body-grid" style={{
        display: 'grid', gridTemplateColumns: '320px 1fr 300px',
        flex: 1, overflow: 'hidden',
      }}>
        <BuilderPanel />
        <PreviewArea fileTitle={fileTitle} previewScale={previewScale} />
        <PropertiesPanel
          previewScale={previewScale}
          onPreviewScaleChange={setPreviewScale}
        />
      </div>

      <ResetModal
        open={showReset}
        onCancel={() => setShowReset(false)}
        onConfirm={() => { resetData(); setShowReset(false); }}
      />

      <style>{`
        @media (max-width: 1180px) {
          .body-grid { grid-template-columns: 280px 1fr 260px !important; }
        }
        @media (max-width: 980px) {
          .body-grid { grid-template-columns: 1fr !important; }
          .builder-panel { display: ${mobileTab === 'edit' ? 'flex' : 'none'} !important; }
          .preview-area  { display: ${mobileTab === 'preview' ? 'flex' : 'none'} !important; }
          .props-panel { display: none !important; }
          .mobile-tabs { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
