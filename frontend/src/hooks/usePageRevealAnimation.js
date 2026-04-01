import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const usePageRevealAnimation = (rerunKey = 0) => {
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return undefined;

    const isSmallScreen = window.matchMedia('(max-width: 768px)').matches;
    const sections = gsap.utils.toArray('.reveal-section');

    if (!sections.length) {
      return undefined;
    }

    const sectionYOffset = isSmallScreen ? 24 : 40;
    const animations = sections.map((section) => gsap.fromTo(
      section,
      { opacity: 0, y: sectionYOffset },
      {
        opacity: 1,
        y: 0,
        duration: isSmallScreen ? 0.72 : 0.95,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 75%',
          toggleActions: 'play none none none',
          once: true,
          invalidateOnRefresh: true
        }
      }
    ));


    const cardAnimations = sections.flatMap((section) => {
      const cards = section.querySelectorAll('.pop-card-lr');

      if (!cards.length) return [];

      return Array.from(cards).map((card, index) => gsap.fromTo(
        card,
        {
          opacity: 0,
          x: index % 2 === 0 ? (isSmallScreen ? -24 : -60) : (isSmallScreen ? 24 : 60),
          y: isSmallScreen ? 10 : 16,
          scale: isSmallScreen ? 0.985 : 0.96
        },
        {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          duration: isSmallScreen ? 0.62 : 0.82,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: isSmallScreen ? 'top 82%' : 'top 76%',
            toggleActions: 'play none none none',
            once: true,
            invalidateOnRefresh: true
          }
        }
      ));
    });

    return () => {
      [...animations, ...cardAnimations].forEach((animation) => {
        animation.scrollTrigger?.kill();
        animation.kill();
      });
    };
  }, [rerunKey]);
};

export default usePageRevealAnimation;
