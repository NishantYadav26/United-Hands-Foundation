import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Upload, X, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProjectsManagement = () => {
  const [projects, setProjects] = useState([]);
  const [editingProject, setEditingProject] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    hero_image: '',
    target_amount: 0,
    is_active: true
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API}/projects`);
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      toast.error('Failed to load projects');
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.category) {
      toast.error('Title and Category are required');
      return;
    }

    try {
      const token = localStorage.getItem('uhf_admin_token');
      
      if (editingProject) {
        await axios.put(`${API}/projects/${editingProject.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Project updated successfully!');
      } else {
        await axios.post(`${API}/projects`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Project created successfully!');
      }
      
      fetchProjects();
      resetForm();
    } catch (error) {
      console.error('Failed to save project:', error);
      toast.error('Failed to save project');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;

    try {
      const token = localStorage.getItem('uhf_admin_token');
      await axios.delete(`${API}/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Project deleted');
      fetchProjects();
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast.error('Failed to delete project');
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
      sources: ['local', 'url'],
      multiple: false,
      folder: 'projects',
      resourceType: 'image',
      clientAllowedFormats: ['png', 'jpg', 'jpeg', 'webp'],
      maxFileSize: 10000000
    }, (error, result) => {
      setUploading(false);
      
      if (error) {
        toast.error('Upload failed: ' + error.message);
        return;
      }

      if (result.event === 'success') {
        setFormData({...formData, hero_image: result.info.secure_url});
        toast.success('Image uploaded!');
      }
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: '',
      description: '',
      hero_image: '',
      target_amount: 0,
      is_active: true
    });
    setEditingProject(null);
    setShowForm(false);
  };

  const getProgress = (raised, target) => {
    return Math.min((raised / target) * 100, 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-morph p-6 rounded flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-medium mb-2" style={{fontFamily: 'Cormorant Garamond, serif'}}>
            Projects <span className="text-gradient-blue">Management</span>
          </h3>
          <p className="text-[var(--text-muted)] text-sm">
            Manage your 5 Pillars of Impact and donation causes
          </p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn-orange flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3"
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? 'Cancel' : 'Add Project'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="glass-morph p-6 sm:p-8 rounded">
          <h4 className="text-xl font-medium mb-6" style={{fontFamily: 'Cormorant Garamond, serif'}}>
            {editingProject ? 'Edit' : 'Create'} Project
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              placeholder="Project Title *" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              className="bg-[var(--bg-surface)] border blue-border rounded px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-teal)]" 
            />
            
            <input 
              placeholder="Category *" 
              value={formData.category} 
              onChange={e => setFormData({...formData, category: e.target.value})} 
              className="bg-[var(--bg-surface)] border blue-border rounded px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-teal)]" 
            />
            
            <textarea 
              placeholder="Description" 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              className="bg-[var(--bg-surface)] border blue-border rounded px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-teal)] md:col-span-2" 
              rows="3" 
            />
            
            <input 
              type="number" 
              placeholder="Target Amount (₹)" 
              value={formData.target_amount} 
              onChange={e => setFormData({...formData, target_amount: parseInt(e.target.value) || 0})} 
              className="bg-[var(--bg-surface)] border blue-border rounded px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-teal)]" 
            />

            <div className="flex items-center gap-3 bg-[var(--bg-surface)] border blue-border rounded px-4 py-3">
              <input 
                type="checkbox" 
                checked={formData.is_active}
                onChange={e => setFormData({...formData, is_active: e.target.checked})}
                className="w-4 h-4"
              />
              <label className="text-sm" style={{color: 'var(--text-primary)'}}>Active Project</label>
            </div>
          </div>

          {/* Hero Image Upload */}
          <div className="mt-6 p-6 bg-[var(--bg-surface)] border blue-border rounded">
            {formData.hero_image ? (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <img 
                  src={formData.hero_image} 
                  alt="Preview" 
                  className="w-32 h-32 object-cover rounded"
                />
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-[var(--text-primary)] text-sm mb-2">Hero image uploaded ✓</p>
                  <button 
                    onClick={uploadImage} 
                    disabled={uploading}
                    className="btn-primary px-4 py-2 text-sm"
                  >
                    Change Image
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="mx-auto mb-4" style={{color: 'var(--accent-teal)'}} size={48} />
                <p className="mb-4" style={{color: 'var(--text-muted)'}}>No hero image uploaded</p>
                <button 
                  onClick={uploadImage} 
                  disabled={uploading}
                  className="btn-primary flex items-center gap-2 mx-auto px-4 py-2"
                >
                  {uploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                  Upload Hero Image
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
              {editingProject ? 'Update' : 'Create'} Project
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

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="glass-morph p-12 rounded text-center">
          <p className="text-[var(--text-muted)] mb-4">No projects yet. Add your first project above!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => {
            const progress = getProgress(project.raised_amount, project.target_amount);

            return (
              <div key={project.id} className="glass-morph p-6 rounded hover-lift">
                <div className="h-48 bg-[var(--bg-surface)] rounded mb-4 overflow-hidden">
                  {project.hero_image ? (
                    <img 
                      src={project.hero_image} 
                      alt={project.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Upload style={{color: 'var(--accent-teal)'}} size={48} />
                    </div>
                  )}
                </div>
                
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-[var(--text-primary)] font-semibold text-lg mb-1">{project.title}</h3>
                    <span className="text-[var(--accent-teal)] text-xs tracking-[0.2em] uppercase font-bold">
                      {project.category}
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded text-xs font-semibold ${
                    project.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {project.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <p className="text-[var(--text-muted)] text-sm mb-4 line-clamp-2">
                  {project.description}
                </p>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[var(--text-muted)]">
                      ₹{project.raised_amount.toLocaleString()}
                    </span>
                    <span className="text-[var(--accent-teal)] font-semibold">
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-[var(--bg-deep)] rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-[var(--accent-teal)] to-[var(--accent-teal-light)] h-full"
                      style={{width: `${progress}%`}}
                    ></div>
                  </div>
                  <p className="text-[var(--text-muted)] text-xs mt-1">
                    Goal: ₹{project.target_amount.toLocaleString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setEditingProject(project); 
                      setFormData({
                        title: project.title,
                        category: project.category,
                        description: project.description,
                        hero_image: project.hero_image,
                        target_amount: project.target_amount,
                        is_active: project.is_active
                      });
                      setShowForm(true);
                    }} 
                    className="btn-primary flex-1 py-2 flex items-center justify-center gap-1 text-sm"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(project.id, project.title)} 
                    className="btn-orange flex-1 py-2 flex items-center justify-center gap-1 text-sm"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProjectsManagement;
