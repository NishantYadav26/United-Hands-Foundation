import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, GraduationCap, Stethoscope, AlertTriangle, HandHeart, Loader2 } from 'lucide-react';
import axios from 'axios';
import ProjectGalleryLightbox from './ProjectGalleryLightbox';

const BACKEND_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_BACKEND_URL || 'https://united-hands-backend.onrender.com';
const API = `${BACKEND_URL}/api`;

const categoryIcons = {
  Elderly: Heart,
  Education: GraduationCap,
  Health: Stethoscope,
  'Disaster Relief': AlertTriangle,
  General: HandHeart
};

const PillarsOfImpact = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingGalleryId, setLoadingGalleryId] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [galleryEmpty, setGalleryEmpty] = useState(false);
  const [buttonCenter, setButtonCenter] = useState(() => ({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0
  }));

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API}/projects?active_only=true`);
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const toNumber = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  };

  const formatNumber = (value) => toNumber(value).toLocaleString();

  const getProgress = (raised, target) => {
    const safeRaised = toNumber(raised);
    const safeTarget = toNumber(target);

    if (safeTarget <= 0) return 0;
    return Math.min((safeRaised / safeTarget) * 100, 100);
  };

  const normalizeImages = (payload) => {
    if (Array.isArray(payload)) {
      return payload
        .map((item) => (typeof item === 'string' ? item : item?.url || item?.image_url || item?.src || ''))
        .filter(Boolean);
    }

    if (Array.isArray(payload?.images)) {
      return payload.images
        .map((item) => (typeof item === 'string' ? item : item?.url || item?.image_url || item?.src || ''))
        .filter(Boolean);
    }

    return [];
  };

  const openGallery = async (event, projectId) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setButtonCenter({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    });

    setLoadingGalleryId(projectId);
    setGalleryEmpty(false);

    try {
      const response = await axios.get(`${API}/projects/${projectId}/images`);
      const urls = normalizeImages(response.data);

      setGalleryImages(urls);
      setGalleryIndex(0);
      setGalleryEmpty(urls.length === 0);
      setLightboxOpen(true);
    } catch (error) {
      console.error('Failed to fetch project gallery:', error);
      setGalleryImages([]);
      setGalleryIndex(0);
      setGalleryEmpty(true);
      setLightboxOpen(true);
    } finally {
      setLoadingGalleryId(null);
    }
  };

  if (loading || projects.length === 0) return null;

  return (
    <>
      <section className="py-20 px-6 reveal-section" data-testid="pillars-section">
        <div className="max-w-7xl mx-auto">
          <h2
            className="text-4xl sm:text-5xl font-medium tracking-tight text-center mb-4"
            style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}
          >
            Our Pillars of <span className="text-gradient-gold">Impact</span>
          </h2>
          <p className="text-center mb-14 text-base" style={{ color: 'var(--text-muted)' }}>
            Choose a cause that resonates with your heart
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => {
              const Icon = categoryIcons[project.category] || HandHeart;
              const raisedAmount = toNumber(project.raised_amount);
              const targetAmount = toNumber(project.target_amount);
              const progress = getProgress(raisedAmount, targetAmount);

              return (
                <div
                  key={project.id}
                  className="card-elevated rounded-lg overflow-hidden hover-lift group pop-card-lr"
                  data-testid={`project-${project.id}`}
                >
                  <div
                    className="h-56 bg-cover bg-center relative"
                    style={{ backgroundImage: project.hero_image ? `url('${project.hero_image}')` : 'none' }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1F2933] to-transparent opacity-70"></div>
                    <div className="absolute bottom-5 left-5">
                      <Icon className="mb-2" style={{ color: '#C6A15B' }} size={28} />
                      <span className="text-xs tracking-[0.2em] uppercase font-bold" style={{ color: '#C6A15B' }}>
                        {project.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-7">
                    <h3
                      className="text-xl font-medium mb-3"
                      style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}
                    >
                      {project.title}
                    </h3>
                    <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-muted)' }}>
                      {project.description}
                    </p>

                    <div className="mb-5">
                      <div className="flex justify-between text-sm mb-2">
                        <span style={{ color: 'var(--text-muted)' }}>
                          ₹{formatNumber(raisedAmount)} raised
                        </span>
                        <span className="font-semibold" style={{ color: 'var(--accent-teal)' }}>
                          {progress.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
                        <div
                          className="h-full transition-all duration-500 rounded-full"
                          style={{ width: `${progress}%`, background: 'linear-gradient(90deg, var(--accent-teal), var(--accent-teal-light))' }}
                        ></div>
                      </div>
                      <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                        Goal: ₹{formatNumber(targetAmount)}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={(event) => openGallery(event, project.id)}
                        disabled={loadingGalleryId === project.id}
                        className="w-full rounded-none border border-[var(--accent-gold)] px-4 py-3 text-xs uppercase tracking-[0.2em] text-[var(--accent-gold)] transition hover:bg-[var(--accent-gold)]/10 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {loadingGalleryId === project.id ? (
                          <span className="inline-flex items-center justify-center gap-2">
                            <Loader2 size={14} className="animate-spin" />
                            Loading
                          </span>
                        ) : (
                          'View Gallery'
                        )}
                      </button>

                      <Link to={`/donate?project=${project.id}`} data-testid={`donate-to-${project.id}`}>
                        <button className="btn-gold w-full text-sm" style={{ padding: '12px 24px' }}>
                          Donate
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <ProjectGalleryLightbox
        open={lightboxOpen}
        images={galleryImages}
        activeIndex={galleryIndex}
        buttonCenter={buttonCenter}
        isEmpty={galleryEmpty}
        onClose={() => setLightboxOpen(false)}
        onNext={() => setGalleryIndex((prev) => (prev + 1) % Math.max(galleryImages.length, 1))}
        onPrev={() => setGalleryIndex((prev) => (prev - 1 + Math.max(galleryImages.length, 1)) % Math.max(galleryImages.length, 1))}
      />
    </>
  );
};

export default PillarsOfImpact;
