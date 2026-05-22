import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getCached } from '@/lib/apiClient';
import { optimizeCloudinaryUrl } from '@/lib/cloudinary';

export default function EventDetail() {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  useEffect(() => { getCached('/events').then((r) => setEvent((r.data || []).find((e) => e.slug === slug) || null)); }, [slug]);
  if (!event) return <div><Navbar /><main className='pt-28 text-center'>Event not found</main><Footer /></div>;
  return <div><Navbar /><main className='max-w-5xl mx-auto px-4 py-16'><h1 className='text-4xl mb-3'>{event.title}</h1><p className='mb-6'>{event.description}</p><div className='grid sm:grid-cols-2 gap-4'>{(event.images || []).map((img, i) => <img key={i} src={optimizeCloudinaryUrl(img, { width: 1200 })} loading='lazy' className='w-full h-72 object-cover rounded' alt={`${event.title}-${i}`} />)}</div></main><Footer /></div>;
}
