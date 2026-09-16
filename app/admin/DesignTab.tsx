'use client';

/**
 * DesignTab — the Word-like formatting editor for the live CV template.
 *
 * Click any line in the CV preview to select that *kind* of line, then format
 * it with the ribbon: font, size, bold, italic, underline, caps, colour,
 * alignment and spacing. This is how Word styles work (Heading 1, Normal…):
 * the CV text itself comes from each student, so formatting is defined per
 * element type and applies everywhere that element appears — on screen, in
 * the PDF and in the Word export.
 */

import { useState } from 'react';
import {
  DEFAULT_TEMPLATE, ELEMENT_KEYS, ELEMENT_LABELS,
  type ElementKey, type ElementStyle, type TemplateConfig,
} from '../lib/siteConfig';
import ResumePreview from '../components/preview/ResumePreview';
import type { ResumeData } from '../types/resume';

interface Props {
  draft: TemplateConfig;
  setDraft: React.Dispatch<React.SetStateAction<TemplateConfig>>;
  sampleData?: ResumeData;
}

const FONT_SIZES = [8, 9, 9.5, 10, 10.5, 11, 12, 13, 14, 16, 18, 20, 24, 28];

const SWATCHES = [
  '#000000', '#1f1f1f', '#3b3b3b', '#1a3a6b', '#0f766e',
  '#9a2540', '#7c5cfc', '#ED7A26', '#b45309', '#166534',
];

/** A square Word-style toggle button. */
function Toggle({ on, onClick, title, children, style }: {
  on: boolean; onClick: () => void; title: string;
  children: React.ReactNode; style?: React.CSSProperties;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={on}
      onClick={onClick}
      style={{
        width: 32, height: 32, display: 'inline-flex', alignItems: 'center',
        justifyContent: 'center', borderRadius: 6, cursor: 'pointer', fontSize: 14,
        border: `1px solid ${on ? 'var(--accent)' : 'var(--border)'}`,
        background: on ? 'var(--accent-glow)' : 'var(--surface)',
        color: on ? 'var(--accent)' : 'var(--text-primary)',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

const barStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
};

function Sep() {
  return <span style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 4px' }} />;
}

export default function DesignTab({ draft, setDraft, sampleData }: Props) {
  const [selected, setSelected] = useState<ElementKey>('sectionHeading');
  const [showPageSetup, setShowPageSetup] = useState(false);

  const el: ElementStyle = draft.elements?.[selected] ?? DEFAULT_TEMPLATE.elements[selected];

  const patch = (p: Partial<ElementStyle>) =>
    setDraft((d) => ({ ...d, elements: { ...d.elements, [selected]: { ...el, ...p } } }));

  const resetElement = () =>
    setDraft((d) => ({
      ...d,
      elements: { ...d.elements, [selected]: { ...DEFAULT_TEMPLATE.elements[selected] } },
    }));

  /** Clicking the CV selects the element type that was clicked. */
  const onPreviewClick = (e: React.MouseEvent) => {
    const hit = (e.target as HTMLElement).closest('[data-el]');
    const key = hit?.getAttribute('data-el') as ElementKey | undefined;
    if (key && (ELEMENT_KEYS as string[]).includes(key)) setSelected(key);
  };

  return (
    <div>
      {/* ---------------- Ribbon ---------------- */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 20, background: 'var(--surface)',
        border: '1px solid var(--border)', borderRadius: 12, padding: 12,
        marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 10,
        boxShadow: '0 2px 10px rgba(20,23,43,0.05)',
      }}>
        <div style={barStyle}>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: 'var(--text-muted)',
          }}>Editing</span>
          <select
            className="form-input"
            value={selected}
            onChange={(e) => setSelected(e.target.value as ElementKey)}
            style={{ width: 230, height: 32, padding: '4px 8px' }}
          >
            {ELEMENT_KEYS.map((k) => (
              <option key={k} value={k}>{ELEMENT_LABELS[k]}</option>
            ))}
          </select>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            …or click any line in the CV below
          </span>
          <button className="btn-ghost" type="button" onClick={resetElement}
            style={{ marginLeft: 'auto', padding: '5px 10px', fontSize: 12 }}>
            Reset this style
          </button>
        </div>

        <div style={barStyle}>
          {/* Font family */}
          <select
            className="form-input"
            value={el.fontFamily}
            onChange={(e) => patch({ fontFamily: e.target.value })}
            style={{ width: 170, height: 32, padding: '4px 8px' }}
            title="Font"
          >
            <option value="">(page font)</option>
            {draft.fontChoices.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>

          {/* Size */}
          <select
            className="form-input"
            value={el.fontSize || 0}
            onChange={(e) => patch({ fontSize: Number(e.target.value) })}
            style={{ width: 92, height: 32, padding: '4px 8px' }}
            title="Font size"
          >
            <option value={0}>Auto</option>
            {FONT_SIZES.map((n) => <option key={n} value={n}>{n} pt</option>)}
          </select>

          <Sep />

          <Toggle on={el.bold} onClick={() => patch({ bold: !el.bold })} title="Bold"
            style={{ fontWeight: 800, fontFamily: 'Georgia, serif' }}>B</Toggle>
          <Toggle on={el.italic} onClick={() => patch({ italic: !el.italic })} title="Italic"
            style={{ fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>I</Toggle>
          <Toggle on={el.underline} onClick={() => patch({ underline: !el.underline })} title="Underline"
            style={{ textDecoration: 'underline', fontFamily: 'Georgia, serif' }}>U</Toggle>
          <Toggle on={el.uppercase} onClick={() => patch({ uppercase: !el.uppercase })}
            title="ALL CAPS" style={{ fontSize: 11, fontWeight: 700 }}>AA</Toggle>

          <Sep />

          {/* Alignment */}
          {([
            ['left', '⯇', 'Align left'],
            ['center', '≡', 'Centre'],
            ['right', '⯈', 'Align right'],
            ['justify', '☰', 'Justify'],
          ] as const).map(([val, glyph, title]) => (
            <Toggle key={val} on={el.align === val} title={title}
              onClick={() => patch({ align: val })}>{glyph}</Toggle>
          ))}

          <Sep />

          {/* Colour */}
          <input
            type="color"
            value={el.color || '#000000'}
            onChange={(e) => patch({ color: e.target.value })}
            title="Text colour"
            style={{
              width: 32, height: 32, padding: 2, borderRadius: 6,
              border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer',
            }}
          />
          {SWATCHES.map((c) => (
            <button key={c} type="button" title={c} aria-label={`Colour ${c}`}
              onClick={() => patch({ color: c })}
              style={{
                width: 18, height: 18, borderRadius: 4, cursor: 'pointer', background: c,
                border: el.color === c ? '2px solid var(--accent)' : '1px solid var(--border)',
              }} />
          ))}
          {el.color && (
            <button className="btn-ghost" type="button" onClick={() => patch({ color: '' })}
              style={{ padding: '4px 8px', fontSize: 11 }} title="Use the inherited colour">
              Auto
            </button>
          )}

          <Sep />

          {/* Spacing */}
          <label style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Before</label>
          <input type="number" min={0} max={40} step={1} value={el.spaceBefore}
            onChange={(e) => patch({ spaceBefore: Number(e.target.value) })}
            className="form-input" style={{ width: 62, height: 32, padding: '4px 6px' }} />
          <label style={{ fontSize: 11, color: 'var(--text-secondary)' }}>After</label>
          <input type="number" min={0} max={40} step={1} value={el.spaceAfter}
            onChange={(e) => patch({ spaceAfter: Number(e.target.value) })}
            className="form-input" style={{ width: 62, height: 32, padding: '4px 6px' }} />
        </div>

        {/* ---------------- Page setup ---------------- */}
        <div>
          <button className="btn-ghost" type="button"
            onClick={() => setShowPageSetup((v) => !v)}
            style={{ padding: '5px 10px', fontSize: 12 }}>
            {showPageSetup ? '▾' : '▸'} Page setup
          </button>

          {showPageSetup && (
            <div style={{ ...barStyle, marginTop: 10 }}>
              <label style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Base font</label>
              <select className="form-input" value={draft.page.fontFamily}
                onChange={(e) => setDraft((d) => ({ ...d, page: { ...d.page, fontFamily: e.target.value } }))}
                style={{ width: 170, height: 32, padding: '4px 8px' }}>
                <option value="">(template default)</option>
                {draft.fontChoices.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>

              <label style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Base size</label>
              <select className="form-input" value={draft.page.fontSize}
                onChange={(e) => setDraft((d) => ({ ...d, page: { ...d.page, fontSize: Number(e.target.value) } }))}
                style={{ width: 92, height: 32, padding: '4px 8px' }}>
                {FONT_SIZES.map((n) => <option key={n} value={n}>{n} pt</option>)}
              </select>

              <label style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Line spacing</label>
              <input type="number" min={1} max={2.5} step={0.02} value={draft.page.lineHeight}
                onChange={(e) => setDraft((d) => ({ ...d, page: { ...d.page, lineHeight: Number(e.target.value) } }))}
                className="form-input" style={{ width: 76, height: 32, padding: '4px 6px' }} />

              <label style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Margins (in)</label>
              <input type="number" min={0.2} max={2} step={0.05} value={draft.page.marginV}
                title="Top / bottom margin"
                onChange={(e) => setDraft((d) => ({ ...d, page: { ...d.page, marginV: Number(e.target.value) } }))}
                className="form-input" style={{ width: 70, height: 32, padding: '4px 6px' }} />
              <input type="number" min={0.2} max={2} step={0.05} value={draft.page.marginH}
                title="Left / right margin"
                onChange={(e) => setDraft((d) => ({ ...d, page: { ...d.page, marginH: Number(e.target.value) } }))}
                className="form-input" style={{ width: 70, height: 32, padding: '4px 6px' }} />

              <label style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Rule</label>
              <input type="color" value={draft.page.ruleColor}
                onChange={(e) => setDraft((d) => ({ ...d, page: { ...d.page, ruleColor: e.target.value } }))}
                style={{ width: 32, height: 32, padding: 2, borderRadius: 6,
                         border: '1px solid var(--border)', background: 'var(--surface)' }} />
              <input type="number" min={0} max={4} step={0.5} value={draft.page.ruleWidth}
                title="Rule thickness (px)"
                onChange={(e) => setDraft((d) => ({ ...d, page: { ...d.page, ruleWidth: Number(e.target.value) } }))}
                className="form-input" style={{ width: 66, height: 32, padding: '4px 6px' }} />
            </div>
          )}
        </div>
      </div>

      {/* ---------------- Clickable CV ---------------- */}
      <div style={{
        background: 'var(--preview-bg)', border: '1px solid var(--border)',
        borderRadius: 12, padding: 20, overflow: 'auto',
      }}>
        {sampleData ? (
          <div
            className="design-preview"
            onClick={onPreviewClick}
            style={{
              width: 816, margin: '0 auto',
              boxShadow: '0 12px 36px rgba(20,23,43,0.12)',
            }}
          >
            <ResumePreview data={sampleData} settings={draft.defaults} />
          </div>
        ) : (
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            No sample CV available to preview.
          </div>
        )}
      </div>

      <p className="form-caption" style={{ marginTop: 12 }}>
        Formatting applies to every line of the selected kind — the CV text itself comes from
        each student. Changes are live in this preview and reach the site, the PDF and the
        Word file when you press <strong>Publish</strong>.
      </p>

      <style>{`
        .design-preview [data-el] { cursor: pointer; }
        .design-preview [data-el]:hover {
          outline: 1px dashed var(--border-strong);
          outline-offset: 2px;
        }
        .design-preview [data-el="${selected}"] {
          outline: 1.5px solid var(--accent);
          outline-offset: 2px;
          background: var(--accent-glow);
        }
      `}</style>
    </div>
  );
}
