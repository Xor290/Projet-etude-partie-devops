import { NavLink } from 'react-router-dom';
import { XCircle, ShoppingCart, HeadphonesIcon } from 'lucide-react';

const Cancel = () => {
    return (
        <div className="cancel-page">
            <div className="cancel-card">
                <XCircle size={72} color="#ef4444" strokeWidth={1.5} />
                <h1>Payment Cancelled</h1>
                <p>
                    Your payment was cancelled and no charges were made.
                    Your cart items are still saved — you can resume your order whenever you&apos;re ready.
                </p>
                <div className="cancel-actions">
                    <NavLink to="/cart" className="btn-resume">
                        <ShoppingCart size={18} />
                        Return to Cart
                    </NavLink>
                    <NavLink to="/contact" className="btn-support">
                        <HeadphonesIcon size={18} />
                        Contact Support
                    </NavLink>
                </div>
                <div className="cancel-note">
                    If you experienced an issue during payment, please contact our technical support team.
                </div>
            </div>
            <style>{`
                .cancel-page {
                    min-height: calc(100vh - var(--header-height, 80px));
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #fff5f5 0%, #fef2f2 100%);
                    padding: 4rem 1rem;
                }
                .cancel-card {
                    background: white;
                    border-radius: 28px;
                    padding: 4rem;
                    max-width: 500px;
                    width: 100%;
                    text-align: center;
                    box-shadow: 0 40px 80px -20px rgba(239, 68, 68, 0.12);
                    border: 1px solid #fecaca;
                }
                .cancel-card h1 { font-size: 2rem; font-weight: 900; color: #012a4a; margin: 1.5rem 0 1rem; }
                .cancel-card p { color: #64748b; line-height: 1.7; font-size: 1rem; max-width: 380px; margin: 0 auto 2.5rem; }
                .cancel-actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-bottom: 2rem; }
                .btn-resume { display: flex; align-items: center; gap: 0.6rem; background: var(--primary); color: white; padding: 0.9rem 1.8rem; border-radius: 14px; font-weight: 800; font-size: 0.95rem; text-decoration: none; }
                .btn-resume:hover { background: #004b7c; transform: translateY(-2px); }
                .btn-support { display: flex; align-items: center; gap: 0.6rem; border: 1.5px solid #e2e8f0; color: #475569; padding: 0.9rem 1.8rem; border-radius: 14px; font-weight: 800; font-size: 0.95rem; text-decoration: none; }
                .btn-support:hover { border-color: var(--primary); color: var(--primary); }
                .cancel-note { font-size: 0.8rem; color: #94a3b8; font-style: italic; }
            `}</style>
        </div>
    );
};

export default Cancel;
