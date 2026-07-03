import { useEffect, useRef } from 'react';

const DOT_COUNT = 8;

// Lightweight cursor trail: transform-only updates in one rAF loop,
// disabled on touch devices and for reduced-motion users.
const CursorTrail = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const noHover = window.matchMedia('(hover: none)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (noHover || reducedMotion || !containerRef.current) return;

    const dots = Array.from(containerRef.current.children);
    const positions = dots.map(() => ({ x: -100, y: -100 }));
    let mouseX = -100;
    let mouseY = -100;
    let active = false;
    let rafId;

    const onMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      active = true;
    };

    const tick = () => {
      let targetX = mouseX;
      let targetY = mouseY;
      positions.forEach((p, i) => {
        p.x += (targetX - p.x) * 0.35;
        p.y += (targetY - p.y) * 0.35;
        const scale = (DOT_COUNT - i) / DOT_COUNT;
        dots[i].style.transform = `translate(${p.x - 17}px, ${p.y - 17}px) scale(${scale})`;
        dots[i].style.opacity = active ? String(0.75 * scale) : '0';
        targetX = p.x;
        targetY = p.y;
      });
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  return (
    <div ref={containerRef} aria-hidden="true" data-testid="cursor-trail">
      {Array.from({ length: DOT_COUNT }).map((_, i) => (
        <span key={i} className="cursor-trail-dot" />
      ))}
    </div>
  );
};

export default CursorTrail;
