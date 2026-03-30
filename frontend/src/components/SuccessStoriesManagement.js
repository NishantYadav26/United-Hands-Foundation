import { useState, useEffect } from 'react';
import { BookOpen, Plus, X, Trash2, Edit2, Save, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SuccessStoriesManagement = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    location: 'Latur',
    patient_count: 0,
    date: new Date().toISOString().split('T')[0],
    story_text: '',
    category: 'General',
    images: []
  });

  const locations = ['Dharashiv', 'Solapur', 'Latur', 'Palghar', 'Panchgani', 'Other'];
  const categories = ['Healthcare', 'Education', 'Elderly Care', 'Disaster Relief', 'General'];

  useEffect(() => { fetchStories(); }, []);

  const fetchStories = async () => {
    try {
      const response = await axios.get(`${API}/success-stories?limit=50`);
      setStories(response.data);
    } catch (error) {
      console.error('Failed to fetch stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ location: 'Latur', patient_count: 0, date: new Date().toISOString().split('T')[0], story_text: '', category: 'General', images: [] });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.story_text) { toast.error('Story text is required'); return; }
    try {
      const token = localStorage.getItem('uhf_admin_token');
      if (editingId) {
        await axios.put(`${API}/success-stories/${editingId}`, formData, { headers: { Authorization: `Bearer ${token}` } });
        toast.success('Story updated!');
      } else {
        await axios.post(`${API}/success-stories`, formData, { headers: { Authorization: `Bearer ${token}` } });
        toast.success('Story created!');
      }
      resetForm();
      fetchStories();
    } catch (error) {
      toast.error('Failed to save story');
    }
  };

  const handleEdit = (story) => {
    setFormData({
      location: story.location,
      patient_count: story.patient_count,
      date: story.date,
      story_text: story.story_text,
      category: story.category || 'General',
      images: story.images || []
    });
    setEditingId(story.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this story?')) return;
    try {
      const token = localStorage.getItem('uhf_admin_token');
      await axios.delete(`${API}/success-stories/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Story deleted');
      fetchStories();
    } catch (error) {
      toast.error('Failed to delete story');
    }
  };

  return (
    <div data-testid="stories-panel">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <BookOpen style={{color: 'var(--accent-gold)'}} size={28} />
          <h2 className="text-3xl font-medium" style={{fontFamily: 'Cormorant Garamond, serif'}}>Success Stories</h2>
        </div>
        <button onClick={() => { showForm ? resetForm() : setShowForm(true); }} className="btn-gold flex items-center gap-2" data-testid="add-story-btn">
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? 'Cancel' : 'Add Story'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-6 rounded mb-8 space-y-4" style={{background: 'var(--bg-card)', border: '1px solid var(--border-subtle)'}} data-testid="story-form">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
              className="rounded px-4 py-3 text-sm focus:outline-none" style={{background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)'}}>
              {locations.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
              className="rounded px-4 py-3 text-sm focus:outline-none" style={{background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)'}}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="number" placeholder="Beneficiaries" value={formData.patient_count}
              onChange={e => setFormData({...formData, patient_count: parseInt(e.target.value) || 0})}
              className="rounded px-4 py-3 text-sm focus:outline-none" style={{background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)'}}
              data-testid="story-count-input"
            />
          </div>
          <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
            className="rounded px-4 py-3 text-sm focus:outline-none" style={{background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)'}}
          />
          <textarea placeholder="Tell the story... *" value={formData.story_text}
            onChange={e => setFormData({...formData, story_text: e.target.value})}
            className="w-full rounded px-4 py-3 text-sm focus:outline-none" rows="4"
            style={{background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)'}}
            data-testid="story-text-input"
          />
          <button type="submit" className="btn-primary flex items-center gap-2" data-testid="save-story-submit">
            <Save size={16} /> {editingId ? 'Update Story' : 'Save Story'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12"><Loader2 className="animate-spin mx-auto" style={{color: 'var(--accent-gold)'}} size={48} /></div>
      ) : stories.length === 0 ? (
        <div className="text-center py-12 glass-morph rounded">
          <BookOpen className="mx-auto mb-4" style={{color: 'var(--text-muted)'}} size={48} />
          <p style={{color: 'var(--text-muted)'}}>No success stories yet. Share your first impact story.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stories.map(story => (
            <div key={story.id} className="glass-morph p-6 rounded" data-testid={`story-card-${story.id}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-xs px-2 py-1 rounded mr-2" style={{background: 'var(--bg-deep)', color: 'var(--accent-teal)'}}>{story.location}</span>
                  <span className="text-xs px-2 py-1 rounded" style={{background: 'var(--bg-deep)', color: 'var(--accent-warm)'}}>{story.category || 'General'}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(story)} className="p-1.5 hover:bg-sky-100 rounded transition-colors" style={{color: 'var(--accent-teal)'}}>
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(story.id)} className="p-1.5 hover:bg-red-100 text-red-600 rounded transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="leading-relaxed mb-3" style={{color: 'var(--text-primary)'}}>{story.story_text}</p>
              <div className="flex justify-between text-xs" style={{color: 'var(--text-muted)'}}>
                <span>{story.patient_count} beneficiaries</span>
                <span>{story.date}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SuccessStoriesManagement;
