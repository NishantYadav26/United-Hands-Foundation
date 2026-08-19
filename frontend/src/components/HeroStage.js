import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { optimizeCloudinaryUrl } from '@/lib/cloudinary';

const SLIDE_MS = 6000;
const FADE_MS = 1400;

/**
 * The hero photograph stage.
 *
 * One photograph fills the whole section and cross-fades to the next, drifting
 * very slowly as it holds. The headline never moves; only the image and the
 * caption beneath it change, the way a documentary title sequence works. That
 * is the whole idea — the photographs carry the argument and the type stays out
 * of their way.
 *
 * Every frame is mounted up front and cross-faded by opacity. Swapping a single
 * src would show an empty frame while the next photograph downloaded.
 *
 * Rotation halts on hover, on keyboard focus, and whenever the tab is hidden.
 * Under reduced motion it never starts and the ticks are the only way to move.
 */
const HeroStage = ({ slides = [], fallbackImage, fallbackAlt = '' }) => {
  const [index, setIndex] = useState(0);
  // Seeded from the current visibility: a page opened in a background tab was
  // otherwise left rotating until the first visibilitychange ever fired.
  const [paused, setPaused] = useState(() => typeof document !== 'undefined' && document.hidden);
  const [reducedMotion, setReducedMotion] = useState(false);
  const timerRef = useRef(null);

  // Memoised: the rotation and preload effects depend on this, and rebuilding
  // it each render would restart the timer on every state change, so the stage
  // would never advance.
  const items = useMemo(() => {
    const usable = slides.filter((slide) => slide?.image_url);
    if (usable.length > 0) return usable;
    return fallbackImage
      ? [{ id: 'fallback', image_url: fallbackImage, title: '', description: fallbackAlt }]
      : [];
  }, [slides, fallbackImage, fallbackAlt]);

  const canRotate = items.length > 1 && !reducedMotion && !paused;

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReducedMotion(query.matches);
    apply();
    query.addEventListener('change', apply);
    return () => query.removeEventListener('change', apply);
  }, []);

  // A hidden tab still fires timers, which would burn through the whole gallery
  // while nobody is watching and land the visitor on an arbitrary photograph.
  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const goTo = useCallback((next) => {
    setIndex(((next % items.length) + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (!canRotate) return undefined;
    timerRef.current = setTimeout(() => goTo(index + 1), SLIDE_MS);
    return () => clearTimeout(timerRef.current);
  }, [index, canRotate, goTo]);

  // Fetch the next photograph ahead of time so a crossfade never reveals a
  // half-loaded image.
  useEffect(() => {
    if (items.length < 2) return;
    const next = items[(index + 1) % items.length];
    if (!next?.image_url) return;
    const preload = new Image();
    preload.src = optimizeCloudinaryUrl(next.image_url, { width: 1800 });
  }, [index, items]);

  if (items.length === 0) return null;

  const active = items[index];
  const captionFor = (item) => (item?.title || '').trim();
  const altFor = (item) => item?.description?.trim() || item?.title || fallbackAlt;

  return (
    <div
      className={`hero-stage${reducedMotion ? ' is-still' : ''}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      data-testid="hero-stage"
    >
      <div className="hero-stage-frames" aria-hidden="true">
        {items.map((item, i) => (
          <img
            key={item.id || item.image_url}
            src={optimizeCloudinaryUrl(item.image_url, { width: 1800 })}
            alt=""
            decoding="async"
            loading={i === 0 ? 'eager' : 'lazy'}
            fetchPriority={i === 0 ? "high" : undefined}
            className={`hero-stage-frame${i === index ? ' is-active' : ''}`}
            style={{ transitionDuration: `${FADE_MS}ms` }}
            draggable="false"
          />
        ))}
      </div>

      {/* The photographs are decorative in the markup above so the crossfade
          does not read a stack of alt texts to a screen reader. The visible one
          is described once, here, and updated politely as it changes. */}
      <p className="sr-only" aria-live="polite">{altFor(active)}</p>

      <div className="hero-stage-scrim" aria-hidden="true" />

      {items.length > 1 && (
        <div className="hero-stage-ticks" role="group" aria-label="Choose a photograph">
          {items.map((item, i) => (
            <button
              key={item.id || i}
              type="button"
              className={`hero-stage-tick${i === index ? ' is-active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Show photograph ${i + 1} of ${items.length}`}
              aria-current={i === index}
            />
          ))}
        </div>
      )}

      {captionFor(active) && (
        <p className="hero-stage-caption" data-testid="hero-stage-caption">
          {captionFor(active)}
        </p>
      )}
    </div>
  );
};

export default HeroStage;
