'use client';

import { useResumeStore } from '../../store/resumeStore';
import { FONT_CHOICES, ACCENT_CHOICES } from '../../lib/constants';
import type { PaperSize, Density } from '../../types/resume';
import PropsGroup from '../ui/PropsGroup';
import Segmented from '../ui/Segmented';
import Toggle from '../ui/Toggle';

interface Props {
  previewScale: number;
  onPreviewScaleChange: (next: number) => void;
}

export default function PropertiesPanel({ previewScale, onPreviewScaleChange }: Props) {
  const { settings, updateSettings, resetSettings } = useResumeStore();

  return (
    <aside className="props-panel" style={{
      background: 'var(--surface)', borderLeft: '1px solid var(--border)',
      overflowY: 'auto', padding: '20px 18px',
    }}>
      <PropsGroup title="Paper Size">
        <Segmented<PaperSize>
          value={settings.paperSize}
          options={[
            { value: 'letter', label: 'US Letter' },
            { value: 'a4',     label: 'A4' },
          ]}
          onChange={(v) => updateSettings({ paperSize: v })}
        />
      </PropsGroup>

      <PropsGroup title="Density">
        <Segmented<Density>
          value={settings.density}
          options={[
            { value: 'compact', label: 'Compact' },
            { value: 'normal',  label: 'Normal'  },
            { value: 'roomy',   label: 'Roomy'   },
          ]}
          onChange={(v) => updateSettings({ density: v })}
        />
      </PropsGroup>

      <PropsGroup title="Font (Serif Only)">
        <select
          value={settings.fontFamily}
          onChange={(e) => updateSettings({ fontFamily: e.target.value })}
          style={{
            width: '100%', padding: '8px 10px', borderRadius: 8,
            border: '1.5px solid var(--border)', background: 'var(--surface)',
            fontFamily: 'inherit', fontSize: 13, color: 'var(--text-primary)',
          }}
        >
          {FONT_CHOICES.map((f) => (
            <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
              {f.label}
            </option>
          ))}
        </select>
      </PropsGroup>

      <PropsGroup title="Section Heading Color">
        <div className="swatch-row">
          {ACCENT_CHOICES.map((c) => (
            <button
              key={c}
              className={`swatch${settings.accentColor === c ? ' active' : ''}`}
              style={{ background: c }}
              onClick={() => updateSettings({ accentColor: c })}
              aria-label={`Set accent ${c}`}
              type="button"
            />
          ))}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
          Black is the template default.
        </div>
      </PropsGroup>

      <PropsGroup title="Show Horizontal Rules">
        <Toggle
          on={settings.showRules}
          onChange={(next) => updateSettings({ showRules: next })}
          label={settings.showRules ? 'On' : 'Off'}
        />
      </PropsGroup>

      <PropsGroup title="Preview Zoom">
        <input
          type="range" min={40} max={100}
          value={Math.round(previewScale * 100)}
          onChange={(e) => onPreviewScaleChange(Number(e.target.value) / 100)}
          style={{ width: '100%', accentColor: 'var(--accent)' }}
        />
        <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)' }}>
          {Math.round(previewScale * 100)}%
        </div>
      </PropsGroup>

      <button
        className="btn-ghost"
        style={{ width: '100%', marginTop: 8 }}
        onClick={resetSettings}
        type="button"
      >
        Reset to YU defaults
      </button>
    </aside>
  );
}
