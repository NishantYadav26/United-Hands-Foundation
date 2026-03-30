import { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MediaLibrary = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await axios.get(`${API}/site-assets`);
      setAssets(response.data.assets);
    } catch (error) {
      console.error('Failed to fetch assets:', error);
      toast.error('Failed to load media library');
    } finally {
      setLoading(false);
    }
  };

  const uploadWidget = (assetKey, assetName) => {
    if (!window.cloudinary) {
      toast.error('Cloudinary widget not loaded');
      return;
    }

    window.cloudinary.openUploadWidget({
      cloudName: 'dvmb3mzcy',
      uploadPreset: 'uhf_unsigned',
      sources: ['local', 'url', 'camera'],
      multiple: false,
      folder: 'site_assets',
      resourceType: 'image',
      clientAllowedFormats: ['png', 'jpg', 'jpeg', 'webp'],
      maxFileSize: 10000000
    }, async (error, result) => {
      if (error) {
        toast.error('Upload failed: ' + (error?.message || JSON.stringify(error)));
        return;
      }

      if (result.event === 'success') {
        try {
          const token = localStorage.getItem('uhf_admin_token');
          if (!token) {
            toast.error('Session expired. Please login again.');
            return;
          }
          await axios.post(`${API}/site-assets`, {
            asset_key: assetKey,
            asset_url: result.info.secure_url,
            asset_name: assetName,
            description: `Uploaded ${new Date().toLocaleDateString()}`
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          toast.success('Image uploaded successfully!');
          fetchAssets();
        } catch (err) {
          console.error('Failed to save asset:', err);
          const msg = err.response?.data?.detail || err.message || 'Unknown error';
          toast.error(`Failed to save image: ${msg}`);
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin" style={{color: 'var(--accent-teal)'}} size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-morph p-6 rounded">
        <h3 className="text-2xl font-medium mb-2" style={{fontFamily: 'Cormorant Garamond, serif'}}>
          Media <span className="text-gradient-blue">Library</span>
        </h3>
        <p className="text-[var(--text-muted)] text-sm mb-6">
          Upload and manage all website images. Changes appear instantly across the entire site.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {assets.map(asset => (
          <div key={asset.asset_key} className="glass-morph p-6 rounded hover-lift" data-testid={`asset-${asset.asset_key}`}>
            <div className="aspect-square bg-[var(--bg-surface)] rounded mb-4 flex items-center justify-center overflow-hidden">
              {asset.asset_url ? (
                <img 
                  src={asset.asset_url} 
                  alt={asset.asset_name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon style={{color: 'var(--accent-teal)'}} size={48} />
              )}
            </div>
            
            <h3 className="text-[var(--text-primary)] font-semibold mb-1 text-sm sm:text-base">
              {asset.asset_name}
            </h3>
            <p className="text-[var(--text-muted)] text-xs mb-4 line-clamp-2">
              {asset.description || 'No description'}
            </p>
            
            <button 
              onClick={() => uploadWidget(asset.asset_key, asset.asset_name)}
              className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-2 sm:py-3"
              data-testid={`upload-${asset.asset_key}`}
            >
              <Upload size={16} />
              {asset.asset_url ? 'Replace' : 'Upload'}
            </button>

            {asset.updated_at && (
              <p className="text-[var(--text-muted)] text-xs mt-2 text-center">
                Updated: {new Date(asset.updated_at).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaLibrary;
