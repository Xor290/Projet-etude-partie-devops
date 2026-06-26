import { useState, useEffect, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Menu, X, User, Search, Globe, ChevronDown, Activity } from 'lucide-react';
import { getCategories, getMyCart } from '../../services/api';

const Header = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [categories, setCategories] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = useCallback(async () => {
    try {
      const res = await getMyCart();
      const data = res.data;
      if (!data) { setCartCount(0); return; }
      if (Array.isArray(data.items)) {
        setCartCount(data.items.reduce((acc, item) => acc + (item.quantity || 0), 0));
      } else if (data.items && typeof data.items === 'object') {
        setCartCount(Object.values(data.items).reduce((acc, qty) => acc + qty, 0));
      } else {
        setCartCount(0);
      }
    } catch { setCartCount(0); }
  }, []);

  const currentLang = i18n.language;

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await getCategories();
        setCategories(Array.isArray(res.data) ? res.data : []);
      } catch (err) { console.error('Header Categories Error:', err); }
    };
    fetchCats();
  }, [currentLang]);

  useEffect(() => {
    fetchCartCount();

    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    const syncAuth = () => { setIsAuthenticated(!!localStorage.getItem('token')); fetchCartCount(); };
    const syncCart = () => fetchCartCount();

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('storage', syncAuth);
    window.addEventListener('authchange', syncAuth);
    window.addEventListener('cartchange', syncCart);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('authchange', syncAuth);
      window.removeEventListener('cartchange', syncCart);
    };
  }, [fetchCartCount]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim()) navigate(`/search?q=${searchValue}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('authchange'));
    setCartCount(0);
    setIsMenuOpen(false);
    navigate('/', { replace: true });
  };

  return (
    <header className={`ultra-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="top-utility desktop-only">
        <div className="container utils-flex">
           <div className="utility-left"><span>{t('header.subtitle', 'Althea Systems • Infrastructure médicale de précision')}</span></div>
           <div className="utility-right">
              <NavLink to="/contact">{t('header.technical_support', 'Support technique')}</NavLink>
              <div className="lang-select-wrapper">
                <Globe size={13} className="lang-select-icon" />
                <select
                  className="lang-select"
                  value={i18n.resolvedLanguage || i18n.language?.split('-')[0] || 'fr'}
                  onChange={(e) => {
                    const next = e.target.value;
                    i18n.changeLanguage(next);
                    window.dispatchEvent(new Event('languagechange'));
                  }}
                >
                  <option value="fr">FR</option>
                  <option value="en">EN</option>
                  <option value="ru">RU</option>
                </select>
              </div>
           </div>
        </div>
      </div>

      <div className="main-bar">
        <div className="container main-flex">
            <div className="flex-start">
                <button className="burger-btn mobile-only" onClick={() => setIsMenuOpen(true)}><Menu size={24} /></button>
                <NavLink to="/" className="brand-logo">
                    <div className="logo-symbol">A</div>
                    <div className="logo-text">
                        <span className="main">ALTHEA</span>
                        <span className="sub">SYSTEMS</span>
                    </div>
                </NavLink>
            </div>

            <nav className="desktop-only center-nav">
                <div className="nav-item has-dropdown">
                    <NavLink to="/catalogue" className="drop-trigger catalogue-trigger">Catalogue <ChevronDown size={14} /></NavLink>
                    <div className="nav-accent"></div>
                    <div className="mega-dropdown mega-dropdown--single">
                        <h6>Parcourir le catalogue</h6>
                        <div className="mega-links">
                            <NavLink to="/catalogue"><Activity size={16} /> Tous les produits</NavLink>
                            {categories.map(cat => (
                                <NavLink key={cat.id} to={`/catalogue?category=${cat.id}`}>
                                    <Activity size={16} />{cat.title}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="nav-item">
                    <NavLink to="/contact">Contact</NavLink>
                    <div className="nav-accent"></div>
                </div>
            </nav>

            <div className="flex-end">
                <form className="search-wrap desktop-only" onSubmit={handleSearch}>
                    <Search size={18} />
                    <input type="text" placeholder={t('header.search_placeholder', 'Rechercher un produit...')} value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
                </form>

                <div className="actions-cluster">
                    {!isAuthenticated ? (
                        <div className="auth-nav-links desktop-only">
                            <NavLink to="/login" className="nav-login-link">{t('header.sign_in', 'Connexion')}</NavLink>
                            <NavLink to="/register" className="btn-primary-sm">{t('header.register', "S'inscrire")}</NavLink>
                        </div>
                    ) : (
                        <div className="account-hub">
                            <button className="icon-action-btn"><User size={24} /></button>
                            <div className="profile-dropdown-container">
                                <div className="mini-profile-card">
                                    <div className="profile-header">{t('header.workspace', 'Espace de travail')}</div>
                                    <NavLink to="/account/settings">{t('header.my_profile', 'Mon profil')}</NavLink>
                                    <NavLink to="/account/orders">{t('header.quick_orders', 'Commandes rapides')}</NavLink>
                                    <button className="btn-logout" onClick={handleLogout}>{t('header.sign_out', 'Déconnexion')}</button>
                                </div>
                            </div>
                        </div>
                    )}
                    <NavLink to="/cart" className="cart-btn-wrap">
                        <div className="cart-icon-box">
                            <ShoppingCart size={22} />
                            {cartCount > 0 && <span className="badge">{cartCount > 99 ? '99+' : cartCount}</span>}
                        </div>
                    </NavLink>
                </div>
            </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="sidebar-mask" onClick={() => setIsMenuOpen(false)}>
            <div className="sidebar-panel" onClick={e => e.stopPropagation()}>
                <header className="side-header">
                    <div className="brand-logo"><div className="logo-symbol">A</div><div className="brand-text-sm">ALTHEA</div></div>
                    <button className="close-side" onClick={() => setIsMenuOpen(false)}><X size={24} /></button>
                </header>
                <div className="side-content">
                    <div className="side-section">
                        <label>Navigation principale</label>
                        <NavLink to="/" onClick={() => setIsMenuOpen(false)}>Accueil</NavLink>
                        <NavLink to="/catalogue" onClick={() => setIsMenuOpen(false)}>Catalogue de produits</NavLink>
                        <NavLink to="/contact" onClick={() => setIsMenuOpen(false)}>Contact</NavLink>
                    </div>
                    <div className="side-section">
                        <label>Catégories</label>
                        {categories.map((cat) => (
                            <NavLink key={cat.id} to={`/catalogue?category=${cat.id}`} onClick={() => setIsMenuOpen(false)}>{cat.title}</NavLink>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      )}

      <style>{`
        .ultra-header { background: white; position: sticky; top: 0; z-index: 2000; transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1); }
        .ultra-header.scrolled { box-shadow: 0 10px 40px -10px rgba(0,0,0,0.1); }
        .top-utility { background: #f8fafc; border-bottom: 1px solid #f1f5f9; padding: 0.6rem 0; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; }
        .utils-flex { display: flex; justify-content: space-between; align-items: center; }
        .utility-right { display: flex; gap: 1.5rem; align-items: center; }
        .lang-select-wrapper { display: flex; align-items: center; border: 1px solid #cbd5e1; padding: 0.15rem 0.4rem; border-radius: 6px; transition: all 0.2s ease; background: transparent; }
        .lang-select-wrapper:hover { border-color: var(--primary); }
        .lang-select-icon { color: var(--text-main); }
        .lang-select { border: none; background: transparent; font-size: 0.7rem; font-weight: 800; color: var(--text-main); outline: none; cursor: pointer; text-transform: uppercase; font-family: inherit; margin-left: 2px; padding: 2px; }
        .main-bar { padding: 1.25rem 0; transition: inherit; }
        .ultra-header.scrolled .main-bar { padding: 0.8rem 0; }
        .main-flex { display: flex; justify-content: space-between; align-items: center; gap: 3rem; }
        .flex-start { display: flex; align-items: center; gap: 1.5rem; }
        .burger-btn { color: var(--text-main); }
        .brand-logo { display: flex; align-items: center; gap: 0.8rem; text-decoration: none; }
        .logo-symbol { background: var(--primary); color: white; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 12px; font-weight: 900; font-size: 1.5rem; }
        .logo-text { display: flex; flex-direction: column; line-height: 1; }
        .logo-text .main { font-weight: 900; font-size: 1.4rem; color: #012a4a; letter-spacing: -0.05em; }
        .logo-text .sub { font-weight: 400; font-size: 0.8rem; color: #64748b; letter-spacing: 0.2em; }
        .center-nav { display: flex; align-items: center; gap: 1.5rem; flex: 1; justify-content: center; }
        .nav-item { position: relative; padding: 0.5rem 0; }
        .nav-item a, .drop-trigger { font-weight: 700; font-size: 0.95rem; color: #4a4e69; text-decoration: none; transition: var(--transition); cursor: pointer; display: flex; align-items: center; gap: 4px; }
        .nav-item:hover a, .nav-item:hover .drop-trigger { color: var(--primary); }
        .nav-accent { position: absolute; bottom: 0; left: 0; width: 0; height: 2px; background: var(--primary); transition: width 0.3s ease; }
        .nav-item:hover .nav-accent { width: 100%; }
        .mega-dropdown { position: absolute; top: 100%; left: 50%; transform: translateX(-50%) translateY(20px); background: white; padding: 2rem; border-radius: 20px; box-shadow: 0 40px 80px -20px rgba(0,0,0,0.15); border: 1px solid #f1f5f9; width: 340px; visibility: hidden; opacity: 0; transition: all 0.3s ease; }
        .mega-dropdown--single h6 { font-size: 0.7rem; font-weight: 950; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.1em; margin-bottom: 1rem; }
        .nav-item:hover .mega-dropdown { visibility: visible; opacity: 1; transform: translateX(-50%) translateY(0); }
        .mega-links { display: flex; flex-direction: column; gap: 2px; }
        .mega-links a { display: flex; align-items: center; gap: 10px; padding: 0.6rem 0.8rem; border-radius: 10px; font-size: 0.9rem; font-weight: 700; color: #334155; }
        .mega-links a:hover { background: #f8fafc; color: var(--primary); }
        .flex-end { display: flex; align-items: center; gap: 2rem; justify-content: flex-end; }
        .search-wrap { display: flex; align-items: center; gap: 0.8rem; background: #f1f5f9; padding: 0.6rem 1.2rem; border-radius: 12px; width: 180px; transition: all 0.3s ease; }
        .search-wrap:focus-within { width: 280px; background: white; box-shadow: 0 0 0 2px var(--primary); }
        .search-wrap input { border: none; background: transparent; outline: none; font-size: 0.85rem; font-weight: 600; width: 100%; }
        .actions-cluster { display: flex; align-items: center; gap: 1.5rem; }
        .icon-action-btn { color: #475569; transition: var(--transition); }
        .icon-action-btn:hover { color: var(--primary); }
        .cart-icon-box { position: relative; width: 44px; height: 44px; background: #f1f5f9; color: var(--primary); display: flex; align-items: center; justify-content: center; border-radius: 12px; }
        .badge { position: absolute; top: -6px; right: -6px; background: #ef4444; color: white; min-width: 18px; height: 18px; padding: 0 3px; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 900; border-radius: 99px; border: 2.5px solid white; }
        .account-hub { position: relative; display: flex; align-items: center; height: 100%; }
        .profile-dropdown-container { position: absolute; top: 100%; right: 0; padding-top: 1rem; visibility: hidden; opacity: 0; transition: all 0.2s ease; z-index: 10; }
        .account-hub:hover .profile-dropdown-container { visibility: visible; opacity: 1; }
        .mini-profile-card { width: 240px; background: white; border-radius: 16px; padding: 1.5rem; box-shadow: 0 20px 50px rgba(0,0,0,0.15); border: 1px solid #f1f5f9; }
        .profile-header { font-size: 0.7rem; font-weight: 900; color: #94a3b8; text-transform: uppercase; margin-bottom: 1rem; letter-spacing: 0.05em; }
        .mini-profile-card a { display: block; padding: 0.6rem 0; font-size: 0.95rem; font-weight: 700; color: #334155; }
        .mini-profile-card a:hover { color: var(--primary); }
        .btn-logout { margin-top: 1rem; color: #ef4444; font-weight: 700; font-size: 0.9rem; }
        .auth-nav-links { display: flex; align-items: center; gap: 1.5rem; }
        .nav-login-link { font-weight: 800; color: #475569; font-size: 0.9rem; }
        .nav-login-link:hover { color: var(--primary); }
        .btn-primary-sm { background: var(--primary); color: white !important; text-align: center; padding: 0.6rem 1.2rem !important; border-radius: 10px; font-weight: 800; font-size: 0.9rem; }
        .btn-primary-sm:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0, 92, 151, 0.2); }
        .sidebar-mask { position: fixed; inset: 0; background: rgba(1, 42, 74, 0.4); backdrop-filter: blur(4px); z-index: 5000; }
        .sidebar-panel { width: 340px; height: 100%; background: white; animation: slideR 0.4s ease; }
        .side-header { padding: 2rem; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
        .side-content { padding: 2rem; }
        .side-section { margin-bottom: 2rem; }
        .side-section label { font-size: 0.7rem; font-weight: 900; color: #cbd5e1; display: block; margin-bottom: 1rem; }
        .side-section a { display: block; font-size: 1.15rem; font-weight: 800; color: #012a4a; padding: 0.8rem 0; border-bottom: 1px solid #f1f5f9; }
        @keyframes slideR { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        .mobile-only { display: block; }
        .desktop-only { display: none; }
        @media (min-width: 1024px) { .mobile-only { display: none; } .desktop-only { display: flex; } }
      `}</style>
    </header>
  );
};

export default Header;
