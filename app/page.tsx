'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useResumeStore } from './store/resumeStore';
import { useConfigStore } from './store/configStore';
import { useYamamerBridge } from './hooks/useYamamerBridge';
import { track, trackPageView } from './lib/analytics';

import CreditBanner from './components/layout/CreditBanner';
import TopBar       from './components/layout/TopBar';
import SectionNav   from './components/layout/SectionNav';
import BuilderPanel from './components/layout/BuilderPanel';
import PreviewArea  from './components/layout/PreviewArea';
import ResetModal   from './components/layout/ResetModal';
import ImportPdfModal from './components/layout/ImportPdfModal';

/**
 * App shell.
 *   [ SectionNav (fixed) | BuilderPanel? | Preview (fills the rest) ]
 *
 * The properties panel was removed at the user's request. The only
 * remaining customisation knobs (density + zoom) now live at the bottom
 * of the SectionNav.
 */
export default function Home() {
  const { data, settings, resetData, detailPanelOpen, loadExample } = useResumeStore();

  // Yamamer iframe bridge — inert when not embedded in an iframe.
  useYamamerBridge();

  // Pull the published template, then record an anonymous page view.
  const loadConfig = useConfigStore((s) => s.loadConfig);
  useEffect(() => {
    void loadConfig().then(() => {
      // A first-time visitor (nothing persisted yet) starts on the published
      // default formatting. Returning students keep whatever they chose.
      const firstVisit = !localStorage.getItem('resume-builder-data');
      if (firstVisit) {
        useResumeStore.getState().updateSettings(useConfigStore.getState().config.defaults);
      }
    });
    trackPageView('builder');
  }, [loadConfig]);

  const [exporting, setExporting] = useState<null | 'pdf' | 'docx'>(null);
  const [showReset, setShowReset] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [zoom, setZoom]           = useState(1.0);
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');

  const fileTitle = useMemo(
    () => data.contact.fullName.trim()
      ? `${data.contact.fullName.trim()} — Resume`
      : 'Untitled Resume',
    [data.contact.fullName],
  );

  const handleExportPDF = useCallback(async () => {
    setExporting('pdf');
    try {
      const { exportToPDF } = await import('./lib/resumePdf');
      const { data: d, settings } = useResumeStore.getState();
      await exportToPDF(d, settings, useConfigStore.getState().config);
      track('export_pdf');
    } finally { setExporting(null); }
  }, []);

  const handleExportDOCX = useCallback(async () => {
    setExporting('docx');
    try {
      const { exportToDOCX } = await import('./lib/exportUtils');
      const { settings }     = useResumeStore.getState();
      await exportToDOCX(data, settings, useConfigStore.getState().config);
      track('export_docx');
    } finally { setExporting(null); }
  }, [data]);

  const cols = [
    '220px',                      // SectionNav (fixed)
    detailPanelOpen && '380px',   // BuilderPanel (form)
    '1fr',                        // Preview
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
        onImportPdf={() => setShowImport(true)}
        onReset={() => setShowReset(true)}
        onExportDocx={handleExportDOCX}
        onExportPdf={handleExportPDF}
        exporting={exporting}
      />

      <div className="body-grid" style={{
        display: 'grid',
        gridTemplateColumns: cols,
        flex: 1, overflow: 'hidden',
      }}>
        <SectionNav zoom={zoom} onZoomChange={setZoom} />
        {detailPanelOpen && <BuilderPanel />}
        <PreviewArea fileTitle={fileTitle} zoom={zoom} />
      </div>

      <ResetModal
        open={showReset}
        onCancel={() => setShowReset(false)}
        onConfirm={() => { resetData(); track('reset_data'); setShowReset(false); }}
      />

      <ImportPdfModal
        open={showImport}
        onCancel={() => setShowImport(false)}
        onImport={(importedData) => {
          loadExample(importedData, settings);
          track('import_pdf');
          setMobileTab('edit');
          setShowImport(false);
        }}
      />

      <style>{`
        @media (max-width: 980px) {
          /*
           * Mobile = drill-down navigation. One full-screen panel at a time:
           *   Edit tab + no section open  → section list
           *   Edit tab + section open     → that section's form (full screen)
           *   Preview tab                 → live preview
           */
          .body-grid {
            grid-template-columns: 1fr !important;
            grid-template-rows: 1fr !important;
          }
          .section-nav-panel  {
            display: ${mobileTab === 'edit' && !detailPanelOpen ? 'flex' : 'none'} !important;
            width: 100% !important;
            min-width: 0 !important;
            border-right: 0 !important;
          }
          .builder-panel {
            display: ${mobileTab === 'edit' && detailPanelOpen ? 'flex' : 'none'} !important;
            width: 100% !important;
            min-width: 0 !important;
            min-height: 0 !important;
            border-right: 0 !important;
          }
          .preview-area {
            display: ${mobileTab === 'preview' ? 'flex' : 'none'} !important;
            min-height: 0 !important;
          }
          .mobile-tabs { display: flex !important; }
          /* The back arrow only makes sense on the mobile drill-down. */
          .builder-back-btn { display: inline-flex !important; }
        }
      `}</style>
    </div>
  );
}
