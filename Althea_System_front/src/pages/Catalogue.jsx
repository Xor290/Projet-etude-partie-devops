import { useState, useEffect, useCallback } from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import { Grid, List as ListIcon, Star, SlidersHorizontal, ChevronRight, X, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getProducts, getCategories } from '../services/api';
import Loader from '../components/common/Loader';

const Catalogue = () => {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadTime, setLoadTime] = useState(null);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('default');

  const activeCategoryId = searchParams.get('category')
    ? Number(searchParams.get('category'))
    : null;

  const currentLang = i18n.language;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const startTime = performance.now();
    try {
      const [prodRes, catRes] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);
      const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
      setProducts(prodRes.data || []);
      setCategories(catRes.data || []);
      setLoadTime(elapsed);
    } catch (err) {
      console.error('Catalogue fetch error:', err);
      setError('Impossible de charger les données. Vérifiez la connexion au serveur.');
    } finally {
      setLoading(false);
    }
  }, [currentLang]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCategoryFilter = (catId) => {
    if (catId === activeCategoryId) {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catId);
    }
    setSearchParams(searchParams);
  };

  const clearFilter = () => {
    searchParams.delete('category');
    setSearchParams(searchParams);
  };

  const filteredProducts = activeCategoryId
    ? products.filter((p) => p.category?.id === activeCategoryId)
    : products;

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'name') return a.title.localeCompare(b.title);
    return 0;
  });

  const activeCategory = categories.find((c) => c.id === activeCategoryId);

  if (loading) return <Loader />;

  return (
    <div className="catalogue-page">
      {/* Hero Banner */}
      <section className="cat-hero-banner">
        <div className="container">
          <nav className="cat-breadcrumb">
            <NavLink to="/">{t('catalogue.breadcrumb_home', 'Accueil')}</NavLink>
            <ChevronRight size={12} />
            <span className="active">{t('catalogue.breadcrumb_catalogue', 'Catalogue de produits')}</span>
            {activeCategory && (
              <>
                <ChevronRight size={12} />
                <span className="active">{activeCategory.title}</span>
              </>
            )}
          </nav>
          <h1 className="cat-hero-title">
            {activeCategory ? activeCategory.title : t('catalogue.breadcrumb_catalogue', 'Catalogue de produits')}
          </h1>
          <p className="cat-hero-sub">
            {activeCategory
              ? (i18n.language.startsWith('ru')
                  ? `Специализированные решения для ${activeCategory.title.toLowerCase()}.`
                  : i18n.language.startsWith('en')
                    ? `Specialized solutions for ${activeCategory.title.toLowerCase()}.`
                    : `Solutions spécialisées pour ${activeCategory.title.toLowerCase()}.`)
              : t('catalogue.hero_subtitle', 'Découvrez l\'ensemble de notre gamme d\'équipements médicaux de haute précision.')}
          </p>
          {loadTime && (
            <div className="load-time-badge">
              <Clock size={12} />
              <span>{t('catalogue.load_time', { defaultValue: 'Données chargées en {{time}}s', time: loadTime })}</span>
            </div>
          )}
        </div>
      </section>

      <div className="container catalogue-layout">
        {/* Sidebar Filters */}
        <aside className="cat-sidebar">
          <div className="sidebar-card">
            <div className="sidebar-header">
              <SlidersHorizontal size={16} />
              <h3>{t('catalogue.filter_by_category', 'Filtrer par catégorie')}</h3>
            </div>
            <ul className="cat-filter-list">
              <li>
                <button
                  className={`cat-filter-btn ${!activeCategoryId ? 'active' : ''}`}
                  onClick={clearFilter}
                >
                  <span>{t('catalogue.all_categories', 'Toutes les catégories')}</span>
                  <span className="count-badge">{products.length}</span>
                </button>
              </li>
              {categories.map((cat) => {
                const count = products.filter((p) => p.category?.id === cat.id).length;
                return (
                  <li key={cat.id}>
                    <button
                      className={`cat-filter-btn ${activeCategoryId === cat.id ? 'active' : ''}`}
                      onClick={() => handleCategoryFilter(cat.id)}
                    >
                      <span>{cat.title}</span>
                      <span className="count-badge">{count}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <main className="cat-main-content">
          {error && (
            <div className="error-banner">
              <p>{error}</p>
              <button onClick={fetchData} className="retry-btn">Réessayer</button>
            </div>
          )}

          {/* Toolbar */}
          <div className="cat-toolbar-bar">
            <div className="toolbar-left">
              {activeCategoryId && (
                <span className="active-filter-chip">
                  {activeCategory?.title}
                  <button onClick={clearFilter}><X size={12} /></button>
                </span>
              )}
              <span className="results-info">
                <strong>{sortedProducts.length}</strong> {sortedProducts.length === 1 ? t('catalogue.products_count_one', 'produit trouvé') : t('catalogue.products_count_other', 'produits trouvés')}
              </span>
            </div>
            <div className="toolbar-right">
              <div className="sort-group">
                <label>{t('catalogue.sort_by', 'Trier :')}</label>
                <select
                  className="minimal-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="default">{t('catalogue.sort_default', 'Par défaut')}</option>
                  <option value="price-asc">{t('catalogue.sort_price_asc', 'Prix croissant')}</option>
                  <option value="price-desc">{t('catalogue.sort_price_desc', 'Prix décroissant')}</option>
                  <option value="name">{t('catalogue.sort_name', 'Nom A-Z')}</option>
                </select>
              </div>
              <div className="view-toggle">
                <button
                  className={viewMode === 'grid' ? 'active' : ''}
                  onClick={() => setViewMode('grid')}
                  title="Vue grille"
                >
                  <Grid size={16} />
                </button>
                <button
                  className={viewMode === 'list' ? 'active' : ''}
                  onClick={() => setViewMode('list')}
                  title="Vue liste"
                >
                  <ListIcon size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {sortedProducts.length > 0 ? (
            <div className={`product-flow ${viewMode}`}>
              {sortedProducts.map((prod) => (
                <NavLink
                  to={`/product/${prod.id}`}
                  key={prod.id}
                  className="premium-card"
                >
                  <div className="card-media">
                    <img
                      src={prod.pictureUrl || '/images/prod_scanner.png'}
                      alt={prod.title}
                    />
                    {prod.inStock <= 0 && (
                      <span className="tag-oos">{t('catalogue.limited_supply', 'Stock limité')}</span>
                    )}
                    <div className="card-overlay">
                      <button className="view-detail-btn">{t('catalogue.view_details', 'Voir les détails')}</button>
                    </div>
                  </div>
                  <div className="card-info">
                    <div className="info-top">
                      <span className="cat-tag">
                        {prod.category?.title || prod.medicalDomain || 'Médical'}
                      </span>
                      <div className="rating">
                        <Star size={12} fill="var(--accent)" color="var(--accent)" />
                        <span>4.9</span>
                      </div>
                    </div>
                    <h3 className="item-title">{prod.title}</h3>
                    <div className="info-bottom">
                      <span className="item-price">
                        {Number(prod.price).toLocaleString(i18n.language, {
                          style: 'currency',
                          currency: 'EUR',
                        })}
                      </span>
                      <div className="stock-status">
                        <div className={`dot ${prod.inStock > 0 ? 'online' : 'offline'}`} />
                        <span>{prod.inStock > 0 ? t('catalogue.in_stock', 'En stock') : t('catalogue.out_of_stock', 'Rupture')}</span>
                      </div>
                    </div>
                  </div>
                </NavLink>
              ))}
            </div>
          ) : (
            <div className="empty-state-full">
              <p>{t('catalogue.no_products', 'Aucun produit disponible dans cette catégorie.')}</p>
              <button onClick={clearFilter} className="btn-primary-sm-blue">
                {t('catalogue.view_all_products', 'Voir tous les produits')}
              </button>
            </div>
          )}
        </main>
      </div>

      <style>{`
        .catalogue-page { background: #f8fafc; min-height: 100vh; }

        /* Hero */
        .cat-hero-banner {
          padding: 4.5rem 0 3rem;
          background: linear-gradient(135deg, #012a4a 0%, #005c97 100%);
          color: white;
          margin-bottom: 3rem;
        }
        .cat-breadcrumb {
          display: flex; align-items: center; gap: 0.5rem;
          font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.05em; color: rgba(255,255,255,0.6); margin-bottom: 1.5rem;
        }
        .cat-breadcrumb a { color: rgba(255,255,255,0.6); }
        .cat-breadcrumb a:hover { color: white; }
        .cat-breadcrumb .active { color: white; }
        .cat-hero-title {
          font-size: 3rem; font-weight: 950; letter-spacing: -0.04em;
          margin-bottom: 0.75rem; line-height: 1.1;
        }
        .cat-hero-sub { font-size: 1.1rem; opacity: 0.8; max-width: 600px; line-height: 1.6; }
        .load-time-badge {
          display: inline-flex; align-items: center; gap: 0.4rem;
          margin-top: 1.25rem; background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.2); padding: 0.35rem 0.8rem;
          border-radius: 99px; font-size: 0.72rem; font-weight: 700; color: rgba(255,255,255,0.8);
        }

        /* Layout */
        .catalogue-layout { display: grid; grid-template-columns: 280px 1fr; gap: 2.5rem; padding-bottom: 6rem; }

        /* Sidebar */
        .sidebar-card {
          background: white; border-radius: 20px;
          border: 1px solid #f1f5f9; padding: 2rem;
          position: sticky; top: 100px; align-self: start;
        }
        .sidebar-header { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1.5rem; }
        .sidebar-header h3 { font-size: 0.85rem; font-weight: 900; color: #012a4a; text-transform: uppercase; letter-spacing: 0.05em; }
        .cat-filter-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.35rem; }
        .cat-filter-btn {
          width: 100%; display: flex; justify-content: space-between; align-items: center;
          padding: 0.65rem 1rem; border-radius: 10px; font-size: 0.9rem;
          font-weight: 700; color: #334155; transition: all 0.2s; text-align: left;
        }
        .cat-filter-btn:hover { background: #f8fafc; color: var(--primary); }
        .cat-filter-btn.active { background: var(--primary); color: white; }
        .cat-filter-btn.active .count-badge { background: rgba(255,255,255,0.25); color: white; }
        .count-badge {
          background: #f1f5f9; color: #64748b; font-size: 0.7rem;
          font-weight: 900; padding: 0.15rem 0.55rem; border-radius: 99px;
        }

        /* Toolbar */
        .cat-toolbar-bar {
          display: flex; justify-content: space-between; align-items: center;
          background: white; border: 1px solid #f1f5f9; border-radius: 16px;
          padding: 1rem 1.5rem; margin-bottom: 2rem;
        }
        .toolbar-left { display: flex; align-items: center; gap: 1rem; }
        .toolbar-right { display: flex; align-items: center; gap: 1.5rem; }
        .results-info { font-size: 0.85rem; color: #64748b; font-weight: 600; }
        .results-info strong { color: #012a4a; font-weight: 900; }
        .active-filter-chip {
          display: flex; align-items: center; gap: 0.4rem;
          background: #e8f4fd; color: var(--primary); padding: 0.3rem 0.75rem;
          border-radius: 99px; font-size: 0.8rem; font-weight: 800;
        }
        .active-filter-chip button { display: flex; align-items: center; color: var(--primary); }
        .sort-group { display: flex; align-items: center; gap: 0.6rem; }
        .sort-group label { font-size: 0.78rem; font-weight: 800; color: #64748b; text-transform: uppercase; }
        .minimal-select { border: none; background: transparent; font-weight: 700; color: #334155; font-family: inherit; cursor: pointer; font-size: 0.9rem; }
        .view-toggle { display: flex; background: #f1f5f9; padding: 4px; border-radius: 10px; gap: 2px; }
        .view-toggle button { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; color: #64748b; transition: all 0.2s; border-radius: 8px; }
        .view-toggle button.active { background: white; color: var(--primary); box-shadow: 0 2px 8px rgba(0,0,0,0.06); }

        /* Products Grid */
        .product-flow.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 2rem; }
        .product-flow.list { display: flex; flex-direction: column; gap: 1.5rem; }
        .product-flow.list .premium-card { flex-direction: row; height: 200px; }
        .product-flow.list .card-media { width: 220px; height: 100%; flex-shrink: 0; }
        .product-flow.list .item-title { height: auto; }

        .premium-card {
          display: flex; flex-direction: column; text-decoration: none;
          background: white; border-radius: 20px;
          transition: all 0.35s cubic-bezier(0.165, 0.84, 0.44, 1);
          border: 1px solid #f1f5f9; overflow: hidden;
        }
        .premium-card:hover { transform: translateY(-8px); box-shadow: 0 30px 50px -15px rgba(0,0,0,0.09); }
        .card-media {
          height: 240px; background: #f8fafc; padding: 2rem;
          display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden;
        }
        .card-media img { max-width: 100%; max-height: 100%; object-fit: contain; transition: transform 0.5s ease; }
        .premium-card:hover .card-media img { transform: scale(1.08); }
        .tag-oos { position: absolute; top: 1rem; left: 1rem; background: #1e293b; color: white; font-size: 0.62rem; font-weight: 900; text-transform: uppercase; padding: 0.3rem 0.7rem; border-radius: 6px; }
        .card-overlay { position: absolute; inset: 0; background: rgba(1,42,74,0.06); opacity: 0; transition: 0.3s; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 1.5rem; }
        .premium-card:hover .card-overlay { opacity: 1; }
        .view-detail-btn { background: white; color: var(--primary); padding: 0.6rem 1.4rem; border-radius: 10px; font-weight: 700; font-size: 0.85rem; box-shadow: 0 8px 16px rgba(0,0,0,0.1); }
        .card-info { padding: 1.5rem; flex: 1; display: flex; flex-direction: column; }
        .info-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
        .cat-tag { font-size: 0.68rem; font-weight: 800; color: var(--primary); text-transform: uppercase; letter-spacing: 0.05em; }
        .rating { display: flex; align-items: center; gap: 4px; font-size: 0.8rem; font-weight: 800; color: #fbbf24; }
        .item-title { font-size: 1.1rem; font-weight: 800; color: #012a4a; margin-bottom: 1rem; line-height: 1.3; height: 2.9rem; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
        .info-bottom { display: flex; align-items: flex-end; justify-content: space-between; margin-top: auto; }
        .item-price { font-size: 1.4rem; font-weight: 900; color: var(--primary); letter-spacing: -0.02em; }
        .stock-status { display: flex; align-items: center; gap: 0.4rem; font-size: 0.72rem; font-weight: 700; color: #64748b; }
        .dot { width: 7px; height: 7px; border-radius: 50%; }
        .dot.online { background: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.15); }
        .dot.offline { background: #ef4444; }

        /* Empty / Error */
        .empty-state-full { text-align: center; padding: 6rem 2rem; color: #64748b; }
        .empty-state-full p { font-size: 1.1rem; margin-bottom: 1.5rem; }
        .btn-primary-sm-blue { background: var(--primary); color: white; padding: 0.75rem 1.8rem; border-radius: 12px; font-weight: 800; font-size: 0.9rem; }
        .error-banner { background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 1.25rem 1.5rem; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; color: #b91c1c; font-weight: 700; }
        .retry-btn { background: #ef4444; color: white; padding: 0.5rem 1.2rem; border-radius: 8px; font-weight: 800; font-size: 0.85rem; }

        @media (max-width: 1024px) {
          .catalogue-layout { grid-template-columns: 1fr; }
          .cat-sidebar { position: static; }
          .cat-hero-title { font-size: 2rem; }
          .product-flow.list .premium-card { flex-direction: column; height: auto; }
          .product-flow.list .card-media { width: 100%; height: 200px; }
        }
      `}</style>
    </div>
  );
};

export default Catalogue;
