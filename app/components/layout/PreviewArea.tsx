'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { useResumeStore } from '../../store/resumeStore';

const ResumePreview = dynamic(
  () => import('../preview/ResumePreview'),
  { ssr: false },
);

const PAPER_PX = {
  letter: { w: 8.5 * 96, h: 11 * 96 },
  a4:     { w: 210 * 3.7795275591, h: 297 * 3.7795275591 },
};

interface Props {
  fileTitle: string;
  /** Manual scale multiplier when fitMode === 'manual'. */
  manualScale: number;
  /** 'fit' = auto-scale to container width. 'manual' = use manualScale. */
  fitMode: 'fit' | 'manual';
}

export default function PreviewArea({ fileTitle, manualScale, fitMode }: Props) {
  const { data, settings } = useResumeStore();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [fitScale, setFitScale] = useState(0.7);

  useEffect(() => {
    if (fitMode !== 'fit' || !containerRef.current) return;
    const el = containerRef.current;
    const paper = PAPER_PX[settings.paperSize];
    const recompute = () => {
      // 48px horizontal breathing room.
      const usable = Math.max(0, el.clientWidth - 48);
      const next = Math.min(1, usable / paper.w);
      setFitScale(Number(next.toFixed(3)));
    };
    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fitMode, settings.paperSize]);

  const scale = fitMode === 'fit' ? fitScale : manualScale;
  const paper = PAPER_PX[settings.paperSize];

  return (
    <main
      ref={containerRef}
      className="preview-area"
      style={{
        background: 'var(--preview-bg)', overflowY: 'auto', overflowX: 'hidden',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '20px 24px', minWidth: 0,
      }}
    >
      <div style={{
        fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14,
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
        <span style={{
          fontSize: 10, color: 'var(--text-muted)', marginLeft: 4,
        }}>
          {Math.round(scale * 100)}%
        </span>
      </div>

      {/* Outer box reserves scaled height so scrolling/centering works correctly. */}
      <div style={{
        width:  paper.w * scale,
        height: paper.h * scale,
        flexShrink: 0,
      }}>
        <div style={{
          transformOrigin: 'top left',
          transform: `scale(${scale})`,
          boxShadow: '0 16px 48px rgba(20,23,43,0.10), 0 2px 8px rgba(20,23,43,0.05)',
          borderRadius: 4,
          width: paper.w,
        }}>
          <ResumePreview data={data} settings={settings} />
        </div>
      </div>
    </main>
  );
}
