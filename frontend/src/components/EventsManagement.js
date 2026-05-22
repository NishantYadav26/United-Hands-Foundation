import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_BACKEND_URL || 'https://united-hands-backend.onrender.com';
const API = `${BACKEND_URL}/api`;

export default function EventsManagement() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ title: '', slug: '', description: '', date: '', images: [] });

  const load = () => axios.get(`${API}/events`).then((r) => setEvents(r.data || [])).catch(() => setEvents([]));
  useEffect(() => { load(); }, []);

  const upload = () => {
    window.cloudinary.openUploadWidget({ cloudName: 'dvmb3mzcy', uploadPreset: 'uhf_unsigned', multiple: true, maxFiles: 2, folder: 'events' }, (error, result) => {
      if (error) return;
      if (result.event === 'success') setForm((prev) => ({ ...prev, images: [...prev.images, result.info.secure_url].slice(0, 2) }));
    });
  };

  const save = async () => {
    if (form.images.length !== 2) return toast.error('Please upload exactly 2 images');
    const token = localStorage.getItem('uhf_admin_token');
    await axios.post(`${API}/events`, form, { headers: { Authorization: `Bearer ${token}` } });
    toast.success('Event added');
    setForm({ title: '', slug: '', description: '', date: '', images: [] });
    load();
  };

  return <div className='glass-morph p-6 rounded space-y-4'>
    <h3 className='text-2xl'>Events Management</h3>
    <input className='w-full p-2 rounded' placeholder='Title' value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
    <input className='w-full p-2 rounded' placeholder='Slug' value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
    <textarea className='w-full p-2 rounded' placeholder='Description' value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
    <input type='date' className='w-full p-2 rounded' value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
    <button className='btn-primary px-4 py-2' onClick={upload}>Upload 2 Images</button>
    <button className='btn-orange px-4 py-2' onClick={save}>Save Event</button>
    <div className='grid grid-cols-2 gap-3'>{events.map((e) => <div key={e.id} className='p-3 bg-[var(--bg-surface)] rounded'>{e.title}</div>)}</div>
  </div>;
}
