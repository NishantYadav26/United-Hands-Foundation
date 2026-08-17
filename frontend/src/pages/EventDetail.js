import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getCached } from '@/lib/apiClient';
import { optimizeCloudinaryUrl } from '@/lib/cloudinary';

export default function EventDetail() {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  // Previously the page rendered "Event not found" while the request was still
  // in flight, so every visit flashed an error before the content appeared —
  // and a failed request left that message up with no way to tell the two apart.
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let mounted = true;
    setStatus('loading');
    getCached('/events', { cacheTtlMs: 120000 })
      .then((r) => {
        if (!mounted) return;
        const match = (Array.isArray(r.data) ? r.data : []).find((e) => e.slug === slug) || null;
        setEvent(match);
        setStatus(match ? 'ready' : 'missing');
      })
      .catch(() => {
        if (!mounted) return;
        setStatus('error');
      });
    return () => { mounted = false; };
  }, [slug]);

  if (status !== 'ready') {
    const message = status === 'loading'
      ? 'Loading event…'
      : status === 'error'
        ? 'We could not load this event just now. Please refresh in a moment.'
        : 'Event not found';
    return (
      <div>
        <Navbar />
        <main className="pt-28 text-center">{message}</main>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-16">
        <h1 className="text-4xl mb-3">{event.title}</h1>
        <p className="mb-6">{event.description}</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {(event.images || []).map((img, i) => (
            <img
              key={i}
              src={optimizeCloudinaryUrl(img, { width: 1200 })}
              loading="lazy"
              className="w-full h-72 object-cover rounded"
              alt={`${event.title}-${i}`}
            />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
