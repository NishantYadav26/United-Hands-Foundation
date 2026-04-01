import { useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const SWIPE_THRESHOLD = 40;

const ProjectGalleryLightbox = ({
  open,
  images,
  activeIndex,
  onClose,
  onNext,
  onPrev,
  buttonCenter,
  isEmpty
}) => {
  const overlayRef = useRef(null);
  const panelRef = useRef(null);
  const imageRef = useRef(null);
  const touchStartX = useRef(null);

  const hasImages = useMemo(() => images.length > 0 && !isEmpty, [images.length, isEmpty]);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const ctx = gsap.context(() => {
      gsap.set(overlayRef.current, { opacity: 0 });
      gsap.set(panelRef.current, {
        opacity: 0,
        scale: 0.7,
        transformOrigin: `${buttonCenter.x}px ${buttonCenter.y}px`
      });

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.to(overlayRef.current, { opacity: 1, duration: 0.25 });
      tl.to(panelRef.current, { opacity: 1, scale: 1, duration: 0.45 }, 0);

      if (imageRef.current) {
        tl.fromTo(
          imageRef.current,
          { opacity: 0, scale: 1.2 },
          { opacity: 1, scale: 1, duration: 0.55, ease: 'power2.out' },
          0.08
        );
      }
    });

    const keyHandler = (event) => {
      if (event.key === 'Escape') onClose();
      if (!hasImages) return;
      if (event.key === 'ArrowRight') onNext();
      if (event.key === 'ArrowLeft') onPrev();
    };

    window.addEventListener('keydown', keyHandler);

    return () => {
      window.removeEventListener('keydown', keyHandler);
      ctx.revert();
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose, onNext, onPrev, buttonCenter.x, buttonCenter.y, hasImages]);

  useEffect(() => {
    if (!open || !imageRef.current || !hasImages) return;

    gsap.fromTo(
      imageRef.current,
      { opacity: 0, x: 22, scale: 1.06 },
      {
        opacity: 1,
        x: 0,
        scale: 1,
        duration: 0.38,
        ease: 'power2.out'
      }
    );
  }, [activeIndex, open, hasImages]);

  if (!open || typeof document === 'undefined') return null;

  const onTouchStart = (event) => {
    touchStartX.current = event.touches?.[0]?.clientX ?? null;
  };

  const onTouchEnd = (event) => {
    if (!hasImages || touchStartX.current == null) return;

    const deltaX = (event.changedTouches?.[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;
    if (deltaX < 0) onNext();
    else onPrev();
  };

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[90] bg-black/90 backdrop-blur-md"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={panelRef}
        className="relative h-full w-full p-4 sm:p-8 flex items-center justify-center"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 z-20 rounded-none border border-white/30 bg-black/40 p-2 text-white transition hover:bg-black/70"
          aria-label="Close gallery"
        >
          <X size={22} />
        </button>

        {hasImages ? (
          <>
            <button
              type="button"
              onClick={onPrev}
              className="absolute left-3 sm:left-7 z-20 rounded-none border border-white/30 bg-black/40 p-2 text-white transition hover:bg-black/70"
              aria-label="Previous image"
            >
              <ChevronLeft size={24} />
            </button>

            <div className="w-full max-w-5xl" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
              <img
                key={images[activeIndex]}
                ref={imageRef}
                src={images[activeIndex]}
                alt={`Project gallery slide ${activeIndex + 1}`}
                className="w-full max-h-[78vh] object-contain border border-white/20 rounded-none"
              />
              <p className="mt-4 text-center text-xs tracking-[0.25em] uppercase text-white/70">
                {activeIndex + 1} / {images.length}
              </p>
            </div>

            <button
              type="button"
              onClick={onNext}
              className="absolute right-3 sm:right-7 z-20 rounded-none border border-white/30 bg-black/40 p-2 text-white transition hover:bg-black/70"
              aria-label="Next image"
            >
              <ChevronRight size={24} />
            </button>
          </>
        ) : (
          <div className="mx-auto max-w-xl border border-white/20 bg-black/30 p-8 text-center rounded-none">
            <p className="text-white text-lg tracking-wide">No gallery images found for this project yet.</p>
            <p className="text-white/60 text-sm mt-2">Please check back soon for visual updates.</p>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ProjectGalleryLightbox;
