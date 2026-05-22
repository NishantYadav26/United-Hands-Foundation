import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getCached } from '@/lib/apiClient';
import { optimizeCloudinaryUrl } from '@/lib/cloudinary';

export default function Events() {
  const [events, setEvents] = useState([]);
  useEffect(() => { getCached('/events').then((r) => setEvents(r.data || [])); }, []);

  return <div><Navbar /><main className='max-w-7xl mx-auto px-4 py-16'><h1 className='text-4xl mb-8'>Events</h1><div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>{events.map((e) => <Link to={`/events/${e.slug}`} key={e.id} className='glass-morph rounded overflow-hidden'><img src={optimizeCloudinaryUrl(e.images?.[0], { width: 600 })} loading='lazy' className='h-52 w-full object-cover' alt={e.title} /><div className='p-4'><h2>{e.title}</h2><p className='text-sm'>{e.description}</p></div></Link>)}</div></main><Footer /></div>;
}
