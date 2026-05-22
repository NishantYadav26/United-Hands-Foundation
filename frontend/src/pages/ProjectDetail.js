import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getCached } from '@/lib/apiClient';
import { optimizeCloudinaryUrl } from '@/lib/cloudinary';

export default function ProjectDetail() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);

  useEffect(() => {
    getCached('/projects').then((res) => {
      const found = (res.data || []).find((p) => (p.slug || p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) === slug);
      setProject(found || null);
    });
  }, [slug]);

  if (!project) return <div><Navbar /><main className='pt-32 text-center'>Project not found</main><Footer /></div>;
  const progress = Math.min((project.raised_amount / Math.max(project.target_amount, 1)) * 100, 100);

  return <div className="min-h-screen" style={{ background: 'var(--bg-deep)' }}>
    <Navbar />
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
      <img src={optimizeCloudinaryUrl(project.hero_image, { width: 1200 })} alt={project.title} loading="eager" className="w-full h-[420px] object-cover rounded mb-8" />
      <h1 className="text-4xl mb-4" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>{project.title}</h1>
      <p className="mb-6" style={{ color: 'var(--text-muted)' }}>{project.description}</p>
      <div className="mb-8">
        <div className="w-full bg-[var(--bg-surface)] rounded h-3 overflow-hidden"><div className="h-full bg-[var(--accent-teal)]" style={{ width: `${progress}%` }} /></div>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>Raised ₹{project.raised_amount?.toLocaleString?.() || 0} of ₹{project.target_amount?.toLocaleString?.() || 0}</p>
      </div>
      <h3 className="text-2xl mb-4" style={{ color: 'var(--text-primary)' }}>Impact Gallery</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(project.images || []).map((image, idx) => <img key={idx} src={optimizeCloudinaryUrl(image, { width: 800 })} alt={`${project.title}-${idx + 1}`} loading="lazy" className="w-full h-56 object-cover rounded" />)}
      </div>
    </main>
    <Footer />
  </div>;
}
