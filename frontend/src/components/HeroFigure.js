import { useCallback, useEffect, useRef, useState } from 'react';
import { optimizeCloudinaryUrl } from '@/lib/cloudinary';

const COUNT_MS = 1900;
const SWAP_MS = 4600;
const FILL_WIDTH = 1400;

// Fast at first and settling slowly, so the number lands rather than stopping.
const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/**
 * The hero's headline figure: the number of lives touched, rendered enormous
 * with the photographs of those lives showing through the digits.
 *
 * The fill is a real photograph clipped to the letterforms. It drifts under the
 * pointer, so the numerals read as windows onto the work rather than as a
 * texture. Two stacked layers cross-fade through the whole gallery, and the
 * incoming photograph is decoded before its layer is faded up so a swap never
 * reveals a half-painted image.
 *
 * The figure is decorative — the same number is published as ordinary text for
 * assistive technology beside it, because a photograph-filled numeral has no
 * dependable contrast ratio.
 */
const HeroFigure = ({ value = 0, photos = [], label = 'Lives touched' }) => {
  // null means the count-up has not begun. Seeding this at 0 instead would
  // make `display || value` fall through to the final figure on the first
  // frame, so the number flashed 11,000 and then restarted from zero.
  const [display, setDisplay] = useState(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  // Two fill layers that alternate. `top` is the one currently at full opacity.
  const [layers, setLayers] = useState({ a: null, b: null, top: 'a' });

  const figureRef = useRef(null);
  const rafRef = useRef(0);
  const pendingRef = useRef(null);
  const countedRef = useRef(false);
  const cursorRef = useRef(0);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReducedMotion(query.matches);
    apply();
    query.addEventListener('change', apply);
    return () => query.removeEventListener('change', apply);
  }, []);

  // Count up once, the first time a real number arrives. Stats load from cache
  // or the API well after first paint, so this cannot run on mount.
  useEffect(() => {
    if (!value || countedRef.current) return undefined;
    countedRef.current = true;

    if (reducedMotion) {
      setDisplay(value);
      return undefined;
    }

    let frame = 0;
    const started = performance.now();
    const step = (now) => {
      const progress = Math.min((now - started) / COUNT_MS, 1);
      setDisplay(Math.round(value * easeOutExpo(progress)));
      if (progress < 1) frame = window.requestAnimationFrame(step);
    };
    frame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frame);
  }, [value, reducedMotion]);

  // Seed the first photograph as soon as the gallery arrives.
  useEffect(() => {
    if (photos.length === 0) return;
    cursorRef.current = 0;
    setLayers({ a: photos[0], b: null, top: 'a' });
  }, [photos]);

  // Cross-fade through the gallery. The next photograph is decoded first, so
  // the layer underneath is never faded up while it is still blank.
  useEffect(() => {
    if (photos.length < 2 || reducedMotion) return undefined;

    let cancelled = false;
    const timer = setInterval(() => {
      const next = photos[(cursorRef.current + 1) % photos.length];
      const swap = () => {
        if (cancelled) return;
        cursorRef.current += 1;
        setLayers((prev) => (prev.top === 'a'
          ? { a: prev.a, b: next, top: 'b' }
          : { a: next, b: prev.b, top: 'a' }));
      };

      const preload = new Image();
      preload.src = optimizeCloudinaryUrl(next, { width: FILL_WIDTH });
      if (preload.decode) {
        // Swap even if decode rejects: a failed decode still leaves the solid
        // base layer visible, which is better than freezing on one photograph.
        preload.decode().then(swap, swap);
      } else {
        preload.onload = swap;
      }
    }, SWAP_MS);

    return () => { cancelled = true; clearInterval(timer); };
  }, [photos, reducedMotion]);

  const flush = useCallback(() => {
    rafRef.current = 0;
    const figure = figureRef.current;
    const next = pendingRef.current;
    if (!figure || !next) return;
    figure.style.setProperty('--drift-x', `${next.x}%`);
    figure.style.setProperty('--drift-y', `${next.y}%`);
  }, []);

  // Parallax is deliberately shallow — a few percent. Any more and the fill
  // slides far enough to show its own edges inside the thinner strokes.
  const handlePointerMove = useCallback((event) => {
    if (event.pointerType !== 'mouse' || reducedMotion) return;
    const figure = figureRef.current;
    if (!figure) return;
    const rect = figure.getBoundingClientRect();
    pendingRef.current = {
      x: (((event.clientX - rect.left) / rect.width) - 0.5) * -9,
      y: (((event.clientY - rect.top) / rect.height) - 0.5) * -9
    };
    if (!rafRef.current) rafRef.current = window.requestAnimationFrame(flush);
  }, [flush, reducedMotion]);

  useEffect(() => () => {
    if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    if (reducedMotion) return undefined;
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [handlePointerMove, reducedMotion]);

  const fillFor = (url) => (url
    ? { backgroundImage: `url(${optimizeCloudinaryUrl(url, { width: FILL_WIDTH })})` }
    : undefined);

  const shown = (display ?? value ?? 0).toLocaleString('en-IN');

  return (
    <div className={`hero-figure${reducedMotion ? ' is-still' : ''}`} ref={figureRef}>
      <div className="hero-figure-stack" aria-hidden="true">
        {/* Solid base layer: if the fill fails to load, or background-clip is
            unsupported, the numeral still reads as clay rather than vanishing. */}
        <span className="hero-figure-digits hero-figure-solid">{shown}</span>
        <span
          className={`hero-figure-digits hero-figure-fill${layers.top === 'a' ? ' is-top' : ''}`}
          style={fillFor(layers.a)}
        >
          {shown}
        </span>
        <span
          className={`hero-figure-digits hero-figure-fill${layers.top === 'b' ? ' is-top' : ''}`}
          style={fillFor(layers.b)}
        >
          {shown}
        </span>
      </div>

      <p className="hero-figure-label" aria-hidden="true">{label}</p>

      {/* The accessible statement of the same fact. */}
      <p className="sr-only">{value.toLocaleString('en-IN')} {label.toLowerCase()}.</p>
    </div>
  );
};

export default HeroFigure;
