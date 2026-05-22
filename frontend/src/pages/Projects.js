import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getCached } from '@/lib/apiClient';
import { optimizeCloudinaryUrl } from '@/lib/cloudinary';

const slugify = (value = '') => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export default function Projects() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    getCached('/projects?active_only=true').then((res) => setProjects(res.data || [])).catch(() => setProjects([]));
  }, []);

  return <div className="min-h-screen" style={{ background: 'var(--bg-deep)' }}>
    <Navbar />
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-4xl mb-8" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>Our Projects</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <article key={project.id} className="glass-morph rounded overflow-hidden">
            <img src={optimizeCloudinaryUrl(project.hero_image, { width: 600 })} alt={project.title} loading="lazy" className="w-full h-56 object-cover" />
            <div className="p-5">
              <h2 className="text-xl mb-2" style={{ color: 'var(--text-primary)' }}>{project.title}</h2>
              <p className="text-sm mb-4 line-clamp-3" style={{ color: 'var(--text-muted)' }}>{project.description}</p>
              <Link className="btn-primary px-4 py-2 inline-block" to={`/projects/${project.slug || slugify(project.title)}`}>Read More</Link>
            </div>
          </article>
        ))}
      </div>
    </main>
    <Footer />
  </div>;
}
