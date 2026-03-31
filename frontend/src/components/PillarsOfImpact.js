import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, GraduationCap, Stethoscope, AlertTriangle, HandHeart } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const categoryIcons = {
  'Elderly': Heart,
  'Education': GraduationCap,
  'Health': Stethoscope,
  'Disaster Relief': AlertTriangle,
  'General': HandHeart
};

const PillarsOfImpact = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API}/projects?active_only=true`);
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgress = (raised, target) => {
    return Math.min((raised / target) * 100, 100);
  };

  if (loading || projects.length === 0) return null;

  return (
    <section className="py-20 px-6 reveal-section" data-testid="pillars-section">
      <div className="max-w-7xl mx-auto">
        <h2
          className="text-4xl sm:text-5xl font-medium tracking-tight text-center mb-4"
          style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}
        >
          Our Pillars of <span className="text-gradient-gold">Impact</span>
        </h2>
        <p className="text-center mb-14 text-base" style={{ color: 'var(--text-muted)' }}>
          Choose a cause that resonates with your heart
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => {
            const Icon = categoryIcons[project.category] || HandHeart;
            const progress = getProgress(project.raised_amount, project.target_amount);

            return (
              <div
                key={project.id}
                className="card-elevated rounded-lg overflow-hidden hover-lift group"
                data-testid={`project-${project.id}`}
              >
                <div
                  className="h-56 bg-cover bg-center relative"
                  style={{ backgroundImage: `url('${project.hero_image}')` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1F2933] to-transparent opacity-70"></div>
                  <div className="absolute bottom-5 left-5">
                    <Icon className="mb-2" style={{ color: '#C6A15B' }} size={28} />
                    <span className="text-xs tracking-[0.2em] uppercase font-bold" style={{ color: '#C6A15B' }}>
                      {project.category}
                    </span>
                  </div>
                </div>

                <div className="p-7">
                  <h3
                    className="text-xl font-medium mb-3"
                    style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}
                  >
                    {project.title}
                  </h3>
                  <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-muted)' }}>
                    {project.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-5">
                    <div className="flex justify-between text-sm mb-2">
                      <span style={{ color: 'var(--text-muted)' }}>
                        ₹{project.raised_amount.toLocaleString()} raised
                      </span>
                      <span className="font-semibold" style={{ color: 'var(--accent-teal)' }}>
                        {progress.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
                      <div
                        className="h-full transition-all duration-500 rounded-full"
                        style={{ width: `${progress}%`, background: 'linear-gradient(90deg, var(--accent-teal), var(--accent-teal-light))' }}
                      ></div>
                    </div>
                    <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                      Goal: ₹{project.target_amount.toLocaleString()}
                    </p>
                  </div>

                  <Link
                    to={`/donate?project=${project.id}`}
                    data-testid={`donate-to-${project.id}`}
                  >
                    <button className="btn-gold w-full text-sm" style={{ padding: '12px 24px' }}>
                      Donate to this Cause
                    </button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PillarsOfImpact;
