import { useState, useEffect } from 'react';
import { useSearchParams, NavLink } from 'react-router-dom';
import { 
  Search as SearchIcon, 
  Star,
  ChevronRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getProducts, searchProducts } from '../services/api';
import Loader from '../components/common/Loader';

const Search = () => {
    const { i18n } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [internalQuery, setInternalQuery] = useState(query);

    const currentLang = i18n.language;

    useEffect(() => {
        if (query.length >= 2) {
            handleSearch(query);
            return;
        }

        handleLoadAllProducts();
    }, [query, currentLang]);

    const handleSearch = async (searchTerm) => {
        setLoading(true);
        try {
            const res = await searchProducts(searchTerm);
            setResults(res.data);
        } catch (err) {
            console.error("Search Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadAllProducts = async () => {
        setLoading(true);
        try {
            const res = await getProducts();
            setResults(res.data || []);
        } catch (err) {
            console.error("Catalogue Load Error:", err);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const onSearchSubmit = (e) => {
        e.preventDefault();
        setSearchParams({ q: internalQuery });
    };

    return (
        <div className="search-page modern-bg">
            <section className="search-hero">
                <div className="container">
                    <nav className="cat-breadcrumbs">
                        <NavLink to="/">Accueil</NavLink>
                        <ChevronRight size={12} />
                        <NavLink to="/catalogue">Catalogue</NavLink>
                        <ChevronRight size={12} />
                        <span className="active">Recherche d'équipement</span>
                    </nav>

                    <div className="search-bar-wrap">
                        <h1>Catalogue Explorer</h1>
                        <form onSubmit={onSearchSubmit} className="main-search-form">
                            <SearchIcon className="search-icon" size={24} />
                            <input 
                                type="text" 
                                placeholder="Search by equipment name, clinical domain, or specs..." 
                                value={internalQuery}
                                onChange={(e) => setInternalQuery(e.target.value)}
                            />
                            <button type="submit" className="btn-search">Scan Inventory</button>
                        </form>
                    </div>
                </div>
            </section>

            <div className="container search-results-area">
                {loading ? (
                    <div style={{ padding: '8rem 0' }}><Loader /></div>
                ) : (
                    <>
                        <div className="results-header">
                            {query ? (
                                <h2>Results for <span>"{query}"</span></h2>
                            ) : (
                                <h2>Browse <span>Full Catalogue</span></h2>
                            )}
                            <p>{results.length} authorized items found</p>
                        </div>

                        {results.length > 0 ? (
                            <div className="product-flow grid">
                                {results.map(prod => (
                                    <NavLink to={`/product/${prod.id}`} key={prod.id} className="premium-card">
                                        <div className="card-media">
                                            <img src={prod.pictureUrl || '/images/prod_scanner.png'} alt={prod.title} />
                                            <div className="card-overlay">
                                                <button className="view-detail-btn">Full Specs</button>
                                            </div>
                                        </div>
                                        
                                        <div className="card-info">
                                            <div className="info-top">
                                                <span className="cat-tag">{prod.medicalDomain || 'Clinical'}</span>
                                                <div className="rating">
                                                    <Star size={12} fill="var(--accent)" color="var(--accent)" />
                                                    <span>Verified</span>
                                                </div>
                                            </div>
                                            <h3 className="item-title">{prod.title}</h3>
                                            <div className="info-bottom">
                                                <span className="item-price">${Number(prod.price).toLocaleString()}</span>
                                                <div className="stock-status">
                                                    <div className={`dot online`}></div>
                                                    <span>Ready</span>
                                                </div>
                                            </div>
                                        </div>
                                    </NavLink>
                                ))}
                            </div>
                        ) : (
                            query.length >= 2 && (
                                <div className="empty-search text-center">
                                    <div className="empty-icon"><SearchIcon size={64} opacity={0.2} /></div>
                                    <h3>No equipment matches found</h3>
                                    <p>Try adjusting your parameters or contact support for specialized procurement.</p>
                                    <button
                                        className="btn-outline-primary"
                                        onClick={() => {
                                            setInternalQuery('');
                                            setSearchParams({});
                                        }}
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            )
                        )}
                    </>
                )}
            </div>

            <style>{`
                .search-hero { padding: 5rem 0; background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%); border-bottom: 1px solid #e2e8f0; }
                .search-bar-wrap { max-width: 800px; margin: 0 auto; text-align: center; }
                .search-bar-wrap h1 { font-size: 3rem; font-weight: 900; color: #012a4a; margin-bottom: 2.5rem; letter-spacing: -0.04em; }
                
                .main-search-form { 
                    display: flex; 
                    align-items: center; 
                    background: white; 
                    padding: 0.5rem; 
                    border-radius: 20px; 
                    box-shadow: 0 15px 40px rgba(0,0,0,0.08); 
                    border: 1px solid #e2e8f0;
                }
                .search-icon { margin: 0 1.5rem; color: #94a3b8; }
                .main-search-form input { flex: 1; border: none; font-size: 1.1rem; font-weight: 600; padding: 1rem 0; background: transparent; }
                .main-search-form input:focus { outline: none; }
                
                .btn-search { background: var(--primary); color: white; padding: 1rem 2rem; border-radius: 15px; font-weight: 800; margin-left: 0.5rem; }
                
                .results-header { margin: 4rem 0 3rem; }
                .results-header h2 { font-size: 2rem; font-weight: 850; color: #012a4a; letter-spacing: -0.02em; }
                .results-header h2 span { color: var(--primary); }
                .results-header p { color: #64748b; font-weight: 700; margin-top: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.8rem; }
                
                .empty-search { padding: 6rem 0; }
                .empty-icon { margin-bottom: 2rem; }
                .empty-search h3 { font-size: 1.5rem; font-weight: 800; color: #1e293b; margin-bottom: 1rem; }
                .empty-search p { color: #64748b; margin-bottom: 2rem; }
                
                .btn-outline-primary { border: 2px solid var(--primary); color: var(--primary); padding: 0.8rem 2rem; border-radius: 12px; font-weight: 800; transition: all 0.3s; }
                .btn-outline-primary:hover { background: var(--primary); color: white; }
            `}</style>
        </div>
    );
};

export default Search;
