import { useState } from 'react';
import { Upload, Loader2, FileText, Save, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AIChiefOfStaff = () => {
  const [file, setFile] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setExtractedData(null);
    }
  };

  const handleExtract = async () => {
    if (!file) return;
    setExtracting(true);
    try {
      const token = localStorage.getItem('uhf_admin_token');
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(`${API}/ai/extract-story`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        timeout: 60000
      });
      
      setExtractedData(response.data.data);
      toast.success('Data extracted successfully!');
    } catch (error) {
      console.error('Extraction failed:', error);
      toast.error(error.response?.data?.detail || 'Failed to extract data from file');
    } finally {
      setExtracting(false);
    }
  };

  const handleSaveAsStory = async () => {
    if (!extractedData) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('uhf_admin_token');
      await axios.post(`${API}/success-stories`, {
        location: extractedData.location || 'Latur',
        patient_count: extractedData.patient_count || 0,
        date: extractedData.date || new Date().toISOString().split('T')[0],
        story_text: extractedData.story || '',
        category: extractedData.category || 'General'
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      toast.success('Success story saved!');
      setFile(null);
      setExtractedData(null);
    } catch (error) {
      toast.error('Failed to save story');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAsPressMedia = async () => {
    if (!extractedData) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('uhf_admin_token');
      await axios.post(`${API}/press-media`, {
        title: extractedData.title || 'News Clipping',
        publication: 'Extracted via AI',
        district: extractedData.location || 'Latur',
        year: (extractedData.date || '').substring(0, 4) || new Date().getFullYear().toString(),
        image_url: '',
        category: extractedData.category || 'General'
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      toast.success('Press media entry saved!');
      setFile(null);
      setExtractedData(null);
    } catch (error) {
      toast.error('Failed to save press media entry');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div data-testid="ai-chief-panel">
      <div className="flex items-center gap-3 mb-8">
        <FileText style={{color: 'var(--accent-teal)'}} size={28} />
        <h2 className="text-3xl font-medium" style={{fontFamily: 'Cormorant Garamond, serif'}}>
          AI Chief of Staff
        </h2>
      </div>
      <p className="text-sm mb-8" style={{color: 'var(--text-muted)'}}>
        Upload a PDF report or news clipping image. AI will extract key information and generate a success story draft.
      </p>

      {/* Upload Area */}
      <div className="p-8 rounded mb-8" style={{background: 'var(--bg-card)', border: '1px solid var(--border-subtle)'}}>
        <div className="flex flex-col items-center justify-center py-8" style={{border: '2px dashed var(--border-subtle)', borderRadius: '8px'}}>
          <Upload style={{color: 'var(--accent-teal)'}} size={48} className="mb-4" />
          <p className="text-sm mb-4" style={{color: 'var(--text-muted)'}}>
            {file ? file.name : 'Drop PDF or Image here, or click to browse'}
          </p>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="hidden"
            id="ai-file-upload"
            data-testid="ai-file-input"
          />
          <label htmlFor="ai-file-upload" className="btn-primary cursor-pointer text-sm px-6 py-2">
            Choose File
          </label>
        </div>

        {file && (
          <div className="flex items-center gap-4 mt-6">
            <div className="flex-1 p-3 rounded flex items-center gap-3" style={{background: 'var(--bg-surface)'}}>
              <FileText style={{color: 'var(--accent-warm)'}} size={20} />
              <span className="text-sm truncate" style={{color: 'var(--text-primary)'}}>{file.name}</span>
              <span className="text-xs px-2 py-0.5 rounded" style={{background: 'var(--bg-deep)', color: 'var(--text-muted)'}}>
                {(file.size / 1024).toFixed(0)} KB
              </span>
            </div>
            <button onClick={() => { setFile(null); setExtractedData(null); }} className="p-2" style={{color: 'var(--text-muted)'}}>
              <X size={18} />
            </button>
            <button 
              onClick={handleExtract} 
              disabled={extracting}
              className="btn-gold flex items-center gap-2"
              data-testid="extract-btn"
            >
              {extracting ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />}
              {extracting ? 'Extracting...' : 'Extract Data'}
            </button>
          </div>
        )}
      </div>

      {/* Extracted Data Preview */}
      {extractedData && (
        <div className="p-8 rounded" style={{background: 'var(--bg-card)', border: '1px solid var(--accent-teal)', borderColor: 'rgba(77,168,160,0.3)'}} data-testid="extracted-data">
          <h3 className="font-semibold text-lg mb-6" style={{color: 'var(--accent-teal)'}}>Extracted Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded" style={{background: 'var(--bg-surface)'}}>
              <span className="text-xs uppercase tracking-[0.15em] font-bold block mb-1" style={{color: 'var(--accent-warm)'}}>Title</span>
              <span style={{color: 'var(--text-primary)'}}>{extractedData.title || 'N/A'}</span>
            </div>
            <div className="p-4 rounded" style={{background: 'var(--bg-surface)'}}>
              <span className="text-xs uppercase tracking-[0.15em] font-bold block mb-1" style={{color: 'var(--accent-warm)'}}>Location</span>
              <span style={{color: 'var(--text-primary)'}}>{extractedData.location || 'N/A'}</span>
            </div>
            <div className="p-4 rounded" style={{background: 'var(--bg-surface)'}}>
              <span className="text-xs uppercase tracking-[0.15em] font-bold block mb-1" style={{color: 'var(--accent-warm)'}}>Beneficiaries</span>
              <span style={{color: 'var(--text-primary)'}}>{extractedData.patient_count || 0}</span>
            </div>
            <div className="p-4 rounded" style={{background: 'var(--bg-surface)'}}>
              <span className="text-xs uppercase tracking-[0.15em] font-bold block mb-1" style={{color: 'var(--accent-warm)'}}>Category</span>
              <span style={{color: 'var(--text-primary)'}}>{extractedData.category || 'General'}</span>
            </div>
            <div className="p-4 rounded" style={{background: 'var(--bg-surface)'}}>
              <span className="text-xs uppercase tracking-[0.15em] font-bold block mb-1" style={{color: 'var(--accent-warm)'}}>Date</span>
              <span style={{color: 'var(--text-primary)'}}>{extractedData.date || 'N/A'}</span>
            </div>
          </div>

          <div className="p-4 rounded mb-6" style={{background: 'var(--bg-surface)'}}>
            <span className="text-xs uppercase tracking-[0.15em] font-bold block mb-2" style={{color: 'var(--accent-warm)'}}>Generated Story</span>
            <p className="leading-relaxed" style={{color: 'var(--text-primary)'}}>{extractedData.story || 'No story generated'}</p>
          </div>

          <div className="flex gap-4">
            <button onClick={handleSaveAsStory} disabled={saving} className="btn-primary flex items-center gap-2" data-testid="save-story-btn">
              <Save size={16} />
              {saving ? 'Saving...' : 'Save as Success Story'}
            </button>
            <button onClick={handleSaveAsPressMedia} disabled={saving} className="btn-orange flex items-center gap-2" data-testid="save-press-btn">
              <Save size={16} />
              {saving ? 'Saving...' : 'Save as Press Entry'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChiefOfStaff;
