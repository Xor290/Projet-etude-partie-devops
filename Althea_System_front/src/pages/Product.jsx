import { useParams, NavLink } from 'react-router-dom';
import {
  ShoppingCart,
  Heart,
  Share2,
  CheckCircle,
  Shield,
  Truck,
  ChevronRight,
  Plus,
  Minus,
  Star,
  FileText,
  Loader2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getProduct, getSimilarProducts, addItemToCart } from '../services/api';
import Loader from '../components/common/Loader';

const Product = () => {
    const { i18n } = useTranslation();
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');
    const [similarEquipment, setSimilarEquipment] = useState([]);
    const [cartStatus, setCartStatus] = useState('idle'); // idle | loading | success | error

    const currentLang = i18n.language;

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const [productRes, similarRes] = await Promise.all([
                    getProduct(id),
                    getSimilarProducts(id)
                ]);
                setProduct(productRes.data);
                setSimilarEquipment(similarRes.data);
            } catch (err) {
                console.error("Error fetching product data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id, currentLang]);

    const handleAddToCart = async () => {
        if (!product || product.inStock <= 0) return;
        setCartStatus('loading');
        try {
            await addItemToCart(product.id, quantity);
            window.dispatchEvent(new Event('cartchange'));
            setCartStatus('success');
            setTimeout(() => setCartStatus('idle'), 2500);
        } catch (err) {
            console.error('Add to cart error:', err);
            setCartStatus('error');
            setTimeout(() => setCartStatus('idle'), 2500);
        }
    };

    if (loading) return <Loader />;
    if (!product) return <div className="error-state container">Product not found or system error.</div>;

    return (
        <div className="product-detail-page modern-bg">
            <div className="container">
                {/* Breadcrumbs */}
                <nav className="prod-breadcrumbs">
                    <NavLink to="/">Catalogue</NavLink>
                    <ChevronRight size={14} />
                    <NavLink to={`/category/${product.category.id}`}>{product.category.title}</NavLink>
                    <ChevronRight size={14} />
                    <span className="current">{product.title}</span>
                </nav>

                <div className="product-grid">
                    {/* Media Section */}
                    <div className="media-side">
                        <div className="main-stage card-glass">
                            <img src={product.pictureUrl || '/images/prod_scanner.png'} alt={product.title} />
                            {product.inStock <= 0 && <div className="oos-overlay">Limited Supply</div>}
                        </div>
                        <div className="badges-row">
                            <div className="badge-item"><Shield size={18} /> 2 Year Global Warranty</div>
                            <div className="badge-item"><Truck size={18} /> Secure Handling</div>
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="info-side">
                        <header className="info-header">
                            <span className="domain-pill">{product.medicalDomain}</span>
                            <h1 className="prod-title">{product.title}</h1>
                            <div className="rating-row">
                                <div className="stars">
                                    <Star size={16} fill="var(--accent)" color="var(--accent)" />
                                    <Star size={16} fill="var(--accent)" color="var(--accent)" />
                                    <Star size={16} fill="var(--accent)" color="var(--accent)" />
                                    <Star size={16} fill="var(--accent)" color="var(--accent)" />
                                    <Star size={16} fill="var(--accent)" color="var(--accent)" />
                                </div>
                                <span>(24 Reviews)</span>
                            </div>
                        </header>

                        <div className="price-box">
                            <div className="price-main">${Number(product.price).toLocaleString()}</div>
                            <div className="tax-tag">Excl. VAT (Institutional Pricing)</div>
                        </div>

                        <div className="cta-block card">
                            <div className="qty-selector">
                                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus size={18} /></button>
                                <span>{quantity}</span>
                                <button onClick={() => setQuantity(q => q + 1)}><Plus size={18} /></button>
                            </div>
                            <button
                                className={`btn-primary add-to-cart ${cartStatus}`}
                                disabled={product.inStock <= 0 || cartStatus === 'loading'}
                                onClick={handleAddToCart}
                            >
                                {cartStatus === 'loading' && <Loader2 size={20} className="spin-icon" />}
                                {cartStatus === 'success' && <CheckCircle size={20} />}
                                {cartStatus === 'error' && <ShoppingCart size={20} />}
                                {cartStatus === 'idle' && <ShoppingCart size={20} />}
                                {cartStatus === 'loading' ? 'Adding...' :
                                 cartStatus === 'success' ? 'Added to Cart!' :
                                 cartStatus === 'error' ? 'Error — Retry' :
                                 product.inStock > 0 ? 'Deploy to Inventory' : 'Request Availability'}
                            </button>
                            <button className="icon-btn-outline"><Heart size={20} /></button>
                            <button className="icon-btn-outline"><Share2 size={20} /></button>
                        </div>

                        <div className="trust-signals">
                            <div className={`signal ${product.inStock > 0 ? 'good' : 'bad'}`}>
                                <CheckCircle size={18} />
                                <span>{product.inStock > 0 ? `Ready for Dispatch (${product.inStock} units)` : "Awaiting Restock"}</span>
                            </div>
                            <div className="signal good">
                                <FileText size={18} />
                                <span>ISO 13485 Certified Infrastructure</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="tabs-area card">
                    <nav className="tabs-nav">
                        <button className={activeTab === 'description' ? 'active' : ''} onClick={() => setActiveTab('description')}>Description</button>
                        <button className={activeTab === 'specs' ? 'active' : ''} onClick={() => setActiveTab('specs')}>Technical Specifications</button>
                        <button className={activeTab === 'support' ? 'active' : ''} onClick={() => setActiveTab('support')}>Institutional Support</button>
                    </nav>
                    <div className="tab-content">
                        {activeTab === 'description' && (
                            <div className="rich-text">
                                <p>{product.description}</p>
                                <p>Standardized for hospital environments requiring high precision and maximum uptime.</p>
                            </div>
                        )}
                        {activeTab === 'specs' && (
                            <div className="specs-list">
                                <div className="spec-row"><strong>Standard</strong> <span>Medical Grade CE/FDA</span></div>
                                <div className="spec-row"><strong>Origin</strong> <span>German Engineering</span></div>
                                <div className="spec-row"><strong>Network</strong> <span>HL7/DICOM Compliant</span></div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Section */}
                <section className="related-section">
                    <h2 className="section-title">Similar Equipment</h2>
                    <div className="related-grid">
                        {similarEquipment.map(item => (
                            <NavLink to={`/product/${item.id}`} key={item.id} className="small-product-card card">
                                <img src={item.pictureUrl || '/images/prod_scanner.png'} alt={item.title} />
                                <h4>{item.title}</h4>
                                <p>${Number(item.price).toLocaleString()}</p>
                            </NavLink>
                        ))}
                    </div>
                </section>
            </div>

            <style>{`
                .product-detail-page { padding-bottom: 8rem; }
                .prod-breadcrumbs { display: flex; align-items: center; gap: 0.8rem; padding: 3rem 0; font-size: 0.8rem; font-weight: 700; color: #64748b; text-transform: uppercase; }
                .prod-breadcrumbs a:hover { color: var(--primary); }
                .prod-breadcrumbs .current { color: var(--text-main); }

                .product-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 5rem; align-items: start; margin-bottom: 5rem; }

                .media-side { display: flex; flex-direction: column; gap: 2rem; }
                .main-stage { 
                    height: 550px; 
                    background: white; 
                    border-radius: 32px; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    padding: 4rem; 
                    position: relative;
                    overflow: hidden;
                }
                .main-stage img { max-width: 100%; max-height: 100%; object-fit: contain; }
                .oos-overlay { position: absolute; top: 2rem; right: 2rem; background: #1e293b; color: white; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 800; font-size: 0.75rem; }

                .badges-row { display: flex; gap: 2rem; justify-content: center; }
                .badge-item { display: flex; align-items: center; gap: 0.6rem; font-size: 0.8rem; font-weight: 700; color: #475569; }

                .info-side { display: flex; flex-direction: column; gap: 2rem; }
                .domain-pill { font-size: 0.75rem; font-weight: 900; color: var(--primary); background: rgba(0, 92, 151, 0.08); padding: 0.4rem 1rem; border-radius: 99px; width: fit-content; text-transform: uppercase; }
                .prod-title { font-size: 3.5rem; font-weight: 950; color: #012a4a; letter-spacing: -0.04rem; line-height: 1.1; }
                .rating-row { display: flex; align-items: center; gap: 1rem; color: #64748b; font-size: 0.9rem; font-weight: 600; }
                .stars { display: flex; gap: 2px; }

                .price-box { border-left: 5px solid var(--primary); padding-left: 1.5rem; }
                .price-main { font-size: 3rem; font-weight: 900; color: var(--primary); letter-spacing: -0.03rem; }
                .tax-tag { font-size: 0.85rem; color: #64748b; font-weight: 700; margin-top: 0.4rem; }

                .cta-block { display: flex; align-items: center; gap: 1.5rem; padding: 2rem !important; }
                .qty-selector { display: flex; align-items: center; gap: 1.5rem; background: #f1f5f9; padding: 0.6rem 1rem; border-radius: 12px; font-weight: 800; }
                .qty-selector button { color: #64748b; transition: var(--transition); }
                .qty-selector button:hover { color: var(--primary); }
                .add-to-cart { flex: 1; padding: 1.25rem !important; gap: 0.8rem; font-size: 1rem; transition: all 0.3s ease; }
                .add-to-cart.success { background: #059669 !important; }
                .add-to-cart.error { background: #dc2626 !important; }
                .add-to-cart.loading { opacity: 0.8; cursor: wait; }
                .spin-icon { animation: spin 0.8s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                .trust-signals { display: flex; flex-direction: column; gap: 1.25rem; }
                .signal { display: flex; align-items: center; gap: 1rem; font-weight: 700; font-size: 0.9rem; }
                .signal.good { color: #059669; }
                .signal.bad { color: #dc2626; }

                .tabs-area { margin-top: 5rem; padding: 0 !important; overflow: hidden; }
                .tabs-nav { display: flex; border-bottom: 1px solid #f1f5f9; background: #f8fafc; }
                .tabs-nav button { padding: 1.5rem 2.5rem; font-weight: 800; font-size: 0.9rem; color: #64748b; border-bottom: 3px solid transparent; transition: var(--transition); }
                .tabs-nav button.active { color: var(--primary); border-bottom-color: var(--primary); background: white; }
                .tab-content { padding: 4rem; }
                .rich-text p { font-size: 1.1rem; line-height: 1.8; color: #4a4e69; margin-bottom: 1.5rem; }

                .spec-row { display: flex; justify-content: space-between; padding: 1rem 0; border-bottom: 1px solid #f1f5f9; font-size: 1rem; }
                .spec-row strong { color: #012a4a; }

                .related-section { margin-top: 8rem; }
                .related-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 2rem; }
                .small-product-card { text-align: center; padding: 1.5rem !important; transition: var(--transition); }
                .small-product-card:hover { transform: translateY(-8px); }
                .small-product-card img { height: 160px; object-fit: contain; margin-bottom: 1rem; }
                .small-product-card h4 { font-size: 1.1rem; margin-bottom: 0.5rem; color: #012a4a; }
                .small-product-card p { font-weight: 800; color: var(--primary); }

                @media (max-width: 1024px) {
                    .product-grid { grid-template-columns: 1fr; gap: 3rem; }
                    .main-stage { height: 400px; }
                    .prod-title { font-size: 2.5rem; }
                }
            `}</style>
        </div>
    );
};

export default Product;
