'use client';

import dynamic from 'next/dynamic';
import { useResumeStore } from '../../store/resumeStore';

const ResumePreview = dynamic(
  () => import('../preview/ResumePreview'),
  { ssr: false },
);

interface Props {
  fileTitle: string;
  previewScale: number;
}

export default function PreviewArea({ fileTitle, previewScale }: Props) {
  const { data, settings } = useResumeStore();

  return (
    <main className="preview-area" style={{
      background: 'var(--preview-bg)', overflowY: 'auto',
      display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 24px',
    }}>
      <div style={{
        fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14,
        display: 'flex', alignItems: 'center', gap: 8,
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
        transformOrigin: 'top center',
        transform: `scale(${previewScale})`,
        boxShadow: '0 16px 48px rgba(20,23,43,0.12), 0 2px 8px rgba(20,23,43,0.06)',
        borderRadius: 4,
        marginBottom: previewScale < 1 ? `calc((${previewScale} - 1) * 1056px)` : 0,
      }}>
        <ResumePreview data={data} settings={settings} />
      </div>
    </main>
  );
}
