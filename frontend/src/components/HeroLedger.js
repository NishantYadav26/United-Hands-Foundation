import { useEffect, useMemo, useRef, useState } from 'react';
import { optimizeCloudinaryUrl } from '@/lib/cloudinary';

const SWAP_MS = 6500;
const STRIP_WIDTH = 900;

/**
 * The ledger hero's photograph — a single tall column of image against the
 * printed ground, cross-fading slowly through the gallery.
 *
 * Deliberately one photograph at a time and nothing else. This direction earns
 * its weight from typography and the ruled figures beneath it; a grid or a
 * carousel here would pull against that.
 *
 * Two layers alternate so the fade has something to fade between, and the
 * incoming image is decoded first so a swap never shows a blank column.
 */
const HeroLedger = ({ slides = [], fallbackImage }) => {
  const photos = useMemo(() => {
    const usable = slides.map((slide) => slide?.image_url).filter(Boolean);
    return usable.length > 0 ? usable : (fallbackImage ? [fallbackImage] : []);
  }, [slides, fallbackImage]);

  const [layers, setLayers] = useState({ a: null, b: null, top: 'a' });
  const [reducedMotion, setReducedMotion] = useState(false);
  const cursorRef = useRef(0);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReducedMotion(query.matches);
    apply();
    query.addEventListener('change', apply);
    return () => query.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    if (photos.length === 0) return;
    cursorRef.current = 0;
    setLayers({ a: photos[0], b: null, top: 'a' });
  }, [photos]);

  useEffect(() => {
    if (photos.length < 2 || reducedMotion) return undefined;

    let cancelled = false;
    const timer = setInterval(() => {
      // A hidden tab would otherwise burn through the gallery unseen.
      if (document.hidden) return;

      const next = photos[(cursorRef.current + 1) % photos.length];
      const commit = () => {
        if (cancelled) return;
        cursorRef.current += 1;
        setLayers((prev) => (prev.top === 'a'
          ? { a: prev.a, b: next, top: 'b' }
          : { a: next, b: prev.b, top: 'a' }));
      };

      const preload = new Image();
      preload.src = optimizeCloudinaryUrl(next, { width: STRIP_WIDTH });
      if (preload.decode) {
        // Commit even on a rejected decode; a frozen column is worse.
        preload.decode().then(commit, commit);
      } else {
        preload.onload = commit;
      }
    }, SWAP_MS);

    return () => { cancelled = true; clearInterval(timer); };
  }, [photos, reducedMotion]);

  if (photos.length === 0) return null;

  const layer = (which) => (layers[which] ? (
    <span
      className={`ledger-strip-layer${layers.top === which ? ' is-top' : ''}`}
      style={{ backgroundImage: `url(${optimizeCloudinaryUrl(layers[which], { width: STRIP_WIDTH })})` }}
    />
  ) : null);

  return (
    <div className="ledger-strip" aria-hidden="true" data-testid="hero-ledger-strip">
      {layer('a')}
      {layer('b')}
    </div>
  );
};

export default HeroLedger;
