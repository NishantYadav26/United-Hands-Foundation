import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const usePageRevealAnimation = (rerunKey = 0) => {
  useEffect(() => {
    const sections = gsap.utils.toArray('.reveal-section');

    if (!sections.length) {
      return undefined;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      gsap.set(sections, { clearProps: 'all' });
      return undefined;
    }

    gsap.set(sections, { autoAlpha: 0, y: 48 });

    const triggers = sections.map((section) => ScrollTrigger.create({
      trigger: section,
      start: 'top 88%',
      end: 'bottom 10%',
      onEnter: () => {
        gsap.to(section, {
          autoAlpha: 1,
          y: 0,
          duration: 0.95,
          ease: 'power3.out',
          overwrite: 'auto'
        });
      },
      onEnterBack: () => {
        gsap.to(section, {
          autoAlpha: 1,
          y: 0,
          duration: 0.75,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      },
      onLeave: () => gsap.set(section, { autoAlpha: 1, y: 0 })
    }));

    ScrollTrigger.refresh();

    return () => {
      triggers.forEach((trigger) => trigger.kill());
      gsap.killTweensOf(sections);
      gsap.set(sections, { clearProps: 'all' });
    };
  }, [rerunKey]);
};

export default usePageRevealAnimation;
