import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, GraduationCap, Stethoscope, AlertTriangle, HandHeart } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
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
    <section className="py-24 px-6 reveal-section" data-testid="pillars-section">
      <div className="max-w-7xl mx-auto">
        <h2 
          className="text-4xl sm:text-5xl font-medium tracking-tight text-center mb-4"
          style={{fontFamily: 'Cormorant Garamond, serif'}}
        >
          Our Pillars of <span className="text-[#D4AF37]">Impact</span>
        </h2>
        <p className="text-center text-[#A1A1AA] mb-16 text-lg">
          Choose a cause that resonates with your heart
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => {
            const Icon = categoryIcons[project.category] || HandHeart;
            const progress = getProgress(project.raised_amount, project.target_amount);

            return (
              <div 
                key={project.id}
                className="glass-morph rounded overflow-hidden hover-lift group"
                data-testid={`project-${project.id}`}
              >
                <div 
                  className="h-64 bg-cover bg-center relative"
                  style={{backgroundImage: `url('${project.hero_image}')`}}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] to-transparent"></div>
                  <div className="absolute bottom-6 left-6">
                    <Icon className="text-[#D4AF37] mb-2" size={32} />
                    <span className="text-[#D4AF37] text-xs tracking-[0.2em] uppercase font-bold">
                      {project.category}
                    </span>
                  </div>
                </div>

                <div className="p-8">
                  <h3 
                    className="text-2xl font-medium mb-4 text-[#F5F5F7]"
                    style={{fontFamily: 'Cormorant Garamond, serif'}}
                  >
                    {project.title}
                  </h3>
                  <p className="text-[#A1A1AA] text-sm leading-relaxed mb-6">
                    {project.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[#A1A1AA]">
                        ₹{project.raised_amount.toLocaleString()} raised
                      </span>
                      <span className="text-[#D4AF37] font-semibold">
                        {progress.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-[#27272A] rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-[#D4AF37] to-[#E5C047] h-full transition-all duration-500"
                        style={{width: `${progress}%`}}
                      ></div>
                    </div>
                    <p className="text-[#A1A1AA] text-xs mt-2">
                      Goal: ₹{project.target_amount.toLocaleString()}
                    </p>
                  </div>

                  <Link 
                    to={`/donate?project=${project.id}`}
                    data-testid={`donate-to-${project.id}`}
                  >
                    <button className="btn-gold w-full">
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
