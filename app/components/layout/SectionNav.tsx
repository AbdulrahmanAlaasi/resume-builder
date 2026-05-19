'use client';

import { useResumeStore } from '../../store/resumeStore';
import { SECTIONS } from '../../lib/constants';

/**
 * Always-visible left sidebar listing every resume section.
 * Clicking a section opens (or toggles) the DetailPanel beside it.
 * Not collapsible — by design.
 */
export default function SectionNav() {
  const { activeSection, detailPanelOpen, selectSection } = useResumeStore();

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
    </aside>
  );
}
