import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getCached } from '@/lib/apiClient';
import { optimizeCloudinaryUrl } from '@/lib/cloudinary';

export default function Events() {
  const [events, setEvents] = useState([]);
  // 'loading' is distinct from 'loaded but empty' so a slow API never looks
  // like an organisation that has run no events.
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let mounted = true;
    getCached('/events', { cacheTtlMs: 120000 })
      .then((r) => {
        if (!mounted) return;
        setEvents(Array.isArray(r.data) ? r.data : []);
        setStatus('ready');
      })
      .catch(() => {
        // Without this the rejection was unhandled and the page sat on an empty
        // grid with nothing to explain it.
        if (!mounted) return;
        setStatus('error');
      });
    return () => { mounted = false; };
  }, []);

  return (
    <div>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-16">
        <h1 className="text-4xl mb-8">Events</h1>

        {status === 'loading' && (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading events…</p>
        )}

        {status === 'error' && (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            We could not load events just now. Please refresh in a moment.
          </p>
        )}

        {status === 'ready' && events.length === 0 && (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            No events have been published yet. Please check back soon.
          </p>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((e) => (
            <Link to={`/events/${e.slug}`} key={e.id} className="glass-morph rounded overflow-hidden">
              {/* Guarded: an event saved without images used to render a broken
                  image icon, because the helper passes undefined straight back. */}
              {e.images?.[0] ? (
                <img
                  src={optimizeCloudinaryUrl(e.images[0], { width: 600 })}
                  loading="lazy"
                  className="h-52 w-full object-cover"
                  alt={e.title}
                />
              ) : (
                <div className="h-52 w-full" style={{ background: 'var(--bg-surface)' }} aria-hidden="true" />
              )}
              <div className="p-4">
                <h2>{e.title}</h2>
                <p className="text-sm">{e.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
