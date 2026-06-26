import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Loader from '../components/common/Loader';
import {
  Trash2, Minus, Plus, ArrowLeft, CreditCard, ShieldCheck, Truck,
  ShoppingBag, LogIn, AlertTriangle, RefreshCw
} from 'lucide-react';
import { getMyCart, updateCartItems, removeCartItem, getProducts } from '../services/api';

const Cart = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [items, setItems] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [isGuest, setIsGuest] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const currentLang = i18n.language;

    // Enrich cart items with product metadata (image, category title) from cached product list
    const enrichItems = async (rawItems) => {
        try {
            const productsRes = await getProducts();
            const productsMap = Object.fromEntries(
                (productsRes.data || []).map(p => [p.id, p])
            );
            return rawItems.map(item => {
                const product = productsMap[item.productId] || {};
                // Backend may return 'id' or 'itemId' — normalize to itemId
                return {
                    ...item,
                    itemId: item.itemId ?? item.id ?? null,
                    name: product.title || item.title || 'Unknown Product',
                    image: product.pictureUrl || null,
                    category: product.category?.title || '',
                };
            });
        } catch {
            return rawItems.map(item => ({ ...item, name: item.title || 'Unknown Product' }));
        }
    };

    const fetchCart = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await getMyCart();
            const data = res.data;
            const hasToken = !!localStorage.getItem('token');
            setIsGuest(!hasToken);

            if (!data || (!Array.isArray(data.items) && typeof data.items !== 'object')) {
                setItems([]);
                setTotalPrice(0);
                return;
            }

            if (hasToken && Array.isArray(data.items)) {
                // Authenticated cart — items have itemId, productId, title, price, quantity
                const enriched = await enrichItems(data.items);
                setItems(enriched);
                setTotalPrice(data.totalPrice || 0);
            } else if (!hasToken && data.items && typeof data.items === 'object') {
                // Guest cart — items is { [productId]: quantity }
                const productsRes = await getProducts();
                const productsMap = Object.fromEntries(
                    (productsRes.data || []).map(p => [p.id, p])
                );
                const guestItems = Object.entries(data.items).map(([productId, quantity]) => {
                    const product = productsMap[parseInt(productId)] || {};
                    return {
                        itemId: null, // guest has no itemId
                        productId: parseInt(productId),
                        quantity,
                        name: product.title || `Product #${productId}`,
                        price: product.price || 0,
                        image: product.pictureUrl || null,
                        category: product.category?.title || '',
                    };
                });
                setItems(guestItems);
                const total = guestItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
                setTotalPrice(total);
            } else {
                setItems([]);
                setTotalPrice(0);
            }
        } catch (err) {
            console.error('Cart fetch error:', err);
            setError('Unable to load your cart. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, [currentLang]);

    const updateQuantity = async (itemId, newQuantity) => {
        if (isGuest || !itemId) return;
        if (newQuantity < 1) {
            // If decrementing below 1, remove the item instead
            return removeItem(itemId);
        }
        setActionLoading(true);
        try {
            await updateCartItems([{ itemId, quantity: newQuantity }]);
            setItems(prev => prev.map(i => (i.itemId || i.id) === itemId ? { ...i, quantity: newQuantity } : i));
            window.dispatchEvent(new Event('cartchange'));
        } catch (err) {
            console.error('Update quantity error:', err);
        } finally {
            setActionLoading(false);
        }
    };

    const removeItem = async (itemId) => {
        if (!itemId) return;
        setActionLoading(true);
        try {
            await removeCartItem(itemId);
            const removed = items.find(i => (i.itemId || i.id) === itemId);
            setItems(prev => prev.filter(i => (i.itemId || i.id) !== itemId));
            if (removed) setTotalPrice(prev => prev - removed.price * removed.quantity);
            window.dispatchEvent(new Event('cartchange'));
        } catch (err) {
            console.error('Remove item error:', err);
        } finally {
            setActionLoading(false);
        }
    };

    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    if (loading) return <Loader />;

    if (items.length === 0) {
        return (
          <div className="empty-cart-view transition-in">
            <div className="container">
              <div className="empty-wrap">
                <ShoppingBag size={80} strokeWidth={1} color="var(--text-muted)" />
                <h2>{t('cart.empty_title', 'Votre panier médical est vide')}</h2>
                <p>{t('cart.empty_desc', 'Prêt à moderniser votre infrastructure ? Découvrez nos dernières solutions.')}</p>
                <NavLink to="/catalogue" className="btn-primary mt-4">{t('cart.browse_catalogue', 'Parcourir le catalogue')}</NavLink>
              </div>
            </div>
            <style>{`
              .empty-cart-view { padding: 12rem 0 8rem; text-align: center; }
              .empty-wrap { display: flex; flex-direction: column; align-items: center; gap: 1.5rem; max-width: 500px; margin: 0 auto; }
              .empty-wrap h2 { font-size: 2.2rem; font-weight: 900; color: var(--primary); margin-top: 1rem; letter-spacing: -0.02em; }
              .empty-wrap p { color: var(--text-muted); font-size: 1.05rem; font-weight: 500; }
              .btn-primary { background: linear-gradient(135deg, var(--primary), var(--primary-light)); color: var(--white); padding: 1rem 2.5rem; border-radius: 12px; font-weight: 800; font-size: 1rem; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; box-shadow: 0 10px 20px rgba(0, 92, 151, 0.15); transition: all 0.3s ease; text-decoration: none; }
              .btn-primary:hover { transform: translateY(-3px); box-shadow: 0 20px 30px rgba(0, 92, 151, 0.25); }
              .mt-4 { margin-top: 1.5rem; }
            `}</style>
          </div>
        );
    }

    return (
        <div className="cart-page backdrop">
          <div className="container">
            <div className="cart-header">
              <h1>{t('header.cart')}</h1>
              <NavLink to="/catalogue" className="back-link"><ArrowLeft size={16} /> {t('cart.continue_shopping', 'Continuer mes achats')}</NavLink>
            </div>

            {error && (
                <div className="cart-error-banner">
                    <AlertTriangle size={18} /> {error}
                    <button onClick={fetchCart}><RefreshCw size={14} /> Retry</button>
                </div>
            )}

            {/* Guest notice */}
            {isGuest && (
                <div className="guest-banner">
                    <div className="guest-banner-icon"><ShieldCheck size={28} /></div>
                    <div className="guest-banner-text">
                        <strong>{t('cart.guest_saved', 'Votre panier est sauvegardé pour cette session')}</strong>
                        <p>{t('cart.guest_desc', 'Connectez-vous pour modifier les quantités, retirer des articles et passer la commande. Votre panier sera automatiquement fusionné.')}</p>
                    </div>
                    <NavLink to="/login" className="guest-login-btn">
                        <LogIn size={16} /> {t('cart.guest_sign_in', 'Se connecter')}
                    </NavLink>
                </div>
            )}

            <div className="cart-layout">
              <div className="cart-items-list card">
                <div className="list-labels">
                  <span>{t('cart.equipment', 'Équipement')}</span>
                  <span>{t('cart.quantity', 'Quantité')}</span>
                  <span>{t('cart.price', 'Prix')}</span>
                </div>
                {items.map(item => (
                  <div key={item.itemId || item.productId} className="cart-item">
                    <div className="item-main">
                      <div className="item-img">
                        {item.image
                          ? <img src={item.image} alt={item.name} />
                          : <ShoppingBag size={36} color="#cbd5e1" />
                        }
                      </div>
                      <div className="item-meta">
                        <h4>{item.name}</h4>
                        {item.category && <span className="item-cat">{item.category}</span>}
                        {!isGuest ? (
                            <button
                                className="remove-btn"
                                onClick={() => removeItem(item.itemId ?? item.id)}
                                disabled={actionLoading || !(item.itemId ?? item.id)}
                            >
                              <Trash2 size={16} /> {t('cart.remove', 'Retirer')}
                            </button>
                        ) : (
                            <NavLink to="/login" className="remove-btn-guest">
                                <LogIn size={14} /> {t('cart.sign_in_to_remove', 'Connectez-vous pour retirer')}
                            </NavLink>
                        )}
                      </div>
                    </div>

                    <div className="item-qty">
                      {!isGuest && item.itemId ? (
                          <div className="qty-control">
                            <button disabled={actionLoading} onClick={() => updateQuantity(item.itemId, item.quantity - 1)}><Minus size={14} /></button>
                            <span>{item.quantity}</span>
                            <button disabled={actionLoading} onClick={() => updateQuantity(item.itemId, item.quantity + 1)}><Plus size={14} /></button>
                          </div>
                      ) : (
                          <span className="qty-readonly">{item.quantity}</span>
                      )}
                    </div>

                    <div className="item-price">
                      <span className="unit-price">${(item.price * item.quantity).toLocaleString()}</span>
                      <small className="unit-ref">{t('cart.unit_price', { price: `$${Number(item.price).toLocaleString()}`, defaultValue: `$${Number(item.price).toLocaleString()} / unité` })}</small>
                    </div>
                  </div>
                ))}
              </div>

              <aside className="cart-summary sticky-aside">
                <div className="summary-card card">
                  <h3>{t('cart.order_summary', 'Résumé de la commande')}</h3>
                  <div className="summary-row"><span>{t('cart.subtotal', 'Sous-total')}</span><span>${subtotal.toLocaleString()}</span></div>
                  <div className="summary-row"><span>{t('cart.global_shipping', 'Livraison globale')}</span><span className="free">{t('cart.free', 'GRATUITE')}</span></div>
                  <div className="divider" />
                  <div className="total-row">
                    <span>{t('cart.total_amount', 'Montant total')}</span>
                    <span>${subtotal.toLocaleString()}</span>
                  </div>

                  {isGuest ? (
                      <NavLink to="/login" className="checkout-btn">
                          <LogIn size={18} /> {t('cart.sign_in_to_checkout', 'Se connecter pour commander')}
                      </NavLink>
                  ) : (
                      <button className="checkout-btn" onClick={() => navigate('/checkout')}>
                          <CreditCard size={18} /> {t('cart.proceed_to_order', 'Passer la commande')}
                      </button>
                  )}

                  <div className="security-badges">
                    <div className="sec-badge"><ShieldCheck size={16} /> {t('cart.secure_checkout', 'Paiement sécurisé')}</div>
                    <div className="sec-badge"><Truck size={16} /> {t('cart.priority_handling', 'Traitement médical prioritaire')}</div>
                  </div>
                </div>

                <div className="promo-box card">
                  <h4>{t('cart.quote_title', 'Devis institutionnel')}</h4>
                  <p>{t('cart.quote_desc', 'Besoin d\'un devis personnalisé pour un groupement d\'hôpitaux ?')}</p>
                  <NavLink to="/contact" className="quote-btn">{t('cart.quote_btn', 'Demander un devis B2B')}</NavLink>
                </div>
              </aside>
            </div>
          </div>

          <style>{`
            .cart-page { padding: 4rem 0 8rem; }
            .cart-header { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 2.5rem; }
            .cart-header h1 { font-size: 2.5rem; font-weight: 800; color: var(--primary); }
            .back-link { display: flex; align-items: center; gap: 0.5rem; color: var(--text-muted); font-weight: 600; font-size: 0.9rem; }
            .back-link:hover { color: var(--primary); }

            .cart-error-banner { background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; padding: 1rem 1.5rem; border-radius: 12px; display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; font-weight: 700; font-size: 0.9rem; }
            .cart-error-banner button { margin-left: auto; display: flex; align-items: center; gap: 0.5rem; background: #fee2e2; color: #b91c1c; padding: 0.4rem 0.8rem; border-radius: 8px; font-weight: 700; font-size: 0.8rem; }

            .guest-banner { display: flex; align-items: center; gap: 2rem; background: linear-gradient(135deg, #f0f7ff 0%, #e8f4fd 100%); border: 1px solid #bfdbfe; border-radius: 20px; padding: 1.8rem 2rem; margin-bottom: 2.5rem; }
            .guest-banner-icon { width: 56px; height: 56px; background: var(--primary); color: white; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
            .guest-banner-text { flex: 1; }
            .guest-banner-text strong { display: block; font-size: 1.05rem; font-weight: 900; color: #012a4a; margin-bottom: 0.4rem; }
            .guest-banner-text p { color: #475569; font-size: 0.9rem; line-height: 1.5; }
            .guest-login-btn { display: flex; align-items: center; gap: 0.6rem; background: var(--primary); color: white; padding: 0.8rem 1.5rem; border-radius: 12px; font-weight: 800; font-size: 0.9rem; white-space: nowrap; text-decoration: none; flex-shrink: 0; }
            .guest-login-btn:hover { background: #004b7c; }

            .cart-layout { display: grid; grid-template-columns: 1fr 380px; gap: 2.5rem; align-items: start; }
            .cart-items-list { padding: 0 !important; overflow: hidden; }
            .list-labels { display: grid; grid-template-columns: 1.5fr 1fr 1fr; padding: 1rem 2rem; background: var(--background); font-weight: 700; font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.05em; border-bottom: 1px solid var(--border); }
            .cart-item { display: grid; grid-template-columns: 1.5fr 1fr 1fr; padding: 2rem; align-items: center; border-bottom: 1px solid var(--border); transition: var(--transition); }
            .cart-item:last-child { border-bottom: none; }
            .cart-item:hover { background: #fafafa; }
            .item-main { display: flex; gap: 1.5rem; align-items: center; }
            .item-img { width: 100px; height: 100px; background: var(--background); border-radius: 12px; padding: 0.5rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
            .item-img img { max-width: 100%; max-height: 100%; object-fit: contain; }
            .item-meta h4 { font-size: 1.1rem; font-weight: 700; margin-bottom: 0.3rem; }
            .item-cat { font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.02em; }
            .remove-btn { display: flex; align-items: center; gap: 0.4rem; color: #ef4444; font-size: 0.8rem; font-weight: 600; margin-top: 0.8rem; }
            .remove-btn:disabled { opacity: 0.5; cursor: wait; }
            .remove-btn-guest { display: flex; align-items: center; gap: 0.4rem; color: #94a3b8; font-size: 0.78rem; font-weight: 600; margin-top: 0.8rem; text-decoration: none; }
            .remove-btn-guest:hover { color: var(--primary); }
            .qty-control { display: inline-flex; align-items: center; background: white; border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
            .qty-control button { padding: 0.6rem 0.8rem; color: var(--primary); }
            .qty-control button:disabled { opacity: 0.5; cursor: wait; }
            .qty-control span { width: 40px; text-align: center; font-weight: 700; }
            .qty-readonly { font-size: 1.1rem; font-weight: 800; color: #475569; }
            .item-price { text-align: right; display: flex; flex-direction: column; }
            .unit-price { font-size: 1.25rem; font-weight: 800; color: var(--primary); }
            .unit-ref { font-size: 0.75rem; color: var(--text-muted); }
            .summary-card { padding: 2rem; }
            .summary-card h3 { font-size: 1.4rem; font-weight: 800; margin-bottom: 1.5rem; }
            .summary-row { display: flex; justify-content: space-between; margin-bottom: 1rem; font-size: 0.95rem; font-weight: 500; color: var(--text-muted); }
            .free { color: #10b981; font-weight: 800; }
            .divider { height: 1px; background: var(--border); margin: 1.5rem 0; }
            .total-row { display: flex; justify-content: space-between; align-items: baseline; font-weight: 900; font-size: 1.5rem; margin-bottom: 2rem; color: var(--primary); }
            .checkout-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.8rem; padding: 1rem; background: var(--primary); color: white; border-radius: 12px; font-weight: 700; font-size: 1rem; margin-bottom: 2rem; transition: var(--transition); text-decoration: none; }
            .checkout-btn:hover { background: #004b7c; transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0, 92, 151, 0.2); }
            .security-badges { display: flex; flex-direction: column; gap: 0.8rem; }
            .sec-badge { display: flex; align-items: center; gap: 0.6rem; font-size: 0.85rem; color: var(--text-muted); font-weight: 600; }
            .sec-badge svg { color: #10b981; }
            .promo-box { margin-top: 1.5rem; padding: 1.5rem; text-align: center; }
            .promo-box h4 { margin-bottom: 0.5rem; font-weight: 800; }
            .promo-box p { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.2rem; }
            .quote-btn { display: inline-block; border: 1px solid var(--primary); color: var(--primary); border-radius: 10px; padding: 0.7rem 1.5rem; font-weight: 700; font-size: 0.9rem; text-decoration: none; }
            .empty-cart-view { padding: 8rem 0; text-align: center; }
            .empty-wrap { display: flex; flex-direction: column; align-items: center; gap: 1.5rem; max-width: 400px; margin: 0 auto; }
            .empty-wrap h2 { font-size: 2rem; color: var(--primary); }
            .empty-wrap p { color: var(--text-muted); margin-bottom: 1rem; }
            @media (max-width: 1024px) {
              .cart-layout { grid-template-columns: 1fr; }
              .list-labels { display: none; }
              .cart-item { grid-template-columns: 1fr; gap: 1.5rem; }
              .item-price { text-align: left; }
              .sticky-aside { position: static; }
              .guest-banner { flex-direction: column; text-align: center; }
            }
          `}</style>
        </div>
    );
};

export default Cart;
