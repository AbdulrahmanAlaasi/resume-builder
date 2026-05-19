'use client';

export default function Toggle({ on, onChange, label }: {
  on: boolean;
  onChange: (next: boolean) => void;
  label?: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      {label && (
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
      )}
      <div
        className={`toggle${on ? ' on' : ''}`}
        onClick={() => onChange(!on)}
        role="switch"
        aria-checked={on}
      />
    </div>
  );
}
