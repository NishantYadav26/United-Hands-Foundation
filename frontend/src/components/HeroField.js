import { useEffect, useMemo, useRef, useState } from 'react';
import { optimizeCloudinaryUrl } from '@/lib/cloudinary';

const PRINT_COUNT = 3;
const SWAP_MS = 5200;

/**
 * The hero photograph cluster: three gallery photographs handled as physical
 * prints — cream border, drop shadow, a few degrees of tilt, and the place
 * name written in the bottom margin the way you would label a real print.
 *
 * One print at a time swaps to the next unseen photograph, so the cluster
 * works its way through the whole gallery without ever behaving like a
 * carousel. The incoming image is decoded before the swap, so a print never
 * flashes empty.
 *
 * On a phone the tilt drops to almost nothing and the prints sit in a straight
 * row: a few degrees of rotation that reads as casual at 1400px reads as
 * broken at 375px.
 */
const HeroField = ({ slides = [], fallbackImage }) => {
  const pool = useMemo(() => {
    const usable = slides.filter((slide) => slide?.image_url);
    if (usable.length > 0) return usable;
    return fallbackImage ? [{ id: 'fallback', image_url: fallbackImage, title: '' }] : [];
  }, [slides, fallbackImage]);

  const [prints, setPrints] = useState([]);
  const [reducedMotion, setReducedMotion] = useState(false);
  const cursorRef = useRef(PRINT_COUNT);
  const slotRef = useRef(0);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReducedMotion(query.matches);
    apply();
    query.addEventListener('change', apply);
    return () => query.removeEventListener('change', apply);
  }, []);

  // Seed the cluster as soon as the gallery arrives.
  useEffect(() => {
    if (pool.length === 0) return;
    setPrints(Array.from({ length: PRINT_COUNT }, (_, i) => pool[i % pool.length]));
    cursorRef.current = PRINT_COUNT;
    slotRef.current = 0;
  }, [pool]);

  // Rotate one print at a time. A hidden tab is skipped so the cluster does not
  // race through the gallery while nobody is watching.
  useEffect(() => {
    if (pool.length <= PRINT_COUNT || reducedMotion) return undefined;

    let cancelled = false;
    const timer = setInterval(() => {
      if (document.hidden) return;

      const next = pool[cursorRef.current % pool.length];
      const slot = slotRef.current % PRINT_COUNT;

      const commit = () => {
        if (cancelled) return;
        setPrints((prev) => prev.map((item, i) => (i === slot ? next : item)));
        cursorRef.current += 1;
        slotRef.current += 1;
      };

      const preload = new Image();
      preload.src = optimizeCloudinaryUrl(next.image_url, { width: 720 });
      if (preload.decode) {
        // Commit even if decode rejects — a stuck print is worse than one that
        // falls back to the browser's own loading behaviour.
        preload.decode().then(commit, commit);
      } else {
        preload.onload = commit;
      }
    }, SWAP_MS);

    return () => { cancelled = true; clearInterval(timer); };
  }, [pool, reducedMotion]);

  if (prints.length === 0) return null;

  return (
    <div className="field-prints" aria-hidden="true" data-testid="hero-field-prints">
      {prints.map((item, i) => (
        <figure className={`field-print field-print-${i + 1}`} key={i}>
          <span className="field-print-window">
            <img
              src={optimizeCloudinaryUrl(item.image_url, { width: 720 })}
              alt=""
              decoding="async"
              loading={i === 0 ? 'eager' : 'lazy'}
              fetchPriority={i === 0 ? 'high' : undefined}
              draggable="false"
            />
          </span>
          {item.title && <figcaption>{item.title}</figcaption>}
        </figure>
      ))}
    </div>
  );
};

export default HeroField;
