'use client';

import { useConfigStore } from '../../store/configStore';

/**
 * Career Center credit strip shown at the very top of the app shell.
 * Wording and link are editable from /admin. Not printed on exported resumes.
 */
export default function CreditBanner() {
  const b = useConfigStore((s) => s.config.branding);
  return (
    <div style={{
      background: 'linear-gradient(90deg, var(--accent), var(--accent-2))',
      color: '#fff',
      textAlign: 'center',
      fontSize: 12,
      fontWeight: 600,
      padding: '6px 16px',
      letterSpacing: '0.02em',
      flexShrink: 0,
    }}>
      {b.creditPrefix} <span style={{ color: '#ffd1d1' }}>♥</span> by{' '}
      <a
        href={b.creditUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: '#fff', textDecoration: 'underline', textUnderlineOffset: 2 }}
      >
        {b.creditName}
      </a>
      &nbsp;·&nbsp;{b.creditSuffix}
    </div>
  );
}
