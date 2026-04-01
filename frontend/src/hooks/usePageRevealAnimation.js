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

    const animations = sections.map((section) => gsap.fromTo(
      section,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.95,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 88%',
          toggleActions: 'restart none none reset',
          invalidateOnRefresh: true
        }
      }
    ));

    return () => {
      animations.forEach((animation) => {
        animation.scrollTrigger?.kill();
        animation.kill();
      });
    };
  }, [rerunKey]);
};

export default usePageRevealAnimation;
