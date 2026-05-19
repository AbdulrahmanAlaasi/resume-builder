'use client';

import { useResumeStore } from '../../store/resumeStore';
import { SECTIONS } from '../../lib/constants';
import type { Density } from '../../types/resume';
import Segmented from '../ui/Segmented';

interface Props {
  zoom: number;
  onZoomChange: (next: number) => void;
}

/**
 * Always-visible left sidebar.
 * Top: list of resume sections (click to open the detail panel beside).
 * Bottom: compact controls — density + preview zoom slider.
 */
export default function SectionNav({ zoom, onZoomChange }: Props) {
  const { activeSection, detailPanelOpen, selectSection, settings, updateSettings } = useResumeStore();

  return (
    <aside className="section-nav-panel">
      <div className="section-nav-head">Resume Sections</div>

      <nav className="section-nav-list">
        {SECTIONS.map(({ id, label }) => {
          const isActive = detailPanelOpen && activeSection === id;
          return (
            <button
              key={id}
              type="button"
              className={`section-nav-btn${isActive ? ' active' : ''}`}
              onClick={() => selectSection(id)}
            >
              <span>{label}</span>
              <span className="section-nav-chevron" aria-hidden>›</span>
            </button>
          );
        })}
      </nav>

      <div className="section-nav-footer">
        <div className="section-nav-footer-label">Density</div>
        <Segmented<Density>
          value={settings.density}
          options={[
            { value: 'compact', label: 'Compact' },
            { value: 'normal',  label: 'Normal'  },
            { value: 'roomy',   label: 'Roomy'   },
          ]}
          onChange={(v) => updateSettings({ density: v })}
        />

        <div className="section-nav-footer-label" style={{ marginTop: 12 }}>
          Preview Zoom
        </div>
        <input
          type="range"
          min={40}
          max={100}
          value={Math.round(zoom * 100)}
          onChange={(e) => onZoomChange(Number(e.target.value) / 100)}
          style={{ width: '100%', accentColor: 'var(--accent)' }}
        />
        <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: -2 }}>
          {Math.round(zoom * 100)}%
        </div>
      </div>
    </aside>
  );
}
