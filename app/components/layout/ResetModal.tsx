'use client';

interface Props {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ResetModal({ open, onCancel, onConfirm }: Props) {
  if (!open) return null;
  return (
    <div onClick={onCancel} style={{
      position: 'fixed', inset: 0, background: 'rgba(20,23,43,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 200, backdropFilter: 'blur(4px)',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 14, padding: 28, maxWidth: 380, width: '90%', textAlign: 'center',
        boxShadow: '0 24px 64px rgba(20,23,43,0.18)',
      }}>
        <div style={{ fontSize: 34, marginBottom: 10 }}>⚠️</div>
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>Reset all data?</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 22, lineHeight: 1.55 }}>
          This will clear your entire resume. This action cannot be undone.
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button className="btn-ghost" onClick={onCancel} type="button">Cancel</button>
          <button
            className="btn-primary"
            style={{ background: 'var(--danger)' }}
            onClick={onConfirm}
            type="button"
          >
            Yes, Reset
          </button>
        </div>
      </div>
    </div>
  );
}
