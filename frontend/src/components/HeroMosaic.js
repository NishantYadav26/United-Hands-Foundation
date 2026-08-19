import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { optimizeCloudinaryUrl } from '@/lib/cloudinary';

// Twelve reads as a full wall at every breakpoint we support (6x2, 4x3, 3x4)
// without leaving a ragged final row.
const TILE_COUNT = 12;
const TILE_WIDTH = 420;
// A tile is roughly a sixth of the container on desktop but a third of a phone
// screen, so the phone needs far fewer pixels than the desktop default. Without
// these the wall shipped 420px-wide images to a 125px-wide tile.
const TILE_WIDTHS = [200, 320, 420, 640];

/**
 * The hero photograph wall.
 *
 * Every tile is a real photograph from the gallery, held in teal monochrome.
 * A soft circle of light follows the pointer and restores the photographs
 * underneath it to full colour — the visitor's attention is what brings these
 * lives into focus. That is the whole idea, and it is deliberately the only
 * one: the wall is otherwise still.
 *
 * The effect is two identical grids stacked. The lower one is the muted wall;
 * the upper one is full colour and masked to a circle positioned by
 * `--spot-x` / `--spot-y`. Both grids reference the same image URLs, so the
 * second costs no extra download.
 *
 * Nothing here is interactive in the accessibility sense — the wall is
 * decorative and hidden from assistive technology, and every word and control
 * in the hero lives in real DOM text beside it.
 */
const HeroMosaic = ({ slides = [], fallbackImage }) => {
  const frameRef = useRef(null);
  const rafRef = useRef(0);
  const pendingRef = useRef(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  const tiles = useMemo(() => {
    const pool = slides.filter((slide) => slide?.image_url).map((slide) => slide.image_url);
    if (pool.length === 0) {
      return fallbackImage ? Array.from({ length: TILE_COUNT }, () => fallbackImage) : [];
    }
    // Cycle the gallery so the wall is always full even with only a few photos.
    return Array.from({ length: TILE_COUNT }, (_, i) => pool[i % pool.length]);
  }, [slides, fallbackImage]);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReducedMotion(query.matches);
    apply();
    query.addEventListener('change', apply);
    return () => query.removeEventListener('change', apply);
  }, []);

  // Pointer writes are coalesced into one paint. Setting the custom properties
  // straight from the event fires on every mousemove and needlessly re-runs
  // style resolution several times per frame.
  const flush = useCallback(() => {
    rafRef.current = 0;
    const frame = frameRef.current;
    const next = pendingRef.current;
    if (!frame || !next) return;
    frame.style.setProperty('--spot-x', `${next.x}px`);
    frame.style.setProperty('--spot-y', `${next.y}px`);
  }, []);

  const handlePointerMove = useCallback((event) => {
    // Coarse pointers get the ambient drift defined in CSS instead; letting a
    // touch drag move the light would make it jump to wherever a finger last
    // happened to land and then freeze there.
    if (event.pointerType !== 'mouse') return;
    const frame = frameRef.current;
    if (!frame) return;
    const rect = frame.getBoundingClientRect();
    pendingRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    frame.style.setProperty('--spot-o', '1');
    if (!rafRef.current) rafRef.current = window.requestAnimationFrame(flush);
  }, [flush]);

  const handlePointerLeave = useCallback(() => {
    const frame = frameRef.current;
    if (frame) frame.style.setProperty('--spot-o', '0');
  }, []);

  useEffect(() => () => {
    if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
  }, []);

  if (tiles.length === 0) return null;

  const wall = (variant) => (
    <div className={`hero-wall hero-wall-${variant}`}>
      {tiles.map((url, i) => (
        <div className="hero-tile" key={`${variant}-${i}`}>
          <img
            src={optimizeCloudinaryUrl(url, { width: TILE_WIDTH })}
            srcSet={TILE_WIDTHS.map((w) => `${optimizeCloudinaryUrl(url, { width: w })} ${w}w`).join(', ')}
            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 17vw"
            alt=""
            width="420"
            height="420"
            decoding="async"
            // The wall is the largest thing on the first screen, so it is not
            // deferred; lazy-loading it would delay the largest paint.
            loading="eager"
            draggable="false"
          />
        </div>
      ))}
    </div>
  );

  return (
    <div
      className={`hero-mosaic${reducedMotion ? ' is-still' : ''}`}
      ref={frameRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      aria-hidden="true"
      data-testid="hero-mosaic"
    >
      {wall('base')}
      {!reducedMotion && wall('bloom')}
      <div className="hero-mosaic-scrim" />
    </div>
  );
};

export default HeroMosaic;
