import { useState, useEffect, useCallback } from 'react';
import { Filter, Loader2, Video } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import axios from 'axios';
import Masonry from 'react-masonry-css';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';

const BACKEND_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PressMedia = () => {
  const [pressItems, setPressItems] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [activeSection, setActiveSection] = useState('press');

  const districts = ['All', 'Dharashiv', 'Solapur', 'Latur', 'Palghar', 'Panchgani'];
  const years = ['All', '2026', '2025', '2024', '2023', '2022', '2021', '2020'];

  const fetchPressMedia = useCallback(async () => {
    try {
      const params = {};
      if (selectedDistrict && selectedDistrict !== 'All') params.district = selectedDistrict;
      if (selectedYear && selectedYear !== 'All') params.year = selectedYear;
      const response = await axios.get(`${API}/press-media`, { params });
      setPressItems(response.data);
    } catch (error) {
      console.error('Failed to fetch press media:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedDistrict, selectedYear]);

  const fetchVideos = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/videos`);
      setVideos(response.data);
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    }
  }, []);

  useEffect(() => {
    fetchPressMedia();
    fetchVideos();
  }, [selectedDistrict, selectedYear, fetchPressMedia, fetchVideos]);

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

  const renderPublicEmbed = (video) => {
    const type = getEmbedType(video.video_url);
    const ytId = type === 'youtube' ? extractYoutubeId(video.video_url) : null;

    if (type === 'youtube' && ytId) {
      return (
        <div className="aspect-video">
          <iframe src={`https://www.youtube.com/embed/${ytId}`} title={video.title} className="w-full h-full" allowFullScreen />
        </div>
      );
    }
    if (type === 'facebook') {
      return (
        <div className="aspect-video">
          <iframe src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(video.video_url)}&show_text=false&width=560`} className="w-full h-full" allowFullScreen />
        </div>
      );
    }
    return (
      <div className="aspect-video flex items-center justify-center" style={{ background: 'var(--bg-surface)' }}>
        <a href={video.video_url} target="_blank" rel="noopener noreferrer" className="text-center">
          <Video style={{ color: 'var(--text-muted)' }} size={48} className="mx-auto mb-2" />
          <span className="text-sm" style={{ color: 'var(--accent-teal)' }}>View on {type === 'instagram' ? 'Instagram' : 'External'}</span>
        </a>
      </div>
    );
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const breakpointColumns = { default: 3, 1100: 2, 700: 1 };
  const lightboxSlides = pressItems.map(item => ({ src: item.image_url, alt: item.title }));

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-deep)' }}>
      <Navbar />

      <div className="pt-28 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h1
              className="text-5xl sm:text-6xl font-medium tracking-tight mb-6"
              style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}
              data-testid="press-page-title"
            >
              Press & <span className="text-gradient-gold">Media</span>
            </h1>
            <p style={{ color: 'var(--text-muted)' }} className="text-base max-w-2xl mx-auto">
              Our work across healthcare, education, and community service has been recognized by leading publications
            </p>
          </div>

          {/* Section Toggle */}
          <div className="flex gap-4 mb-8 justify-center">
            <button
              onClick={() => setActiveSection('press')}
              className="px-6 py-3 text-sm font-semibold tracking-[0.1em] uppercase transition-colors rounded"
              style={{
                background: activeSection === 'press' ? 'var(--accent-teal)' : 'transparent',
                color: activeSection === 'press' ? '#fff' : 'var(--text-muted)',
                border: activeSection !== 'press' ? '1px solid var(--border-subtle)' : 'none'
              }}
              data-testid="press-section-btn"
            >
              Press Clippings
            </button>
            <button
              onClick={() => setActiveSection('videos')}
              className="px-6 py-3 text-sm font-semibold tracking-[0.1em] uppercase transition-colors rounded flex items-center gap-2"
              style={{
                background: activeSection === 'videos' ? 'var(--accent-gold)' : 'transparent',
                color: activeSection === 'videos' ? '#fff' : 'var(--text-muted)',
                border: activeSection !== 'videos' ? '1px solid var(--border-subtle)' : 'none'
              }}
              data-testid="videos-section-btn"
            >
              <Video size={16} />
              Video Clips
            </button>
          </div>

          {activeSection === 'press' && (
            <>
              {/* Filters */}
              <div className="card-elevated p-6 rounded-lg mb-12 flex flex-col md:flex-row gap-4 items-center" data-testid="filters">
                <Filter style={{ color: 'var(--accent-gold)' }} size={24} />
                <div className="flex-1">
                  <label className="text-xs tracking-[0.2em] uppercase font-bold mb-2 block" style={{ color: 'var(--accent-teal)' }}>District</label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="w-full rounded px-4 py-2 text-sm focus:outline-none"
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                    data-testid="filter-district"
                  >
                    {districts.map((district) => (<option key={district} value={district}>{district}</option>))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-xs tracking-[0.2em] uppercase font-bold mb-2 block" style={{ color: 'var(--accent-teal)' }}>Year</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full rounded px-4 py-2 text-sm focus:outline-none"
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                    data-testid="filter-year"
                  >
                    {years.map((year) => (<option key={year} value={year}>{year}</option>))}
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="animate-spin mx-auto mb-4" style={{ color: 'var(--accent-gold)' }} size={48} />
                  <p style={{ color: 'var(--text-muted)' }}>Loading press coverage...</p>
                </div>
              ) : pressItems.length === 0 ? (
                <div className="text-center py-12">
                  <p style={{ color: 'var(--text-muted)' }}>No press coverage found</p>
                </div>
              ) : (
                <Masonry breakpointCols={breakpointColumns} className="masonry-grid" columnClassName="masonry-grid_column" data-testid="masonry-grid">
                  {pressItems.map((item, index) => (
                    <div key={item.id} className="card-elevated rounded-lg overflow-hidden hover-lift cursor-pointer" onClick={() => openLightbox(index)} data-testid={`press-item-${item.id}`}>
                      <img src={item.image_url} alt={item.title} className="w-full h-auto" />
                      <div className="p-5">
                        <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
                        <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                          <span>{item.publication}</span>
                          <span>{item.year}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </Masonry>
              )}

              <Lightbox open={lightboxOpen} close={() => setLightboxOpen(false)} slides={lightboxSlides} index={lightboxIndex} plugins={[Zoom]} />
            </>
          )}

          {activeSection === 'videos' && (
            <div data-testid="videos-section">
              {videos.length === 0 ? (
                <div className="text-center py-16 card-elevated rounded-lg">
                  <Video className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} size={48} />
                  <p style={{ color: 'var(--text-muted)' }}>No video clips available yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {videos.map(video => (
                    <div key={video.id} className="card-elevated rounded-lg overflow-hidden hover-lift" data-testid={`video-public-${video.id}`}>
                      {renderPublicEmbed(video)}
                      <div className="p-5">
                        <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{video.title}</h3>
                        {video.description && <p className="text-sm line-clamp-2" style={{ color: 'var(--text-muted)' }}>{video.description}</p>}
                        <span className="inline-block mt-3 text-xs px-2 py-1 rounded" style={{ background: 'var(--bg-surface)', color: 'var(--accent-teal)' }}>{video.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PressMedia;
