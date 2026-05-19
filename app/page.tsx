'use client';

import { useCallback, useMemo, useState } from 'react';
import { useResumeStore } from './store/resumeStore';

import CreditBanner     from './components/layout/CreditBanner';
import TopBar           from './components/layout/TopBar';
import BuilderRail      from './components/layout/BuilderRail';
import BuilderPanel     from './components/layout/BuilderPanel';
import PreviewArea      from './components/layout/PreviewArea';
import PropertiesPanel  from './components/layout/PropertiesPanel';
import ResetModal       from './components/layout/ResetModal';

/**
 * App shell. Composition order:
 *   [ Credit banner ]
 *   [ Top bar     ]
 *   [ Rail | BuilderPanel? | Preview | PropertiesPanel? ]
 *
 * Both the BuilderPanel and the PropertiesPanel are togglable.
 * The grid template column list is derived from the open/closed flags so
 * the preview area always claims any freed horizontal space.
 */
export default function Home() {
  const {
    data, resetData,
    builderPanelOpen, toggleBuilderPanel,
    rightPanelOpen,
  } = useResumeStore();

  const [exporting, setExporting]       = useState<null | 'pdf' | 'docx'>(null);
  const [showReset, setShowReset]       = useState(false);
  const [manualScale, setManualScale]   = useState(0.7);
  const [fitMode, setFitMode]           = useState<'fit' | 'manual'>('fit');
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
      const { settings }     = useResumeStore.getState();
      await exportToDOCX(data, settings);
    } finally { setExporting(null); }
  }, [data]);

  // Grid template — derived from which panels are open.
  const cols = [
    '56px',                       // rail (always visible on desktop)
    builderPanelOpen && '340px',  // builder panel
    '1fr',                        // preview
    rightPanelOpen   && '280px',  // properties panel
  ].filter(Boolean).join(' ');

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

      <div
        className="body-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: cols,
          flex: 1, overflow: 'hidden', position: 'relative',
        }}
      >
        <BuilderRail />
        {builderPanelOpen && <BuilderPanel />}

        <div style={{ position: 'relative', display: 'flex', minWidth: 0 }}>
          <PreviewArea
            fileTitle={fileTitle}
            manualScale={manualScale}
            fitMode={fitMode}
          />
          {!builderPanelOpen && (
            <button
              type="button"
              className="reopen-tab left"
              onClick={toggleBuilderPanel}
              aria-label="Show section panel"
              title="Show section panel"
            >›</button>
          )}
          {!rightPanelOpen && (
            <button
              type="button"
              className="reopen-tab right"
              onClick={() => useResumeStore.getState().toggleRightPanel()}
              aria-label="Show properties panel"
              title="Show properties panel"
            >‹ Properties</button>
          )}
        </div>

        {rightPanelOpen && (
          <PropertiesPanel
            manualScale={manualScale}
            onManualScaleChange={setManualScale}
            fitMode={fitMode}
            onFitModeChange={setFitMode}
          />
        )}
      </div>

      <ResetModal
        open={showReset}
        onCancel={() => setShowReset(false)}
        onConfirm={() => { resetData(); setShowReset(false); }}
      />

      <style>{`
        @media (max-width: 980px) {
          .body-grid { grid-template-columns: 1fr !important; }
          .builder-rail   { display: none !important; }
          .builder-panel  { display: ${mobileTab === 'edit' ? 'flex' : 'none'} !important; width: 100% !important; }
          .preview-area   { display: ${mobileTab === 'preview' ? 'flex' : 'none'} !important; }
          .props-panel    { display: none !important; }
          .reopen-tab     { display: none !important; }
          .mobile-tabs    { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
