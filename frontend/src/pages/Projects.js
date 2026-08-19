import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getCached } from '@/lib/apiClient';
import { optimizeCloudinaryUrl } from '@/lib/cloudinary';
import '@/styles/pages.css';

const slugify = (value = '') => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// The API has resolved projects by slug since the routing fix, but older
// records predate it, so fall back the same way ProjectDetail does.
const routeFor = (project) => project.slug || slugify(project.title) || project.id;

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let mounted = true;
    getCached('/projects?active_only=true', { cacheTtlMs: 300000 })
      .then((res) => {
        if (!mounted) return;
        setProjects(Array.isArray(res.data) ? res.data : []);
        setStatus('ready');
      })
      .catch(() => {
        // Previously this collapsed to an empty array, so a failed request was
        // indistinguishable from an organisation running no projects.
        if (!mounted) return;
        setStatus('error');
      });
    return () => { mounted = false; };
  }, []);

  return (
    <div className="page-shell">
      <Navbar />

      <header className="page-head">
        <div className="page-wrap">
          <p className="page-eyebrow">What we do</p>
          <h1 className="page-title">
            Our <em>Work</em>
          </h1>
          <p className="page-lede">
            Long-running programmes carried into the districts of Maharashtra where
            care is hardest to reach — from home-based palliative care to support for
            the elderly.
          </p>
        </div>
      </header>

      <main className="page-body">
        <div className="page-wrap">
          {status === 'loading' && (
            <div className="page-skeleton-grid" aria-label="Loading projects">
              {[0, 1, 2].map((i) => <div key={i} className="page-skeleton" />)}
            </div>
          )}

          {status === 'error' && (
            <p className="page-empty">
              We could not load our projects just now. Please refresh in a moment.
            </p>
          )}

          {status === 'ready' && projects.length === 0 && (
            <p className="page-empty">
              No projects have been published yet. Please check back soon.
            </p>
          )}

          {status === 'ready' && projects.length > 0 && (
            <div className="project-grid" data-testid="projects-grid">
              {projects.map((project) => (
                <article key={project.id} className="project-card" data-testid={`project-${project.id}`}>
                  <div className="project-card-media">
                    {/* Guarded: a project saved without a hero image used to hand
                        the helper undefined and render a broken image icon. */}
                    {project.hero_image && (
                      <img
                        src={optimizeCloudinaryUrl(project.hero_image, { width: 640 })}
                        alt={project.title}
                        width="640"
                        height="427"
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                    {project.category && (
                      <span className="project-card-badge">{project.category}</span>
                    )}
                  </div>

                  <div className="project-card-body">
                    <h2 className="project-card-title">{project.title}</h2>
                    <p className="project-card-text">{project.description}</p>
                    <Link className="project-card-link" to={`/projects/${routeFor(project)}`}>
                      Read more <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
