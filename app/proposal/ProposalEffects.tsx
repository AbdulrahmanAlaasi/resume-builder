'use client';

import { useEffect, useRef } from 'react';
import styles from './proposal.module.css';

const SECTION_IDS = ['solution', 'commercial', 'features', 'delivery'];

export default function ProposalEffects() {
  const progressRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('proposal-effects-ready');

    const revealItems = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          (entry.target as HTMLElement).dataset.visible = 'true';
          revealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -9% 0px', threshold: 0.08 },
    );
    revealItems.forEach((item) => revealObserver.observe(item));

    const navLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-proposal-nav]'));
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        navLinks.forEach((link) => {
          link.dataset.active = link.dataset.proposalNav === visible.target.id ? 'true' : 'false';
        });
      },
      { rootMargin: '-18% 0px -62% 0px', threshold: [0.05, 0.2, 0.5] },
    );
    SECTION_IDS.forEach((id) => {
      const section = document.getElementById(id);
      if (section) sectionObserver.observe(section);
    });

    const updateProgress = () => {
      const available = root.scrollHeight - window.innerHeight;
      const progress = available > 0 ? Math.min(1, window.scrollY / available) : 0;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${progress})`;
    };
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);

    return () => {
      revealObserver.disconnect();
      sectionObserver.disconnect();
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
      root.classList.remove('proposal-effects-ready');
    };
  }, []);

  return (
    <div className={styles.scrollProgress} aria-hidden="true">
      <span ref={progressRef} />
    </div>
  );
}
