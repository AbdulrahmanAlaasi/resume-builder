'use client';

import { useEffect, useRef } from 'react';

interface Props {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ResetModal({ open, onCancel, onConfirm }: Props) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const cancelRef = useRef<HTMLButtonElement | null>(null);

  // Focus the safe (Cancel) button when the dialog opens.
  useEffect(() => {
    if (open) cancelRef.current?.focus();
  }, [open]);

  // Escape closes; Tab is trapped inside the dialog.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
        return;
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div onClick={onCancel} style={{
      position: 'fixed', inset: 0, background: 'rgba(20,23,43,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 200, backdropFilter: 'blur(4px)',
    }}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-modal-title"
        aria-describedby="reset-modal-desc"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 14, padding: 28, maxWidth: 380, width: '90%', textAlign: 'center',
          boxShadow: '0 24px 64px rgba(20,23,43,0.18)',
        }}
      >
        <div style={{ fontSize: 34, marginBottom: 10 }} aria-hidden>⚠️</div>
        <div id="reset-modal-title" style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>
          Reset all data?
        </div>
        <div id="reset-modal-desc" style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 22, lineHeight: 1.55 }}>
          This will clear your entire resume. This action cannot be undone.
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button ref={cancelRef} className="btn-ghost" onClick={onCancel} type="button">Cancel</button>
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
