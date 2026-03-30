import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Upload, X, Loader2, Heart } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const GalleryManagement = () => {
  const [images, setImages] = useState([]);
  const [editingImage, setEditingImage] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    category: 'impact',
    display_priority: 0
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await axios.get(`${API}/gallery`);
      setImages(response.data);
    } catch (error) {
      console.error('Failed to fetch gallery:', error);
      toast.error('Failed to load gallery');
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.image_url) {
      toast.error('Title and Image are required');
      return;
    }

    try {
      const token = localStorage.getItem('uhf_admin_token');
      
      if (editingImage) {
        await axios.put(`${API}/gallery/${editingImage.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Image updated successfully!');
      } else {
        await axios.post(`${API}/gallery`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Image added successfully!');
      }
      
      fetchImages();
      resetForm();
    } catch (error) {
      console.error('Failed to save image:', error);
      const msg = error.response?.data?.detail || error.message || 'Unknown error';
      toast.error(`Failed to save image: ${msg}`);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;

    try {
      const token = localStorage.getItem('uhf_admin_token');
      await axios.delete(`${API}/gallery/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Image deleted');
      fetchImages();
    } catch (error) {
      console.error('Failed to delete image:', error);
      toast.error('Failed to delete image');
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
      folder: 'gallery',
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
      title: '',
      description: '',
      image_url: '',
      category: 'impact',
      display_priority: 0
    });
    setEditingImage(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-morph p-6 rounded flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-medium mb-2 flex items-center gap-3" style={{fontFamily: 'Cormorant Garamond, serif'}}>
            <Heart style={{color: 'var(--accent-warm)'}} size={32} fill="var(--accent-warm)" />
            <span>Heartiest <span className="text-gradient-orange">Moments</span></span>
          </h3>
          <p className="text-[var(--text-muted)] text-sm">
            Share impactful moments from your field work. These appear on the homepage.
          </p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn-orange flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3"
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? 'Cancel' : 'Add Photo'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="glass-morph p-6 sm:p-8 rounded">
          <h4 className="text-xl font-medium mb-6" style={{fontFamily: 'Cormorant Garamond, serif'}}>
            {editingImage ? 'Edit' : 'Add'} Heartiest Moment
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              placeholder="Title/Caption *" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              className="bg-[var(--bg-surface)] border blue-border rounded px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-teal)] md:col-span-2" 
            />
            
            <textarea 
              placeholder="Description" 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              className="bg-[var(--bg-surface)] border blue-border rounded px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-teal)] md:col-span-2" 
              rows="2" 
            />
            
            <select 
              value={formData.category} 
              onChange={e => setFormData({...formData, category: e.target.value})} 
              className="bg-[var(--bg-surface)] border blue-border rounded px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-teal)]"
            >
              <option value="impact">Impact Stories</option>
              <option value="field_work">Field Work</option>
              <option value="events">Events</option>
            </select>

            <input 
              type="number" 
              placeholder="Display Priority" 
              value={formData.display_priority} 
              onChange={e => setFormData({...formData, display_priority: parseInt(e.target.value) || 0})} 
              className="bg-[var(--bg-surface)] border blue-border rounded px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-teal)]" 
            />
          </div>

          {/* Photo Upload */}
          <div className="mt-6 p-6 bg-[var(--bg-surface)] border blue-border rounded">
            {formData.image_url ? (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <img 
                  src={formData.image_url} 
                  alt="Preview" 
                  className="w-32 h-32 object-cover rounded"
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
                <Upload className="mx-auto mb-4" style={{color: 'var(--accent-warm)'}} size={48} />
                <p className="text-[var(--text-muted)] mb-4">No photo uploaded</p>
                <button 
                  onClick={uploadImage} 
                  disabled={uploading}
                  className="btn-orange flex items-center gap-2 mx-auto px-4 py-2"
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
            >
              {editingImage ? 'Update' : 'Add'} to Gallery
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

      {/* Gallery Grid */}
      {images.length === 0 ? (
        <div className="glass-morph p-12 rounded text-center">
          <Heart className="mx-auto mb-4" style={{color: 'var(--accent-warm)'}} size={64} />
          <p className="text-[var(--text-muted)] mb-4">No photos yet. Share your first heartiest moment!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map(image => (
            <div key={image.id} className="glass-morph rounded overflow-hidden hover-lift">
              <div className="h-64 bg-[var(--bg-surface)] overflow-hidden">
                <img 
                  src={image.image_url} 
                  alt={image.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="p-6">
                <h3 className="text-[var(--text-primary)] font-semibold mb-2">{image.title}</h3>
                <p className="text-[var(--text-muted)] text-sm mb-3 line-clamp-2">
                  {image.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-4">
                  <span>Priority: {image.display_priority}</span>
                  <span className="px-2 py-1 bg-[var(--bg-surface)] rounded">{image.category}</span>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setEditingImage(image); 
                      setFormData({
                        title: image.title,
                        description: image.description,
                        image_url: image.image_url,
                        category: image.category,
                        display_priority: image.display_priority
                      });
                      setShowForm(true);
                    }} 
                    className="btn-primary flex-1 py-2 flex items-center justify-center gap-1 text-sm"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(image.id, image.title)} 
                    className="btn-orange flex-1 py-2 flex items-center justify-center gap-1 text-sm"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GalleryManagement;
