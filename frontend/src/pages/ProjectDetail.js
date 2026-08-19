import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Heart } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { apiClient } from '@/lib/apiClient';
import { optimizeCloudinaryUrl } from '@/lib/cloudinary';
import '@/styles/pages.css';

const slugify = (value = '') => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const matchesProjectRoute = (project, routeValue) => {
  if (!project || !routeValue) return false;
  return project.id === routeValue || project.slug === routeValue || slugify(project.title) === routeValue;
};

const rupees = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

export default function ProjectDetail() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadProject = async () => {
      setLoading(true);

      try {
        const directResponse = await apiClient.get(`/projects/${slug}`);
        if (isMounted) {
          setProject(directResponse.data || null);
          setLoading(false);
        }
        return;
      } catch (error) {
        // Older API deployments and older project records may not resolve by a renamed slug.
        // Fall back to the project list and match by id, stored slug, or generated title slug.
      }

      try {
        const listResponse = await apiClient.get('/projects');
        const found = (listResponse.data || []).find((item) => matchesProjectRoute(item, slug));
        if (isMounted) setProject(found || null);
      } catch (error) {
        if (isMounted) setProject(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProject();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading || !project) {
    return (
      <div className="page-shell">
        <Navbar />
        <header className="page-head">
          <div className="page-wrap">
            <Link to="/projects" className="page-crumb">
              <ArrowLeft size={15} aria-hidden="true" /> All projects
            </Link>
            <h1 className="page-title">{loading ? 'Loading…' : 'Project not found'}</h1>
            {!loading && (
              <p className="page-lede">
                This project may have been renamed or retired. Browse everything we are
                running from the projects page.
              </p>
            )}
          </div>
        </header>
        <Footer />
      </div>
    );
  }

  const target = Number(project.target_amount) || 0;
  const raised = Number(project.raised_amount) || 0;
  const progress = target > 0 ? Math.min((raised / target) * 100, 100) : 0;
  const gallery = (project.images || []).filter(Boolean);

  return (
    <div className="page-shell">
      <Navbar />

      <header className="page-head">
        <div className="page-wrap">
          <Link to="/projects" className="page-crumb">
            <ArrowLeft size={15} aria-hidden="true" /> All projects
          </Link>
          {project.category && <p className="page-eyebrow">{project.category}</p>}
          <h1 className="page-title">{project.title}</h1>
        </div>
      </header>

      <main className="page-body">
        <div className="page-wrap">
          {project.hero_image && (
            <div className="detail-hero">
              <img
                src={optimizeCloudinaryUrl(project.hero_image, { width: 1400 })}
                alt={project.title}
                loading="eager"
                decoding="async"
              />
            </div>
          )}

          <div className="detail-layout">
            <div>
              {/* white-space: pre-line in the stylesheet — the stored copy carries
                  its own paragraph breaks, which the previous markup collapsed. */}
              <div className="detail-prose">{project.description}</div>
            </div>

            <aside className="detail-aside">
              <h2>Support this work</h2>
              {target > 0 && (
                <>
                  <div className="detail-meter" role="img" aria-label={`${rupees(raised)} raised of a ${rupees(target)} goal`}>
                    <span style={{ width: `${progress}%` }} />
                  </div>
                  <div className="detail-figures">
                    <div><strong>{rupees(raised)}</strong>Raised</div>
                    <div style={{ textAlign: 'right' }}><strong>{rupees(target)}</strong>Goal</div>
                  </div>
                </>
              )}
              <Link to="/donate" className="btn-primary-clay" style={{ justifyContent: 'center' }}>
                Donate now <Heart size={17} aria-hidden="true" />
              </Link>
            </aside>
          </div>

          {gallery.length > 0 && (
            <>
              <h2 className="detail-section-title">From the field</h2>
              <div className="detail-gallery">
                {gallery.map((image, idx) => (
                  <img
                    key={image}
                    src={optimizeCloudinaryUrl(image, { width: 800 })}
                    alt={`${project.title} — photograph ${idx + 1}`}
                    loading="lazy"
                    decoding="async"
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
