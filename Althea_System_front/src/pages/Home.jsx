import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { 
  ArrowRight, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  Truck, 
  Zap,
  Activity,
  Layers,
  Dna,
  Warehouse
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { getCategories, getProducts } from '../services/api';
import Loader from '../components/common/Loader';

const Home = () => {
    const { t, i18n } = useTranslation();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [topProducts, setTopProducts] = useState([]);

    const slides = [
        {
          id: 1,
          image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=2070&auto=format&fit=crop',
          title: 'Precision in Every Solution',
          desc: 'Top-tier medical hardware trusted by leading clinics worldwide. Engineered for zero-failure performance.',
          cta: 'Explore Products'
        },
        {
          id: 2,
          image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=2070&auto=format&fit=crop',
          title: 'Advanced Diagnostic Tools',
          desc: 'Next-generation scanners and imaging technology. High-fidelity imaging for life-critical diagnostics.',
          cta: 'Learn More'
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
          setCurrentSlide(prev => (prev + 1) % slides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [slides.length]);

    const categoryIconMap = {
        'Surgical Systems': <Activity size={32} />,
        'Diagnostic Imaging': <Layers size={32} />,
        'Lab Automation': <Dna size={32} />,
        'Infrastructure': <Warehouse size={32} />,
        'Surgical Equipment': <Activity size={32} />,
        'Diagnostics': <Layers size={32} />,
        'Laboratory Tools': <Dna size={32} />,
        'Ward Furniture': <Warehouse size={32} />,
    };

    const currentLang = i18n.language;

    useEffect(() => {
        const fetchData = async () => {
          try {
            // Real endpoints: GET /api/categories and GET /api/products
            const [catsRes, prodsRes] = await Promise.all([
              getCategories(),
              getProducts()
            ]);

            const catsData = Array.isArray(catsRes.data) ? catsRes.data : [];
            setCategories(catsData.map(cat => ({
              id: cat.id,
              name: cat.title,
              icon: categoryIconMap[cat.title] || <Activity size={32} />,
              image: cat.pictureUrl || 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=2070&auto=format&fit=crop',
              desc: `Specialized solutions for ${(cat.title || '').toLowerCase()}.`
            })));

            const prodsData = Array.isArray(prodsRes.data) ? prodsRes.data : [];
            setTopProducts(prodsData.slice(0, 3).map(prod => ({
              id: prod.id,
              name: prod.title,
              price: `$${Number(prod.price).toLocaleString()}`,
              rating: 4.8,
              medicalDomain: prod.medicalDomain || prod.category?.title || 'Medical',
              image: prod.pictureUrl || null
            })));
          } catch (err) {
            console.error('Home Data Fetch Error:', err);
          } finally {
            setLoading(false);
          }
        };
        fetchData();
    }, [currentLang]);

    if (loading) return <Loader />;

    return (
        <div className="home-page">
            {/* Ultra Hero Carousel */}
            <section className="hero-section">
                <div className="hero-carousel">
                    {slides.map((slide, idx) => (
                        <div key={slide.id} className={`carousel-slide ${idx === currentSlide ? 'active' : ''}`} style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.2)), url(${slide.image})` }}>
                            <div className="hero-content">
                                <span className="hero-badge">Althea Innovation 2026</span>
                                <h1 className="hero-title">{slide.title}</h1>
                                <p className="hero-desc">{slide.desc}</p>
                                <div className="hero-actions">
                                    <NavLink to="/catalogue" className="btn-primary-lg">
                                        {slide.cta} <ArrowRight size={20} />
                                    </NavLink>
                                    <NavLink to="/contact" className="btn-outline-white">Support Center</NavLink>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="carousel-nav">
                        <button onClick={() => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length)} className="nav-arrow"><ChevronLeft size={30} /></button>
                        <button onClick={() => setCurrentSlide(prev => (prev + 1) % slides.length)} className="nav-arrow"><ChevronRight size={30} /></button>
                    </div>
                </div>
            </section>

            {/* Core Values Section */}
            <section className="values-section">
                <div className="container">
                    <div className="values-header">
                        <label>Excellence in Service</label>
                        <h2>The Althea Standard</h2>
                        <p>We provide foundational infrastructure for the next generation of patient care.</p>
                    </div>
                    <div className="values-grid">
                        <div className="value-card">
                            <div className="value-icon"><ShieldCheck size={40} /></div>
                            <h4>Certified Quality</h4>
                            <p>Full ISO 13485 compliance for critical medical applications.</p>
                        </div>
                        <div className="value-card">
                            <div className="value-icon"><Truck size={40} /></div>
                            <h4>Global Logistics</h4>
                            <p>Direct supply chain to 120+ countries with cold-chain support.</p>
                        </div>
                        <div className="value-card">
                            <div className="value-icon"><Zap size={40} /></div>
                            <h4>24/7 Tech Hub</h4>
                            <p>Live technical monitoring and on-site expert maintenance.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Premium Categories Grid */}
            <section className="categories-section">
                <div className="container">
                    <div className="section-header">
                        <h3>Institutional Divisions</h3>
                        <NavLink to="/catalogue" className="text-cta">See All Categories <ArrowRight size={16} /></NavLink>
                    </div>
                    {categories.length > 0 ? (
                        <div className="categories-grid-premium">
                            {categories.map(cat => (
                                <NavLink key={cat.id} to={`/category/${cat.id}`} className="cat-card-premium">
                                    <div className="cat-image-bg" style={{ backgroundImage: `url(${cat.image})` }}></div>
                                    <div className="cat-content">
                                        <div className="cat-icon-box">{cat.icon}</div>
                                        <div className="cat-info">
                                            <h4>{cat.name}</h4>
                                            <p>{cat.desc}</p>
                                        </div>
                                        <div className="cat-footer">
                                            <span>Enter Division</span>
                                            <div className="nav-circ"><ChevronRight size={18} /></div>
                                        </div>
                                    </div>
                                </NavLink>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>No connected categories are available yet.</p>
                            <NavLink to="/catalogue" className="btn-primary">Browse Products</NavLink>
                        </div>
                    )}
                </div>
            </section>

            {/* Featured Products */}
            <section className="top-products-section">
                <div className="container">
                    <div className="section-header">
                        <h3>Critical Assets</h3>
                        <p>Recently deployed technologies in European hospitals.</p>
                    </div>
                    <div className="products-grid-premium">
                        {topProducts.map(prod => (
                            <div key={prod.id} className="prod-card-premium">
                                <div className="prod-image">
                                    <img src={prod.image} alt={prod.name} />
                                    <div className="prod-badge">{prod.medicalDomain}</div>
                                    <div className="prod-actions-overlay">
                                        <NavLink to={`/product/${prod.id}`} className="view-btn">Full Specs</NavLink>
                                    </div>
                                </div>
                                <div className="prod-details">
                                    <div className="prod-rating">
                                        <Star size={14} fill="#fbbf24" color="#fbbf24" />
                                        <span>{prod.rating} Internal Rating</span>
                                    </div>
                                    <h4>{prod.name}</h4>
                                    <div className="prod-footer">
                                        <span className="prod-price">{prod.price}</span>
                                        <button className="add-cart-mini">{t('product.add_to_cart')}</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <style>{`
                /* Hero Section Enhancements */
                .hero-section { height: 85vh; position: relative; overflow: hidden; margin-top: -1px; }
                .hero-carousel { height: 100%; position: relative; }
                .carousel-slide { 
                    position: absolute; inset: 0; 
                    background-size: cover; background-position: center; 
                    opacity: 0; transition: opacity 1.2s cubic-bezier(0.165, 0.84, 0.44, 1);
                    display: flex; align-items: center; justify-content: center;
                }
                .carousel-slide.active { opacity: 1; z-index: 10; }
                
                .hero-content { max-width: 900px; text-align: center; color: white; transform: translateY(30px); opacity: 0; transition: all 1s 0.3s; padding: 2rem; }
                .carousel-slide.active .hero-content { transform: translateY(0); opacity: 1; }
                
                .hero-badge { display: inline-block; background: var(--primary); padding: 0.6rem 1.2rem; border-radius: 99px; font-weight: 900; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.15em; margin-bottom: 2rem; box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
                .hero-title { font-size: 4.5rem; font-weight: 950; letter-spacing: -0.05em; line-height: 1; margin-bottom: 1.5rem; }
                .hero-desc { font-size: 1.4rem; opacity: 0.9; line-height: 1.5; margin-bottom: 3.5rem; font-weight: 400; }
                
                .hero-actions { display: flex; gap: 1.5rem; justify-content: center; }
                .btn-primary-lg { background: var(--primary); color: white; padding: 1.2rem 2.5rem; border-radius: 16px; font-weight: 800; display: flex; align-items: center; gap: 1rem; font-size: 1.1rem; transition: all 0.3s; }
                .btn-primary-lg:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0, 92, 151, 0.4); }
                .btn-outline-white { border: 2px solid white; color: white; padding: 1.2rem 2.5rem; border-radius: 16px; font-weight: 800; font-size: 1.1rem; transition: all 0.3s; }
                .btn-outline-white:hover { background: white; color: var(--primary); transform: translateY(-4px); }

                .carousel-nav { position: absolute; width: 100%; top: 50%; transform: translateY(-50%); display: flex; justify-content: space-between; padding: 0 3rem; z-index: 30; pointer-events: none; }
                .nav-arrow { width: 60px; height: 60px; background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.3s; pointer-events: all; }
                .nav-arrow:hover { background: white; color: var(--primary); transform: scale(1.15); }

                /* Values Section */
                .values-section { padding: 8rem 0; background: white; }
                .values-header { text-align: center; margin-bottom: 5rem; }
                .values-header label { font-size: 0.75rem; font-weight: 900; color: var(--primary); text-transform: uppercase; letter-spacing: 0.2rem; display: block; margin-bottom: 1rem; }
                .values-header h2 { font-size: 3rem; font-weight: 950; color: #012a4a; letter-spacing: -0.04em; }
                .values-header p { font-size: 1.1rem; color: #64748b; margin-top: 1rem; max-width: 600px; margin-inline: auto; }

                .values-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3rem; }
                .value-card { padding: 3rem; border-radius: 24px; text-align: center; border: 1px solid #f1f5f9; transition: all 0.4s; }
                .value-card:hover { transform: translateY(-10px); box-shadow: 0 40px 80px -20px rgba(0,0,0,0.06); border-color: transparent; }
                .value-icon { color: var(--primary); margin-bottom: 2rem; }
                .value-card h4 { font-size: 1.5rem; font-weight: 900; color: #012a4a; margin-bottom: 1rem; }
                .value-card p { font-size: 1rem; color: #64748b; line-height: 1.5; }

                /* Categories Premium */
                .categories-section { padding: 8rem 0; background: #fcfdfe; }
                .section-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 4rem; }
                .section-header h3 { font-size: 2.5rem; font-weight: 950; color: #012a4a; letter-spacing: -0.03em; }
                .text-cta { display: flex; align-items: center; gap: 10px; font-weight: 900; color: var(--primary); text-decoration: none; font-size: 0.9rem; }

                .categories-grid-premium { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; }
                .cat-card-premium { 
                    position: relative; height: 450px; border-radius: 32px; overflow: hidden; 
                    display: flex; flex-direction: column; justify-content: flex-end; padding: 2.5rem;
                    text-decoration: none; border: 1px solid #f1f5f9;
                }
                .cat-image-bg { position: absolute; inset: 0; background-size: cover; background-position: center; transition: transform 0.8s ease; }
                .cat-card-premium:hover .cat-image-bg { transform: scale(1.1); }
                .cat-card-premium::after { content: ''; position: absolute; inset: 0; background: linear-gradient(0deg, rgba(1, 42, 74, 1) 0%, rgba(1, 42, 74, 0.4) 60%, transparent 100%); }
                
                .cat-content { position: relative; z-index: 10; color: white; width: 100%; }
                .cat-icon-box { margin-bottom: 1.5rem; color: rgba(255,255,255,0.8); }
                .cat-info h4 { font-size: 1.6rem; font-weight: 950; margin-bottom: 0.5rem; }
                .cat-info p { font-size: 0.9rem; opacity: 0.7; margin-bottom: 2rem; line-height: 1.4; }
                
                .cat-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1.5rem; }
                .cat-footer span { font-weight: 800; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em; }
                .nav-circ { width: 36px; height: 36px; background: white; color: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; }

                /* Products Premium */
                .top-products-section { padding: 8rem 0; background: white; }
                .products-grid-premium { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3rem; }
                .prod-card-premium { display: flex; flex-direction: column; background: white; border-radius: 24px; overflow: hidden; }
                
                .prod-image { position: relative; height: 320px; background: #f8fafc; display: flex; align-items: center; justify-content: center; padding: 2rem; }
                .prod-image img { max-width: 100%; max-height: 100%; object-fit: contain; }
                .prod-badge { position: absolute; top: 1.5rem; left: 1.5rem; background: white; padding: 0.5rem 1rem; border-radius: 99px; font-size: 0.7rem; font-weight: 900; color: var(--primary); border: 1px solid #f1f5f9; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
                
                .prod-actions-overlay { position: absolute; inset: 0; background: rgba(0, 92, 151, 0.1); opacity: 0; transition: all 0.3s; display: flex; align-items: center; justify-content: center; }
                .prod-card-premium:hover .prod-actions-overlay { opacity: 1; }
                .view-btn { background: white; color: var(--primary); padding: 0.8rem 1.8rem; border-radius: 14px; font-weight: 900; text-decoration: none; box-shadow: 0 10px 20px rgba(0,0,0,0.1); }

                .prod-details { padding: 2rem; border: 1px solid #f1f5f9; border-top: none; border-radius: 0 0 24px 24px; }
                .prod-rating { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; font-weight: 700; color: #94a3b8; margin-bottom: 1rem; }
                .prod-rating span { color: #64748b; }
                .prod-details h4 { font-size: 1.4rem; font-weight: 950; color: #012a4a; margin-bottom: 1.5rem; }
                
                .prod-footer { display: flex; justify-content: space-between; align-items: center; }
                .prod-price { font-size: 1.8rem; font-weight: 900; color: var(--primary); letter-spacing: -0.02em; }
                .add-cart-mini { background: #f1f5f9; color: var(--primary); padding: 0.6rem 1.2rem; border-radius: 10px; font-weight: 800; font-size: 0.85rem; }
                .add-cart-mini:hover { background: var(--primary); color: white; }

                @media (max-width: 1024px) {
                    .hero-title { font-size: 2.5rem; }
                    .values-grid { grid-template-columns: 1fr; }
                    .categories-grid-premium { grid-template-columns: 1fr 1fr; }
                    .products-grid-premium { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};

export default Home;
