import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { cacheBust, invalidateCachedGet } from '@/lib/apiClient';

const BACKEND_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_BACKEND_URL || 'https://united-hands-foundation.onrender.com';
const API = `${BACKEND_URL}/api`;

// Must stay in step with EVENT_MIN_IMAGES / EVENT_MAX_IMAGES in backend/server.py.
const MIN_IMAGES = 1;
const MAX_IMAGES = 5;

export default function EventsManagement() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ title: '', slug: '', description: '', date: '', images: [] });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Cache-busted for the same reason as every other admin list: /api/events is
  // not in the API's public-cache list today, but nothing stops it being added,
  // and a post-save refetch answered from the browser cache makes a successful
  // edit look like it was lost.
  const load = () => axios.get(`${API}/events`, { params: cacheBust() }).then((r) => setEvents(r.data || [])).catch(() => setEvents([]));
  useEffect(() => { load(); }, []);

  const upload = () => {
    window.cloudinary.openUploadWidget({ cloudName: 'dvmb3mzcy', uploadPreset: 'uhf_unsigned', multiple: true, maxFiles: MAX_IMAGES, folder: 'events' }, (error, result) => {
      if (error) return;
      if (result.event === 'success') setForm((prev) => ({ ...prev, images: [...prev.images, result.info.secure_url].slice(0, MAX_IMAGES) }));
    });
  };

  const resetForm = () => {
    setForm({ title: '', slug: '', description: '', date: '', images: [] });
    setEditingId(null);
  };

  const save = async () => {
    if (form.images.length < MIN_IMAGES || form.images.length > MAX_IMAGES) {
      return toast.error(`Please upload between ${MIN_IMAGES} and ${MAX_IMAGES} images`);
    }
    const token = localStorage.getItem('uhf_admin_token');
    setSaving(true);
    try {
      if (editingId) {
        await axios.put(`${API}/events/${editingId}`, form, { headers: { Authorization: `Bearer ${token}` } });
        toast.success('Event updated');
      } else {
        await axios.post(`${API}/events`, form, { headers: { Authorization: `Bearer ${token}` } });
        toast.success('Event added');
      }
      // These requests go through raw axios, so apiClient's mutation interceptor
      // never fires. Without this the public pages keep serving the cached list
      // for minutes and the edit looks like it silently failed.
      invalidateCachedGet('/events');
      resetForm();
      load();
    } catch (error) {
      toast.error(error?.response?.data?.detail || 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (event) => {
    setEditingId(event.id);
    setForm({
      title: event.title || '',
      slug: event.slug || '',
      description: event.description || '',
      date: event.date || '',
      images: event.images || []
    });
  };

  const removeEvent = async (eventId) => {
    const token = localStorage.getItem('uhf_admin_token');
    try {
      await axios.delete(`${API}/events/${eventId}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Event deleted');
      invalidateCachedGet('/events');
      if (editingId === eventId) resetForm();
      load();
    } catch (error) {
      toast.error(error?.response?.data?.detail || 'Failed to delete event');
    }
  };

  return <div className='glass-morph p-6 rounded space-y-4'>
    <h3 className='text-2xl'>Events Management</h3>
    <input className='w-full p-2 rounded' placeholder='Title' value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
    <input className='w-full p-2 rounded' placeholder='Slug' value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
    <textarea className='w-full p-2 rounded' placeholder='Description' value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
    <input type='date' className='w-full p-2 rounded' value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
    <button className='btn-primary px-4 py-2' onClick={upload}>Upload 2 Images</button>
    <div className='flex gap-3'>
      <button className='btn-orange px-4 py-2' onClick={save} disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update Event' : 'Save Event'}</button>
      {editingId && <button className='px-4 py-2 rounded border border-[var(--border-subtle)]' onClick={resetForm}>Cancel Edit</button>}
    </div>
    <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
      {events.map((e) => (
        <div key={e.id} className='p-4 bg-[var(--bg-surface)] rounded space-y-2'>
          <div className='font-semibold'>{e.title}</div>
          <div className='text-xs opacity-70'>{e.date} · /events/{e.slug}</div>
          <div className='flex gap-2'>
            <button className='px-3 py-1.5 rounded text-xs border border-[var(--border-subtle)]' onClick={() => startEdit(e)}>Edit</button>
            <button className='px-3 py-1.5 rounded text-xs border border-red-400/40 text-red-500' onClick={() => removeEvent(e.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  </div>;
}
