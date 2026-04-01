import { useEffect, useRef, useState } from 'react';
import { Edit, MapPin, Plus, Trash2, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_BACKEND_URL || 'https://united-hands-backend.onrender.com';
const API = `${BACKEND_URL}/api`;

const defaultForm = { name: '', description: '', display_priority: 0 };

const LocationsManagement = () => {
  const [locations, setLocations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [formData, setFormData] = useState(defaultForm);
  const formRef = useRef(null);

  const fetchLocations = async () => {
    try {
      const response = await axios.get(`${API}/locations`);
      setLocations(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch locations:', error);
      toast.error('Failed to load locations');
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const resetForm = () => {
    setShowForm(false);
    setEditingLocation(null);
    setFormData(defaultForm);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error('Location name and description are required');
      return;
    }

    try {
      const token = localStorage.getItem('uhf_admin_token');
      if (editingLocation) {
        await axios.put(`${API}/locations/${editingLocation.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Location updated');
      } else {
        await axios.post(`${API}/locations`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Location created');
      }

      resetForm();
      fetchLocations();
    } catch (error) {
      console.error('Failed to save location:', error);
      const msg = error.response?.data?.detail || 'Failed to save location';
      toast.error(msg);
    }
  };

  const handleDelete = async (location) => {
    if (!window.confirm(`Delete ${location.name}? This cannot be undone.`)) return;

    try {
      const token = localStorage.getItem('uhf_admin_token');
      await axios.delete(`${API}/locations/${location.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Location deleted');
      fetchLocations();
    } catch (error) {
      console.error('Failed to delete location:', error);
      toast.error('Failed to delete location');
    }
  };

  const openEditForm = (location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name || '',
      description: location.description || '',
      display_priority: location.display_priority || 0
    });
    setShowForm(true);

    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <div className="space-y-6">
      <div className="glass-morph p-6 rounded flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-medium mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Work <span className="text-gradient-blue">Locations</span>
          </h3>
          <p className="text-[var(--text-muted)] text-sm">
            Manage the dynamic locations shown on the About page.
          </p>
        </div>
        <button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="btn-orange flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3"
          data-testid="add-location-btn"
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? 'Cancel' : 'Add Location'}
        </button>
      </div>

      {showForm && (
        <div ref={formRef} className="glass-morph p-6 sm:p-8 rounded space-y-4" data-testid="location-form">
          <h4 className="text-xl font-medium" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            {editingLocation ? 'Edit' : 'Create'} Location
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              placeholder="Location Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-[var(--bg-surface)] border blue-border rounded px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-teal)]"
              data-testid="location-name-input"
            />
            <input
              type="number"
              placeholder="Display Priority"
              value={formData.display_priority}
              onChange={(e) => setFormData({ ...formData, display_priority: parseInt(e.target.value, 10) || 0 })}
              className="bg-[var(--bg-surface)] border blue-border rounded px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-teal)]"
            />
            <textarea
              placeholder="Description *"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              className="md:col-span-2 bg-[var(--bg-surface)] border blue-border rounded px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-teal)]"
              data-testid="location-description-input"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={handleSave} className="btn-orange flex-1" data-testid="save-location-btn">
              {editingLocation ? 'Update' : 'Create'} Location
            </button>
            <button onClick={resetForm} className="btn-primary flex-1">Cancel</button>
          </div>
        </div>
      )}

      {locations.length === 0 ? (
        <div className="glass-morph p-12 rounded text-center">
          <p className="text-[var(--text-muted)]">No locations yet. Add your first location above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location) => (
            <div key={location.id} className="glass-morph p-6 rounded hover-lift" data-testid={`location-${location.id}`}>
              <MapPin className="mb-3" style={{ color: 'var(--accent-gold)' }} size={24} />
              <h4 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{location.name}</h4>
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>{location.description}</p>
              <div className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                Priority: {location.display_priority}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditForm(location)}
                  className="btn-primary flex-1 py-2 flex items-center justify-center gap-1 text-sm"
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(location)}
                  className="btn-orange flex-1 py-2 flex items-center justify-center gap-1 text-sm"
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

export default LocationsManagement;
