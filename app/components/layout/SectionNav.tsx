'use client';

import { useState, useEffect } from 'react';
import { useResumeStore } from '../../store/resumeStore';
import { SECTIONS } from '../../lib/constants';
import { CV_EXAMPLES } from '../../lib/examples';
import type { Density } from '../../types/resume';
import Segmented from '../ui/Segmented';
import ResumePreview from '../preview/ResumePreview';

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
  const { activeSection, detailPanelOpen, selectSection, settings, updateSettings, loadExample } = useResumeStore();
  const [openExampleId, setOpenExampleId] = useState<string | null>(null);
  const openExample = CV_EXAMPLES.find((example) => example.id === openExampleId);

  // Escape closes the example preview modal.
  useEffect(() => {
    if (!openExampleId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenExampleId(null);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [openExampleId]);
  const densityValue: Density = settings.density === 'compact' ? 'compact' : 'normal';

  /** Up/Down/Home/End arrow navigation across the section buttons. */
  const onNavKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End'];
    if (!keys.includes(e.key)) return;
    const buttons = Array.from(
      e.currentTarget.querySelectorAll<HTMLButtonElement>('.section-nav-btn'),
    );
    const idx = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (idx === -1) return;
    e.preventDefault();
    let next = idx;
    if (e.key === 'ArrowDown') next = (idx + 1) % buttons.length;
    else if (e.key === 'ArrowUp') next = (idx - 1 + buttons.length) % buttons.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = buttons.length - 1;
    buttons[next]?.focus();
  };

  return (
    <aside className="section-nav-panel">
      <div className="section-nav-head">Resume Sections</div>

      <nav className="section-nav-list" aria-label="Resume sections" onKeyDown={onNavKeyDown}>
        {SECTIONS.map(({ id, label }) => {
          const isActive = detailPanelOpen && activeSection === id;
          return (
            <button
              key={id}
              type="button"
              className={`section-nav-btn${isActive ? ' active' : ''}`}
              aria-current={isActive ? 'true' : undefined}
              onClick={() => selectSection(id)}
            >
              <span>{label}</span>
              <span className="section-nav-chevron" aria-hidden>›</span>
            </button>
          );
        })}
      </nav>

      <div className="examples-block">
        <div className="section-nav-footer-label">Examples</div>
        <div className="example-card-list">
          {CV_EXAMPLES.map((example) => (
            <button
              key={example.id}
              type="button"
              className="example-card-btn"
              onClick={() => setOpenExampleId(example.id)}
            >
              <span className="example-card-title">{example.title}</span>
              <span className="example-card-subtitle">{example.subtitle}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="section-nav-footer">
        <div className="section-nav-footer-label">Density</div>
        <Segmented<Density>
          value={densityValue}
          options={[
            { value: 'compact', label: 'Compact' },
            { value: 'normal',  label: 'Normal'  },
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
          aria-label="Preview zoom"
          aria-valuetext={`${Math.round(zoom * 100)} percent`}
          style={{ width: '100%', accentColor: 'var(--accent)' }}
        />
        <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: -2 }}>
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {openExample && (
        <div className="example-modal-backdrop" role="dialog" aria-modal="true" aria-label={`${openExample.title} preview`}>
          <div className="example-modal">
            <div className="example-modal-head">
              <div>
                <div className="example-modal-title">{openExample.title}</div>
                <div className="example-modal-subtitle">{openExample.subtitle}</div>
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setOpenExampleId(null)}
                aria-label="Close example preview"
                title="Close"
              >
                ×
              </button>
            </div>

            <div className="example-preview-area">
              <div className="example-preview-frame">
                <div className="example-preview-paper">
                  <ResumePreview data={openExample.data} settings={openExample.settings} />
                </div>
              </div>
            </div>

            <div className="example-modal-actions">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setOpenExampleId(null)}
              >
                Keep Browsing
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  loadExample(openExample.data, openExample.settings);
                  setOpenExampleId(null);
                }}
              >
                Use This Editable Example
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
