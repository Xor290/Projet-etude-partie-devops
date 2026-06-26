import { useParams, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Filter, Grid, List as ListIcon, Star, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getCategory } from '../services/api';
import Loader from '../components/common/Loader';

const Category = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const [viewMode, setViewMode] = useState('grid');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(null);

  const currentLang = i18n.language;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const catRes = await getCategory(id);
        setCategory(catRes.data);
        setProducts(catRes.data?.products || []);
      } catch (err) {
        console.error("Error fetching category data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, currentLang]);

  const categoryName = category?.title || "Medical Equipment";

  if (loading) return <Loader />;

  return (
    <div className="category-page modern-bg">
      {/* Premium Hero Banner */}
      <section className="cat-hero">
        <div className="container">
          <nav className="cat-breadcrumbs">
            <NavLink to="/">{t('home.welcome')}</NavLink>
            <ChevronRight size={12} />
            <span className="active">{categoryName}</span>
          </nav>
          
          <div className="hero-content">
            <h1 className="hero-title">{categoryName}</h1>
            <p className="hero-subtitle">Discover state-of-the-art technological solutions specialized in {categoryName.toLowerCase()}. Engineered for precision, integrated for performance.</p>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container cat-main">
        <div className="cat-toolbar card-glass">
            <div className="toolbar-sec">
                <button className="btn-filter">
                    <SlidersHorizontal size={18} />
                    <span>Filter & Refine</span>
                </button>
                <div className="results-badge">
                    <strong>{products.length}</strong> {t('product.products_found')}
                </div>
            </div>

            <div className="toolbar-sec">
                <div className="view-toggle">
                    <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}><Grid size={18} /></button>
                    <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}><ListIcon size={18} /></button>
                </div>
                <div className="sort-group">
                    <label>Sort By:</label>
                    <select className="minimal-select">
                        <option>Featured</option>
                        <option>Price: Low to High</option>
                        <option>Price: High to Low</option>
                    </select>
                </div>
            </div>
        </div>

        <div className={`product-flow ${viewMode}`}>
            {products.map(prod => (
                <NavLink to={`/product/${prod.id}`} key={prod.id} className="premium-card">
                    <div className="card-media">
                        <img src={prod.pictureUrl || '/images/prod_scanner.png'} alt={prod.title} />
                        {prod.inStock <= 0 && <span className="tag-oos">Limited Availability</span>}
                        <div className="card-overlay">
                           <button className="view-detail-btn">Quick View</button>
                        </div>
                    </div>
                    
                    <div className="card-info">
                        <div className="info-top">
                            <span className="cat-tag">{prod.medicalDomain}</span>
                            <div className="rating">
                                <Star size={12} fill="var(--accent)" color="var(--accent)" />
                                <span>4.9</span>
                            </div>
                        </div>
                        <h3 className="item-title">{prod.title}</h3>
                        <div className="info-bottom">
                            <span className="item-price">${Number(prod.price).toLocaleString()}</span>
                            <div className="stock-status">
                                <div className={`dot ${prod.inStock > 0 ? 'online' : 'offline'}`}></div>
                                <span>{prod.inStock > 0 ? "In Stock" : "Out of Stock"}</span>
                            </div>
                        </div>
                    </div>
                </NavLink>
            ))}
        </div>

        {products.length === 0 && (
            <div className="empty-state">
                <p>No equipment currently available in this specialized division.</p>
                <NavLink to="/search" className="btn-primary">Explore General Catalogue</NavLink>
            </div>
        )}
      </div>

      <style>{`
        .modern-bg { background: #fcfdfe; min-height: 100vh; }
        
        /* Hero Section */
        .cat-hero { 
            padding: 5rem 0 3rem; 
            background: linear-gradient(180deg, #f0f4f8 0%, #fcfdfe 100%);
            border-bottom: 1px solid var(--border);
            margin-bottom: 3rem;
        }
        .cat-breadcrumbs { display: flex; align-items: center; gap: 0.6rem; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 2rem; }
        .cat-breadcrumbs a:hover { color: var(--primary); }
        .cat-breadcrumbs .active { color: var(--primary); }

        .hero-title { font-size: 3.5rem; font-weight: 900; color: #012a4a; letter-spacing: -0.04em; margin-bottom: 1rem; line-height: 1; }
        .hero-subtitle { font-size: 1.15rem; color: #4a4e69; max-width: 650px; line-height: 1.6; }

        /* Toolbar */
        .cat-toolbar { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            padding: 1.25rem 2rem; 
            margin-bottom: 3rem;
            position: sticky;
            top: 100px;
            z-index: 100;
        }
        .card-glass { 
            background: rgba(255, 255, 255, 0.8); 
            backdrop-filter: blur(12px); 
            border: 1px solid rgba(255, 255, 255, 0.4);
            box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05);
            border-radius: 20px;
        }
        .toolbar-sec { display: flex; align-items: center; gap: 2rem; }
        
        .btn-filter { display: flex; align-items: center; gap: 0.75rem; font-weight: 700; font-size: 0.9rem; color: var(--primary); }
        .results-badge { font-size: 0.9rem; color: #64748b; }
        .results-badge strong { color: var(--text-main); font-weight: 800; }

        .view-toggle { display: flex; background: #f1f5f9; padding: 4px; border-radius: 10px; }
        .view-toggle button { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; color: #64748b; transition: var(--transition); }
        .view-toggle button.active { background: white; color: var(--primary); box-shadow: 0 4px 10px rgba(0,0,0,0.05); border-radius: 8px; }
        
        .sort-group { display: flex; align-items: center; gap: 0.8rem; }
        .sort-group label { font-size: 0.8rem; font-weight: 800; color: #64748b; text-transform: uppercase; }
        .minimal-select { border: none; background: transparent; font-weight: 700; color: var(--text-main); font-family: inherit; cursor: pointer; }

        /* Grid Flow */
        .product-flow.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 3rem; }
        
        .premium-card { 
            display: flex; 
            flex-direction: column; 
            text-decoration: none; 
            background: white; 
            border-radius: 24px; 
            transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
            position: relative;
            overflow: hidden;
            border: 1px solid transparent;
        }
        .premium-card:hover { 
            transform: translateY(-12px); 
            box-shadow: 0 40px 60px -20px rgba(0,0,0,0.1); 
            border-color: #f1f5f9;
        }

        .card-media { 
            height: 300px; 
            background: #f8fafc; 
            padding: 3rem; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            position: relative;
            overflow: hidden;
        }
        .card-media img { max-width: 100%; max-height: 100%; object-fit: contain; transition: transform 0.6s ease; }
        .premium-card:hover .card-media img { transform: scale(1.1); }
        
        .tag-oos { position: absolute; top: 1.5rem; left: 1.5rem; background: #1e293b; color: white; font-size: 0.65rem; font-weight: 900; text-transform: uppercase; padding: 0.4rem 0.8rem; border-radius: 6px; }
        
        .card-overlay { position: absolute; inset: 0; background: rgba(1, 42, 74, 0.05); opacity: 0; transition: var(--transition); display: flex; align-items: flex-end; justify-content: center; padding-bottom: 2rem; }
        .premium-card:hover .card-overlay { opacity: 1; }
        .view-detail-btn { background: white; color: var(--primary); padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 700; font-size: 0.9rem; box-shadow: 0 10px 20px rgba(0,0,0,0.1); }

        .card-info { padding: 2rem; flex: 1; display: flex; flex-direction: column; }
        .info-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
        .cat-tag { font-size: 0.7rem; font-weight: 800; color: var(--primary); text-transform: uppercase; letter-spacing: 0.05em; }
        .rating { display: flex; align-items: center; gap: 4px; font-size: 0.85rem; font-weight: 800; color: #fbbf24; }

        .item-title { font-size: 1.4rem; font-weight: 800; color: #012a4a; margin-bottom: 1.5rem; line-height: 1.2; height: 3.4rem; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
        
        .info-bottom { display: flex; align-items: flex-end; justify-content: space-between; margin-top: auto; }
        .item-price { font-size: 1.8rem; font-weight: 900; color: var(--primary); letter-spacing: -0.02em; }
        
        .stock-status { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; font-weight: 700; color: #64748b; }
        .dot { width: 8px; height: 8px; border-radius: 50%; }
        .dot.online { background: #10b981; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1); }
        .dot.offline { background: #ef4444; }

        /* List Mode */
        .product-flow.list { display: flex; flex-direction: column; gap: 2rem; }
        .product-flow.list .premium-card { flex-direction: row; height: 260px; }
        .product-flow.list .card-media { width: 300px; height: 100%; padding: 2rem; }
        .product-flow.list .item-title { height: auto; margin-bottom: 0.5rem; }

        @media (max-width: 1024px) {
            .hero-title { font-size: 2.5rem; }
            .cat-toolbar { flex-direction: column; gap: 1.5rem; align-items: flex-start; padding: 1.5rem; }
            .toolbar-sec { width: 100%; justify-content: space-between; }
        }
      `}</style>
    </div>
  );
};

export default Category;
