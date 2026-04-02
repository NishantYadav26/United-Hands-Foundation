import { useEffect } from 'react';

const PILLAR_SELECTOR = '.pillar-card';

const usePillarScrollAnimation = (rerunKey) => {
  useEffect(() => {
    const observedElements = new Set();

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('pillar-show');
            return;
          }

          entry.target.classList.remove('pillar-show');
        });
      },
      {
        threshold: 0.6,
        rootMargin: '0px 0px -100px 0px'
      }
    );

    const registerPillars = () => {
      const pillarElements = Array.from(document.querySelectorAll(PILLAR_SELECTOR));

      pillarElements.forEach((element, index) => {
        element.classList.add('pillar-hidden');
        element.classList.remove('from-left', 'from-right');
        element.classList.add(index % 2 === 0 ? 'from-left' : 'from-right');

        if (observedElements.has(element)) return;
        intersectionObserver.observe(element);
        observedElements.add(element);
      });

      observedElements.forEach((element) => {
        if (document.body.contains(element)) return;
        intersectionObserver.unobserve(element);
        observedElements.delete(element);
      });
    };

    const mutationObserver = new MutationObserver(() => {
      registerPillars();
    });

    registerPillars();
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, [rerunKey]);
};

export default usePillarScrollAnimation;
