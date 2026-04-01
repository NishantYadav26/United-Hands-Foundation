import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Upload, X, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_BACKEND_URL || 'https://united-hands-backend.onrender.com';
const API = `${BACKEND_URL}/api`;

const TeamPillars = () => {
  const [pillars, setPillars] = useState([]);
  const [activeView, setActiveView] = useState('team');
  const [editingPillar, setEditingPillar] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', 
    role: '', 
    bio_brief: '', 
    bio_detailed: '',
    specialty: '', 
    image_url: '', 
    category: 'Team', 
    display_priority: 0
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPillars();
  }, []);

  const fetchPillars = async () => {
    try {
      const response = await axios.get(`${API}/pillars`);
      setPillars(response.data);
    } catch (error) {
      console.error('Failed to fetch pillars:', error);
      toast.error('Failed to load team pillars');
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.role) {
      toast.error('Name and Role are required');
      return;
    }

    try {
      const token = localStorage.getItem('uhf_admin_token');
      
      if (editingPillar) {
        await axios.put(`${API}/pillars/${editingPillar.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Pillar updated successfully!');
      } else {
        await axios.post(`${API}/pillars`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Pillar created successfully!');
      }
      
      fetchPillars();
      resetForm();
    } catch (error) {
      console.error('Failed to save pillar:', error);
      const msg = error.response?.data?.detail || error.message || 'Unknown error';
      toast.error(`Failed to save pillar: ${msg}`);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;

    try {
      const token = localStorage.getItem('uhf_admin_token');
      await axios.delete(`${API}/pillars/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Pillar deleted');
      fetchPillars();
    } catch (error) {
      console.error('Failed to delete pillar:', error);
      toast.error('Failed to delete pillar');
    }
  };

  const uploadImage = () => {
    if (!window.cloudinary) {
      toast.error('Cloudinary widget not loaded');
      return;
    }

    setUploading(true);
    window.cloudinary.openUploadWidget({
      cloudName: 'dvmb3mzcy',
      uploadPreset: 'uhf_unsigned',
      sources: ['local', 'camera'],
      multiple: false,
      folder: 'team_pillars',
      resourceType: 'image',
      clientAllowedFormats: ['png', 'jpg', 'jpeg', 'webp'],
      maxFileSize: 10000000
    }, (error, result) => {
      setUploading(false);
      
      if (error) {
        toast.error('Upload failed: ' + (error?.message || JSON.stringify(error)));
        return;
      }

      if (result.event === 'success') {
        setFormData({...formData, image_url: result.info.secure_url});
        toast.success('Photo uploaded!');
      }
    });
  };

  const resetForm = () => {
    setFormData({
      name: '', 
      role: '', 
      bio_brief: '', 
      bio_detailed: '', 
      specialty: '', 
      image_url: '', 
      category: 'Team', 
      display_priority: 0
    });
    setEditingPillar(null);
    setShowForm(false);
  };

  const teamMembers = pillars.filter((pillar) => pillar.category !== 'Partner');
  const partners = pillars.filter((pillar) => pillar.category === 'Partner');
  const visiblePillars = activeView === 'partners' ? partners : teamMembers;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-morph p-6 rounded flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-medium mb-2" style={{fontFamily: 'Cormorant Garamond, serif'}}>
            Team <span className="text-gradient-orange">Pillars</span>
          </h3>
          <p className="text-[var(--text-muted)] text-sm">
            Manage your leadership team and our partners from dedicated sections
          </p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn-orange flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3"
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? 'Cancel' : 'Add Pillar'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="glass-morph p-6 sm:p-8 rounded">
          <h4 className="text-xl font-medium mb-6" style={{fontFamily: 'Cormorant Garamond, serif'}}>
            {editingPillar ? 'Edit' : 'Create'} Pillar
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              placeholder="Full Name *" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              className="bg-[var(--bg-surface)] border blue-border rounded px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-teal)]" 
              data-testid="pillar-name-input"
            />
            
            <input 
              placeholder="Role/Title *" 
              value={formData.role} 
              onChange={e => setFormData({...formData, role: e.target.value})} 
              className="bg-[var(--bg-surface)] border blue-border rounded px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-teal)]" 
            />
            
            <input 
              placeholder="Specialty/Focus Area" 
              value={formData.specialty} 
              onChange={e => setFormData({...formData, specialty: e.target.value})} 
              className="bg-[var(--bg-surface)] border blue-border rounded px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-teal)] md:col-span-2" 
            />
            
            <textarea 
              placeholder="Brief Bio (2-3 lines for card preview)" 
              value={formData.bio_brief} 
              onChange={e => setFormData({...formData, bio_brief: e.target.value})} 
              className="bg-[var(--bg-surface)] border blue-border rounded px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-teal)] md:col-span-2" 
              rows="2" 
            />
            
            <textarea 
              placeholder="Detailed Bio (shows on hover)" 
              value={formData.bio_detailed} 
              onChange={e => setFormData({...formData, bio_detailed: e.target.value})} 
              className="bg-[var(--bg-surface)] border blue-border rounded px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-teal)] md:col-span-2" 
              rows="4" 
            />
            
            <select 
              value={formData.category} 
              onChange={e => setFormData({
                ...formData,
                category: e.target.value
              })} 
              className="bg-[var(--bg-surface)] border blue-border rounded px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-teal)]"
            >
              <option value="President">President</option>
              <option value="Founder">Founder</option>
              <option value="Team">Team</option>
              <option value="Partner">Partner</option>
            </select>
            
            <input 
              type="number" 
              placeholder="Display Priority (1 = first)" 
              value={formData.display_priority} 
              onChange={e => setFormData({...formData, display_priority: parseInt(e.target.value) || 0})} 
              className="bg-[var(--bg-surface)] border blue-border rounded px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-teal)]" 
            />
          </div>

          <div className="mt-6 p-6 bg-[var(--bg-surface)] border blue-border rounded">
            {formData.image_url ? (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <img 
                  src={formData.image_url} 
                  alt="Preview" 
                  className="w-24 h-24 object-cover rounded identity-lock"
                />
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-[var(--text-primary)] text-sm mb-2">Photo uploaded ✓</p>
                  <button 
                    onClick={uploadImage} 
                    disabled={uploading}
                    className="btn-primary px-4 py-2 text-sm"
                  >
                    Change Photo
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="mx-auto mb-4" style={{color: 'var(--accent-teal)'}} size={48} />
                <p className="text-[var(--text-muted)] mb-4">No photo uploaded</p>
                <button 
                  onClick={uploadImage} 
                  disabled={uploading}
                  className="btn-primary flex items-center gap-2 mx-auto px-4 py-2"
                >
                  {uploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                  Upload Photo
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button 
              onClick={handleSave} 
              className="btn-orange flex-1"
              data-testid="save-pillar-btn"
            >
              {editingPillar ? 'Update' : 'Create'} Pillar
            </button>
            <button 
              onClick={resetForm} 
              className="btn-primary flex-1"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="glass-morph p-4 rounded">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveView('team')}
            className={`px-4 py-2 rounded text-sm font-medium transition ${
              activeView === 'team'
                ? 'bg-[var(--accent-teal)] text-[var(--bg-deep)]'
                : 'bg-[var(--bg-surface)] text-[var(--text-muted)]'
            }`}
            data-testid="team-section-tab"
          >
            Team Section ({teamMembers.length})
          </button>
          <button
            onClick={() => setActiveView('partners')}
            className={`px-4 py-2 rounded text-sm font-medium transition ${
              activeView === 'partners'
                ? 'bg-[var(--accent-warm)] text-[var(--bg-deep)]'
                : 'bg-[var(--bg-surface)] text-[var(--text-muted)]'
            }`}
            data-testid="partners-section-tab"
          >
            Our Partners Section ({partners.length})
          </button>
        </div>
      </div>

      {/* Pillars Grid */}
      {visiblePillars.length === 0 ? (
        <div className="glass-morph p-12 rounded text-center">
          <p className="text-[var(--text-muted)] mb-4">
            {activeView === 'partners'
              ? 'No partners yet. Add your first partner above!'
              : 'No team pillars yet. Add your first pillar above!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visiblePillars.map(pillar => (
            <div key={pillar.id} className="glass-morph p-6 rounded hover-lift" data-testid={`pillar-${pillar.id}`}>
              <div className="aspect-square bg-[var(--bg-surface)] rounded mb-4 overflow-hidden">
                {pillar.image_url ? (
                  <img 
                    src={pillar.image_url} 
                    alt={pillar.name} 
                    className="w-full h-full object-cover identity-lock"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Upload style={{color: 'var(--accent-teal)'}} size={48} />
                  </div>
                )}
              </div>
              
              <h3 className="text-[var(--text-primary)] font-semibold text-lg mb-1">{pillar.name}</h3>
              <p className="text-[var(--accent-teal)] text-xs tracking-[0.2em] uppercase font-bold mb-2">{pillar.role}</p>
              <p className="text-[var(--text-muted)] text-sm mb-3 line-clamp-2">{pillar.specialty}</p>
              
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-4">
                <span>Priority: {pillar.display_priority}</span>
                <span className="px-2 py-1 bg-[var(--bg-surface)] rounded">{pillar.category}</span>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setEditingPillar(pillar); 
                    setFormData(pillar);
                    setShowForm(true);
                  }} 
                  className="btn-primary flex-1 py-2 flex items-center justify-center gap-1 text-sm"
                  data-testid={`edit-${pillar.id}`}
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(pillar.id, pillar.name)} 
                  className="btn-orange flex-1 py-2 flex items-center justify-center gap-1 text-sm"
                  data-testid={`delete-${pillar.id}`}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamPillars;
