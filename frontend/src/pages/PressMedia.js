import { useState, useEffect } from 'react';
import { Filter, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import axios from 'axios';
import Masonry from 'react-masonry-css';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PressMedia = () => {
  const [pressItems, setPressItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const districts = ['All', 'Dharashiv', 'Solapur', 'Latur', 'Palghar', 'Panchgani'];
  const years = ['All', '2024', '2023', '2022', '2021', '2020'];

  useEffect(() => {
    fetchPressMedia();
  }, [selectedDistrict, selectedYear]);

  const fetchPressMedia = async () => {
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
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const breakpointColumns = {
    default: 3,
    1100: 2,
    700: 1
  };

  const lightboxSlides = pressItems.map(item => ({
    src: item.image_url,
    alt: item.title
  }));

  return (
    <div className="min-h-screen bg-[var(--bg-deep)]">
      <Navbar />

      <div className="pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 
              className="text-5xl sm:text-6xl font-medium tracking-tight mb-6"
              style={{fontFamily: 'Cormorant Garamond, serif'}}
              data-testid="press-page-title"
            >
              Press & <span className="text-[var(--accent-gold)]">Media</span>
            </h1>
            <p className="text-[var(--text-muted)] text-lg max-w-2xl mx-auto">
              Our work in elderly care has been recognized by leading publications
            </p>
          </div>

          {/* Filters */}
          <div className="glass-morph p-6 rounded mb-12 flex flex-col md:flex-row gap-4 items-center" data-testid="filters">
            <Filter className="text-[var(--accent-gold)]" size={24} />
            
            <div className="flex-1">
              <label className="text-[var(--accent-gold)] text-xs tracking-[0.2em] uppercase font-bold mb-2 block">District</label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full bg-[var(--bg-card)] border border-[var(--accent-gold)]/20 rounded px-4 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)]"
                data-testid="filter-district"
              >
                {districts.map((district) => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="text-[var(--accent-gold)] text-xs tracking-[0.2em] uppercase font-bold mb-2 block">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full bg-[var(--bg-card)] border border-[var(--accent-gold)]/20 rounded px-4 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)]"
                data-testid="filter-year"
              >
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Masonry Grid */}
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="animate-spin text-[var(--accent-gold)] mx-auto mb-4" size={48} />
              <p className="text-[var(--text-muted)]">Loading press coverage...</p>
            </div>
          ) : pressItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[var(--text-muted)]">No press coverage found</p>
            </div>
          ) : (
            <Masonry
              breakpointCols={breakpointColumns}
              className="masonry-grid"
              columnClassName="masonry-grid_column"
              data-testid="masonry-grid"
            >
              {pressItems.map((item, index) => (
                <div
                  key={item.id}
                  className="glass-morph rounded overflow-hidden hover-lift cursor-pointer"
                  onClick={() => openLightbox(index)}
                  data-testid={`press-item-${item.id}`}
                >
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-auto"
                  />
                  <div className="p-6">
                    <h3 className="text-[var(--text-primary)] font-semibold mb-2">{item.title}</h3>
                    <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                      <span>{item.publication}</span>
                      <span>{item.year}</span>
                    </div>
                  </div>
                </div>
              ))}
            </Masonry>
          )}

          {/* Lightbox */}
          <Lightbox
            open={lightboxOpen}
            close={() => setLightboxOpen(false)}
            slides={lightboxSlides}
            index={lightboxIndex}
            plugins={[Zoom]}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PressMedia;