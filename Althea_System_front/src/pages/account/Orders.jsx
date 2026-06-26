import { useState, useEffect } from 'react';
import { Search, ChevronRight, FileText, CheckCircle2, Clock, Truck, ShoppingBag, Loader2, AlertCircle, Download } from 'lucide-react';
import { getInvoicePdf, getProducts } from '../../services/api';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';

// Backend endpoint for completed orders history (ROLE_USER)
// Returns array of Orders where status !== 'cart'
const getMyOrders = () => api.get('/order/history');

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [downloadingId, setDownloadingId] = useState(null);
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    
    const { t, i18n } = useTranslation();
    const currentLang = i18n.language;

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                // Fetch orders and products list in parallel to enrich with localized titles
                const [ordersRes, productsRes] = await Promise.all([
                    getMyOrders(),
                    getProducts()
                ]);
                const data = Array.isArray(ordersRes.data) ? ordersRes.data : [];
                const productsList = Array.isArray(productsRes.data) ? productsRes.data : [];
                const productsMap = Object.fromEntries(productsList.map(p => [p.id, p]));

                const enrichedOrders = data.map(order => ({
                    ...order,
                    items: (order.items || []).map(item => ({
                        ...item,
                        title: productsMap[item.productId]?.title || item.title || 'Unknown Product'
                    }))
                }));

                setOrders(enrichedOrders);
            } catch (err) {
                if (err.response?.status === 404) {
                    setOrders([]);
                } else {
                    console.error('Orders fetch error:', err);
                    setError(t('common.error', 'Unable to load your orders. Please try again later.'));
                }
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [t, currentLang]);

    const handleDownloadInvoice = async (orderId) => {
        setDownloadingId(orderId);
        try {
            const res = await getInvoicePdf(orderId);
            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `facture-${orderId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Invoice download error:', err);
            alert(err.response?.data?.error || t('common.error', 'Unable to download invoice. The order may not be paid yet.'));
        } finally {
            setDownloadingId(null);
        }
    };

    const getStatusIcon = (status) => {
        const s = (status || '').toLowerCase();
        if (s === 'payé' || s === 'delivered') return <CheckCircle2 size={16} className="text-success" />;
        if (s === 'shipped' || s === 'expédié') return <Truck size={16} className="text-primary" />;
        return <Clock size={16} className="text-warning" />;
    };

    const getStatusClass = (status) => {
        const s = (status || '').toLowerCase();
        if (s === 'payé' || s === 'delivered') return 'delivered';
        if (s === 'shipped' || s === 'expédié') return 'shipped';
        return 'processing';
    };

    const getStatusText = (status) => {
        const s = (status || '').toLowerCase();
        if (s === 'payé' || s === 'delivered') return t('orders.status_paid', 'Paid');
        if (s === 'shipped' || s === 'expédié') return t('orders.status_shipped', 'Shipped');
        return t('orders.status_pending', 'Pending');
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const locale = i18n.language === 'fr' ? 'fr-FR' : (i18n.language === 'ru' ? 'ru-RU' : 'en-GB');
        return new Date(dateStr).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const toggleOrderDetails = (orderId) => {
        setExpandedOrderId(prev => prev === orderId ? null : orderId);
    };

    const filtered = orders.filter(o =>
        !search.trim() ||
        String(o.id).includes(search.trim()) ||
        (o.status || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="orders-page">
            <header className="page-header-flex">
                <div>
                   <h1 className="page-title">{t('orders.title', 'Order History')}</h1>
                   <p className="page-subtitle">{t('orders.subtitle', 'Track and manage your institutional equipment procurement.')}</p>
                </div>
                <div className="order-search">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder={t('orders.search_placeholder', 'Find order ID...')}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </header>

            {loading && (
                <div className="orders-loading">
                    <Loader2 size={32} className="spin-icon" />
                    <p>{t('orders.loading', 'Loading your orders...')}</p>
                </div>
            )}

            {error && (
                <div className="orders-error">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {!loading && !error && filtered.length === 0 && (
                <div className="orders-empty">
                    <ShoppingBag size={64} strokeWidth={1} color="#cbd5e1" />
                    <h3>{search ? t('orders.no_match', 'No orders match your search') : t('orders.no_orders', 'No orders yet')}</h3>
                    <p>{search ? t('orders.try_different', 'Try a different order ID.') : t('orders.empty_desc', 'Your completed orders will appear here after checkout.')}</p>
                </div>
            )}

            <div className="orders-list">
                {filtered.map(order => (
                    <div key={order.id} className="order-card-premium">
                        <div className="order-card-main-row">
                            <div className="order-main-info">
                                <div className="id-badge">#{order.id}</div>
                                <div className="order-details">
                                    <span className="date">{formatDate(order.paymentDate)}</span>
                                    <span className="items-count">
                                        • {order.items?.length ?? 0} {order.items?.length === 1 ? t('orders.items_count_one', 'Item') : t('orders.items_count_other', 'Items')}
                                    </span>
                                </div>
                            </div>

                            <div className="order-status-group">
                                <div className={`status-pill ${getStatusClass(order.status)}`}>
                                    {getStatusIcon(order.status)}
                                    {getStatusText(order.status)}
                                </div>
                            </div>

                            <div className="order-price">
                                ${Number(order.totalPrice || 0).toLocaleString()}
                            </div>

                            <div className="order-actions">
                                {(order.status?.toLowerCase() === 'payé') && (
                                    <button
                                        className="btn-invoice"
                                        onClick={() => handleDownloadInvoice(order.id)}
                                        disabled={downloadingId === order.id}
                                        title={t('orders.invoice_title', 'Download Invoice PDF')}
                                    >
                                        {downloadingId === order.id
                                            ? <Loader2 size={16} className="spin-icon" />
                                            : <Download size={16} />
                                        }
                                        {t('orders.invoice', 'Invoice')}
                                    </button>
                                )}
                                <button className="btn-view-order" onClick={() => toggleOrderDetails(order.id)}>
                                    <FileText size={18} />
                                    {expandedOrderId === order.id ? t('orders.hide_details', 'Hide') : t('orders.details', 'Details')}
                                    <ChevronRight size={14} className={`transition-transform duration-300 ${expandedOrderId === order.id ? 'rotate-90' : ''}`} />
                                </button>
                            </div>
                        </div>
                        
                        {expandedOrderId === order.id && (
                            <div className="order-expanded-details">
                                <div className="expanded-title">{t('orders.items_detail', 'Order Items')}</div>
                                <div className="items-table-wrapper">
                                    <table className="items-table">
                                        <thead>
                                            <tr>
                                                <th>{t('orders.product', 'Product')}</th>
                                                <th className="text-center">{t('orders.quantity', 'Quantity')}</th>
                                                <th className="text-right">{t('orders.unit_price', 'Unit Price')}</th>
                                                <th className="text-right">{t('orders.total', 'Total')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {order.items?.map(item => (
                                                <tr key={item.id}>
                                                    <td className="product-cell">
                                                        <span className="product-title">{item.title}</span>
                                                    </td>
                                                    <td className="text-center qty-cell">{item.quantity}</td>
                                                    <td className="text-right price-cell">${Number(item.price).toLocaleString()}</td>
                                                    <td className="text-right total-cell">${(item.price * item.quantity).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <style>{`
                .page-header-flex { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 4rem; padding-bottom: 2rem; border-bottom: 2px solid #f8fafc; }
                .page-title { font-size: 2.2rem; font-weight: 900; color: #012a4a; margin-bottom: 0.5rem; letter-spacing: -0.02em; }
                .page-subtitle { color: #64748b; font-size: 1rem; font-weight: 500; }
                .order-search { background: #f1f5f9; padding: 0.75rem 1.5rem; border-radius: 12px; display: flex; align-items: center; gap: 0.8rem; width: 300px; }
                .order-search input { background: transparent; border: none; outline: none; font-weight: 600; font-size: 0.9rem; width: 100%; }
                .orders-loading { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 4rem; color: #64748b; font-weight: 700; }
                .orders-error { display: flex; align-items: center; gap: 0.8rem; background: #fef2f2; color: #b91c1c; padding: 1rem 1.5rem; border-radius: 12px; font-weight: 700; margin-bottom: 2rem; }
                .orders-empty { text-align: center; padding: 4rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
                .orders-empty h3 { font-size: 1.4rem; font-weight: 800; color: #012a4a; }
                .orders-empty p { color: #64748b; }
                .orders-list { display: flex; flex-direction: column; gap: 1.5rem; }
                
                .order-card-premium {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    padding: 1.5rem 2rem;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .order-card-premium:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 20px -8px rgba(0,0,0,0.08);
                    border-color: var(--primary);
                }
                
                .order-card-main-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                    gap: 1.5rem;
                }
                
                .order-main-info {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                    min-width: 220px;
                }
                
                .id-badge { font-weight: 900; color: var(--primary); font-size: 1rem; }
                
                .order-details {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 0.4rem;
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: #94a3b8;
                    white-space: nowrap;
                }
                
                .status-pill { display: inline-flex; align-items: center; gap: 0.6rem; padding: 0.6rem 1rem; border-radius: 10px; font-weight: 800; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; }
                .status-pill.processing { background: #fef3c7; color: #92400e; }
                .status-pill.shipped { background: #e0f2fe; color: #075985; }
                .status-pill.delivered { background: #dcfce7; color: #166534; }
                
                .order-price { font-weight: 900; color: #012a4a; font-size: 1.2rem; min-width: 100px; text-align: center; }
                
                .order-actions { display: flex; gap: 0.8rem; justify-content: flex-end; min-width: 250px; }
                
                .btn-view-order { display: flex; align-items: center; gap: 0.6rem; font-weight: 800; color: #64748b; background: white; border: 1px solid #e2e8f0; padding: 0.75rem 1rem; border-radius: 12px; transition: var(--transition); }
                .btn-view-order:hover { color: var(--primary); border-color: var(--primary); background: #f0f4f8; }
                
                .btn-invoice { display: flex; align-items: center; gap: 0.6rem; font-weight: 800; color: #059669; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 0.75rem 1rem; border-radius: 12px; transition: var(--transition); }
                .btn-invoice:hover { background: #dcfce7; }
                .btn-invoice:disabled { opacity: 0.6; cursor: wait; }
                
                .order-expanded-details {
                    width: 100%;
                    margin-top: 1.5rem;
                    padding-top: 1.5rem;
                    border-top: 1px dashed #e2e8f0;
                    animation: slideDown 0.3s ease-out;
                }
                .expanded-title {
                    font-size: 0.95rem;
                    font-weight: 800;
                    color: #0f172a;
                    margin-bottom: 1rem;
                }
                .items-table-wrapper {
                    overflow-x: auto;
                }
                .items-table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: left;
                }
                .items-table th {
                    font-size: 0.75rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    color: #64748b;
                    padding: 0.75rem 1rem;
                    border-bottom: 1px solid #f1f5f9;
                }
                .items-table td {
                    padding: 1rem;
                    border-bottom: 1px solid #f8fafc;
                    font-size: 0.9rem;
                    color: #334155;
                    font-weight: 600;
                }
                .product-cell {
                    display: flex;
                    flex-direction: column;
                }
                .product-title {
                    font-weight: 700;
                    color: #1e293b;
                }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .qty-cell { color: #64748b; }
                .price-cell { color: #64748b; }
                .total-cell { font-weight: 700; color: #0f172a; }
                
                .rotate-90 {
                    transform: rotate(90deg);
                }
                .transition-transform {
                    transition-property: transform;
                    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                }
                .duration-300 {
                    transition-duration: 300ms;
                }
                
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .spin-icon { animation: spin 0.8s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .text-success { color: #10b981; }
                .text-primary { color: #0284c7; }
                .text-warning { color: #f59e0b; }
                
                @media (max-width: 1024px) {
                    .order-card-main-row {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 1.25rem;
                    }
                    .page-header-flex { flex-direction: column; align-items: flex-start; gap: 2rem; }
                    .order-search { width: 100%; }
                    .order-price { text-align: left; min-width: auto; }
                    .order-actions { justify-content: flex-start; width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default Orders;
