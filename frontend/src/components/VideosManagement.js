import { useState, useEffect } from 'react';
import { Video, Trash2, Plus, Loader2, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_BACKEND_URL || 'https://united-hands-backend.onrender.com';
const API = `${BACKEND_URL}/api`;

const VideosManagement = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
    category: 'Field Work'
  });

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await axios.get(`${API}/videos`);
      setVideos(response.data);
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.video_url) {
      toast.error('Title and Video URL are required');
      return;
    }
    try {
      const token = localStorage.getItem('uhf_admin_token');
      await axios.post(`${API}/videos`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Video added!');
      setFormData({ title: '', description: '', video_url: '', thumbnail_url: '', category: 'Field Work' });
      setShowForm(false);
      fetchVideos();
    } catch (error) {
      toast.error('Failed to add video');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this video?')) return;
    try {
      const token = localStorage.getItem('uhf_admin_token');
      await axios.delete(`${API}/videos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Video deleted');
      fetchVideos();
    } catch (error) {
      toast.error('Failed to delete video');
    }
  };

  const extractYoutubeId = (url) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  const getEmbedType = (url) => {
    if (!url) return 'unknown';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('facebook.com') || url.includes('fb.watch')) return 'facebook';
    if (url.includes('instagram.com')) return 'instagram';
    return 'direct';
  };

  const renderVideoEmbed = (video) => {
    const type = getEmbedType(video.video_url);
    const ytId = type === 'youtube' ? extractYoutubeId(video.video_url) : null;
    
    if (type === 'youtube' && ytId) {
      return (
        <div className="aspect-video">
          <iframe src={`https://www.youtube.com/embed/${ytId}`} title={video.title} className="w-full h-full" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
        </div>
      );
    }
    if (type === 'facebook') {
      return (
        <div className="aspect-video">
          <iframe src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(video.video_url)}&show_text=false&width=560`} className="w-full h-full" allowFullScreen allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" />
        </div>
      );
    }
    if (type === 'instagram') {
      return (
        <div className="p-4" style={{background: 'var(--bg-card)'}}>
          <a href={video.video_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-12 h-12 rounded flex items-center justify-center" style={{background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)'}}>
              <Video size={20} className="text-white" />
            </div>
            <div>
              <p className="font-medium" style={{color: 'var(--text-primary)'}}>{video.title}</p>
              <p className="text-xs" style={{color: 'var(--accent-warm)'}}>View on Instagram</p>
            </div>
          </a>
        </div>
      );
    }
    return (
      <div className="aspect-video flex items-center justify-center" style={{background: 'var(--bg-card)'}}>
        <a href={video.video_url} target="_blank" rel="noopener noreferrer" className="text-center">
          <Video style={{color: 'var(--text-muted)'}} size={48} className="mx-auto mb-2" />
          <span className="text-sm" style={{color: 'var(--accent-teal)'}}>Open Video</span>
        </a>
      </div>
    );
  };

  return (
    <div data-testid="videos-panel">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Video style={{color: 'var(--accent-warm)'}} size={28} />
          <h2 className="text-3xl font-medium" style={{fontFamily: 'Cormorant Garamond, serif'}}>Video Clips</h2>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2" data-testid="add-video-btn">
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? 'Cancel' : 'Add Video'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="p-6 rounded mb-8 space-y-4" style={{background: 'var(--bg-card)', border: '1px solid var(--border-subtle)'}} data-testid="video-form">
          <input
            placeholder="Video Title *"
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            className="w-full rounded px-4 py-3 text-sm focus:outline-none"
            style={{background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)'}}
            data-testid="video-title-input"
          />
          <input
            placeholder="Video URL * (YouTube, Facebook, or Instagram)"
            value={formData.video_url}
            onChange={e => setFormData({...formData, video_url: e.target.value})}
            className="w-full rounded px-4 py-3 text-sm focus:outline-none"
            style={{background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)'}}
            data-testid="video-url-input"
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            className="w-full rounded px-4 py-3 text-sm focus:outline-none"
            style={{background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)'}}
            rows="2"
          />
          <select
            value={formData.category}
            onChange={e => setFormData({...formData, category: e.target.value})}
            className="rounded px-4 py-3 text-sm focus:outline-none"
            style={{background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)'}}
          >
            <option value="Field Work">Field Work</option>
            <option value="Events">Events</option>
            <option value="Interviews">Interviews</option>
            <option value="Media Coverage">Media Coverage</option>
          </select>
          <button type="submit" className="btn-gold" data-testid="save-video-btn">Save Video</button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12"><Loader2 className="animate-spin mx-auto" style={{color: 'var(--accent-warm)'}} size={48} /></div>
      ) : videos.length === 0 ? (
        <div className="text-center py-12 glass-morph rounded">
          <Video className="mx-auto mb-4" style={{color: 'var(--text-muted)'}} size={48} />
          <p style={{color: 'var(--text-muted)'}}>No video clips yet. Add your first video.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {videos.map(video => {
            return (
              <div key={video.id} className="glass-morph rounded overflow-hidden" data-testid={`video-card-${video.id}`}>
                {renderVideoEmbed(video)}
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium mb-1" style={{color: 'var(--text-primary)'}}>{video.title}</h3>
                      {video.description && <p className="text-sm line-clamp-2" style={{color: 'var(--text-muted)'}}>{video.description}</p>}
                      <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded" style={{background: 'var(--bg-deep)', color: 'var(--accent-teal)'}}>{video.category}</span>
                    </div>
                    <button onClick={() => handleDelete(video.id)} className="p-2 hover:bg-red-100 text-red-600 rounded transition-colors" data-testid={`delete-video-${video.id}`}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VideosManagement;
