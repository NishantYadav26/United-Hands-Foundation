import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { optimizeCloudinaryUrl } from '@/lib/cloudinary';

const SLIDE_MS = 5000;
const FADE_MS = 900;

/**
 * Cross-fading slideshow of gallery photographs for the hero.
 *
 * Auto-rotation is content that moves for more than five seconds, so WCAG 2.2.2
 * requires a way to stop it: there is an explicit pause control, and rotation
 * also halts on hover, on keyboard focus, and whenever the tab is hidden. When
 * the visitor prefers reduced motion it never starts at all and the dots become
 * the only way to move between photographs.
 */
const HeroSlideshow = ({ slides = [], fallbackImage, fallbackAlt = '' }) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const timerRef = useRef(null);

  // Memoised because the rotation and preload effects depend on it; rebuilding
  // the array each render would restart the timer on every state change and the
  // slideshow would never advance.
  const items = useMemo(
    () => (slides.length > 0
      ? slides
      : [{ id: 'fallback', image_url: fallbackImage, title: '', description: fallbackAlt }]),
    [slides, fallbackImage, fallbackAlt]
  );

  const canRotate = items.length > 1 && !reducedMotion && !paused && !userPaused;

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReducedMotion(query.matches);
    apply();
    query.addEventListener('change', apply);
    return () => query.removeEventListener('change', apply);
  }, []);

  // A background tab still fires timers, which would burn through every slide
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

  // Fetch the next photograph ahead of time so the crossfade never reveals a
  // half-loaded image.
  useEffect(() => {
    if (items.length < 2) return;
    const next = items[(index + 1) % items.length];
    if (!next?.image_url) return;
    const preload = new Image();
    preload.src = optimizeCloudinaryUrl(next.image_url, { width: 1200 });
  }, [index, items]);

  const captionFor = (item) => item?.title || '';
  const altFor = (item) => item?.description?.trim() || item?.title || fallbackAlt;

  return (
    <div
      className="hero-slideshow"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      role="region"
      aria-label="Photographs from our work"
      data-testid="hero-slideshow"
    >
      {items.map((item, i) => (
        <img
          key={item.id || item.image_url}
          src={optimizeCloudinaryUrl(item.image_url, { width: 1200 })}
          alt={i === index ? altFor(item) : ''}
          width="1200"
          height="900"
          decoding="async"
          loading={i === 0 ? 'eager' : 'lazy'}
          className="hero-slide"
          style={{ opacity: i === index ? 1 : 0, transitionDuration: `${FADE_MS}ms` }}
          aria-hidden={i !== index}
        />
      ))}

      {captionFor(items[index]) && (
        <p className="hero-slide-caption" data-testid="hero-slide-caption">
          {captionFor(items[index])}
        </p>
      )}

      {items.length > 1 && (
        <div className="hero-slide-controls">
          <button
            type="button"
            className="hero-slide-toggle"
            onClick={() => setUserPaused((value) => !value)}
            aria-label={userPaused ? 'Resume slideshow' : 'Pause slideshow'}
            data-testid="hero-slide-toggle"
          >
            {userPaused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
          </button>

          <div className="hero-slide-dots">
            {items.map((item, i) => (
              <button
                key={item.id || i}
                type="button"
                className={`hero-slide-dot${i === index ? ' is-active' : ''}`}
                onClick={() => { setUserPaused(true); goTo(i); }}
                aria-label={`Show photograph ${i + 1} of ${items.length}`}
                aria-current={i === index}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroSlideshow;
