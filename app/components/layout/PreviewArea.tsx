'use client';

import dynamic from 'next/dynamic';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useResumeStore } from '../../store/resumeStore';

const ResumePreview = dynamic(
  () => import('../preview/ResumePreview'),
  { ssr: false },
);

const PAPER_PX = {
  letter: { w: 8.5 * 96, h: 11 * 96 },
  a4:     { w: 210 * 3.7795275591, h: 297 * 3.7795275591 },
};

const PADDING_X = 24;

interface Props {
  fileTitle: string;
  /** User zoom multiplier (40–100%). Applied on top of the auto-fit scale. */
  zoom: number;
}

/**
 * Auto-fits the resume to the container width via ResizeObserver, then
 * multiplies by the user-controlled `zoom` value. So zoom=100% means
 * "fill the available width"; zoom=70% means "70% of that width".
 */
export default function PreviewArea({ fileTitle, zoom }: Props) {
  const { data, settings, detailPanelOpen } = useResumeStore();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [fitScale, setFitScale] = useState(0.9);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const paper = PAPER_PX[settings.paperSize];

    const recompute = () => {
      const usable = Math.max(0, el.clientWidth - PADDING_X * 2);
      const next = Math.min(1, usable / paper.w);
      setFitScale(Number(next.toFixed(3)));
    };
    recompute();

    const ro = new ResizeObserver(recompute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [settings.paperSize, detailPanelOpen]);

  const scale = fitScale * zoom;
  const paper = PAPER_PX[settings.paperSize];

  return (
    <main
      ref={containerRef}
      className="preview-area"
      style={{
        background: 'var(--preview-bg)', overflowY: 'auto', overflowX: 'hidden',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: `16px ${PADDING_X}px`, minWidth: 0,
      }}
    >
      <div style={{
        fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10,
        display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
      }}>
        <span>{fileTitle}</span>
        <span style={{
          fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
          color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '2px 8px',
          borderRadius: 99, background: 'var(--surface)',
        }}>
          {settings.paperSize === 'a4' ? 'A4' : 'US Letter'}
        </span>
      </div>

      <div style={{
        width:  paper.w * scale,
        height: paper.h * scale,
        flexShrink: 0,
      }}>
        <div style={{
          transformOrigin: 'top left',
          transform: `scale(${scale})`,
          boxShadow: '0 12px 36px rgba(20,23,43,0.10), 0 2px 6px rgba(20,23,43,0.05)',
          borderRadius: 4,
          width: paper.w,
        }}>
          <ResumePreview data={data} settings={settings} />
        </div>
      </div>
    </main>
  );
}
