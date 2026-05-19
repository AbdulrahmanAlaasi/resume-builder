'use client';

/**
 * Career Center credit strip shown at the very top of the app shell.
 * Not printed on exported resumes.
 */
export default function CreditBanner() {
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
      Built with <span style={{ color: '#ffd1d1' }}>♥</span> by Abdulrahman Alaasi&nbsp;·&nbsp;Supervised by the Career Center at YU
    </div>
  );
}
