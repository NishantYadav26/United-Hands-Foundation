import { useEffect, useState } from 'react';
import { Loader2, Newspaper, Upload } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_BACKEND_URL || 'https://united-hands-backend.onrender.com';
const API = `${BACKEND_URL}/api`;

const initialForm = {
  title: '',
  publication: '',
  district: 'Dharashiv',
  year: String(new Date().getFullYear()),
  category: 'newspaper',
  image_url: ''
};

const PressManagement = () => {
  const [pressItems, setPressItems] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchPressItems();
  }, []);

  const fetchPressItems = async () => {
    try {
      const response = await axios.get(`${API}/press-media`);
      setPressItems(response.data);
    } catch (error) {
      console.error('Failed to fetch press media:', error);
      toast.error('Failed to load press clippings');
    } finally {
      setLoading(false);
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
      folder: 'press',
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
        setFormData((prev) => ({ ...prev, image_url: result.info.secure_url }));
        toast.success('Press image uploaded');
      }
    });
  };

  const handleSave = async () => {
    if (!formData.title || !formData.publication || !formData.image_url) {
      toast.error('Title, publication and image are required');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('uhf_admin_token');
      const request = editingId
        ? axios.put(`${API}/press-media/${editingId}`, formData, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined
          })
        : axios.post(`${API}/press-media`, formData, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined
          });

      await request;
      toast.success(editingId ? 'Press clipping updated' : 'Press clipping added');
      setEditingId(null);
      setFormData(initialForm);
      fetchPressItems();
    } catch (error) {
      console.error('Failed to save press clipping:', error);
      const msg = error.response?.data?.detail || error.message || 'Unknown error';
      toast.error(`Failed to save: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      title: item.title || '',
      publication: item.publication || '',
      district: item.district || 'Dharashiv',
      year: item.year || String(new Date().getFullYear()),
      category: item.category || 'newspaper',
      image_url: item.image_url || ''
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData(initialForm);
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.title}" from press clippings?`)) return;

    setDeletingId(item.id);
    try {
      const token = localStorage.getItem('uhf_admin_token');
      await axios.delete(`${API}/press-media/${item.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });
      toast.success('Press clipping deleted');
      if (editingId === item.id) {
        cancelEdit();
      }
      fetchPressItems();
    } catch (error) {
      console.error('Failed to delete press clipping:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete press clipping');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-morph p-6 rounded">
        <h3 className="text-2xl font-medium mb-2 flex items-center gap-3" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          <Newspaper style={{ color: 'var(--accent-gold)' }} size={30} />
          Press <span className="text-gradient-gold">Management</span>
        </h3>
        <p className="text-[var(--text-muted)] text-sm">Upload a clipping image and publish it to the Press page.</p>
      </div>

      <div className="glass-morph p-6 sm:p-8 rounded">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            placeholder="Headline *"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="bg-[var(--bg-surface)] border blue-border rounded px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-teal)]"
          />
          <input
            placeholder="Publication Name *"
            value={formData.publication}
            onChange={(e) => setFormData({ ...formData, publication: e.target.value })}
            className="bg-[var(--bg-surface)] border blue-border rounded px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-teal)]"
          />

          <select
            value={formData.district}
            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
            className="bg-[var(--bg-surface)] border blue-border rounded px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-teal)]"
          >
            <option>Dharashiv</option>
            <option>Solapur</option>
            <option>Latur</option>
            <option>Palghar</option>
            <option>Panchgani</option>
          </select>

          <input
            type="number"
            placeholder="Year"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            className="bg-[var(--bg-surface)] border blue-border rounded px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-teal)]"
          />
        </div>

        <div className="mt-6 p-5 rounded border blue-border bg-[var(--bg-surface)]">
          {formData.image_url ? (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <img src={formData.image_url} alt="Press preview" className="w-32 h-32 object-cover rounded" />
              <button onClick={uploadImage} className="btn-primary px-4 py-2 text-sm" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Change Image'}
              </button>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="mx-auto mb-3" style={{ color: 'var(--accent-gold)' }} size={40} />
              <button onClick={uploadImage} className="btn-gold px-5 py-2 text-sm" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload Press Image'}
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          <button onClick={handleSave} className="btn-primary w-full sm:w-auto px-8 py-3" disabled={saving}>
            {saving ? 'Saving...' : editingId ? 'Update Press Item' : 'Add to Press'}
          </button>
          {editingId && (
            <button onClick={cancelEdit} className="btn-gold w-full sm:w-auto px-8 py-3" disabled={saving}>
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <Loader2 className="animate-spin mx-auto" style={{ color: 'var(--accent-teal)' }} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pressItems.map((item) => (
            <div key={item.id} className="glass-morph rounded overflow-hidden">
              <img src={item.image_url} alt={item.title} className="w-full h-44 object-cover" />
              <div className="p-4">
                <h4 className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{item.title}</h4>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.publication} • {item.district} • {item.year}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => startEdit(item)}
                    className="btn-primary px-3 py-1 text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="btn-gold px-3 py-1 text-xs"
                    disabled={deletingId === item.id}
                  >
                    {deletingId === item.id ? 'Deleting...' : 'Delete'}
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

export default PressManagement;
