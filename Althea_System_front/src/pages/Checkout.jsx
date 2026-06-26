import { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { ShieldCheck, CreditCard, Loader2, Lock, AlertCircle } from 'lucide-react';
import { checkoutCart } from '../services/api';

const steps = [
    { label: 'Authorizing Secure Connection', delay: 0 },
    { label: 'Allocating Inventory', delay: 1200 },
    { label: 'Generating Payment Session', delay: 2400 },
    { label: 'Redirecting to Payment Gateway', delay: 3600 },
];

const Checkout = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [error, setError] = useState('');
    const isAuthenticated = !!localStorage.getItem('token');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { replace: true });
            return;
        }

        let stepTimers = [];

        const initiateCheckout = async () => {
            // Animate steps while we wait for the API
            steps.forEach((step, i) => {
                const t = setTimeout(() => setCurrentStep(i), step.delay);
                stepTimers.push(t);
            });

            try {
                const res = await checkoutCart();
                const stripeUrl = res.data?.url;
                if (!stripeUrl) throw new Error('No checkout URL returned from server.');

                // Give the last animation step a moment to show
                setTimeout(() => {
                    window.location.href = stripeUrl;
                }, 4200);
            } catch (err) {
                stepTimers.forEach(clearTimeout);
                console.error('Checkout error:', err);
                const msg =
                    err.response?.data?.error ||
                    err.response?.data?.message ||
                    'Unable to initiate checkout. Your cart may be empty.';
                setError(msg);
            }
        };

        initiateCheckout();
        return () => stepTimers.forEach(clearTimeout);
    }, [isAuthenticated, navigate]);

    if (error) {
        return (
            <div className="checkout-page">
                <div className="checkout-card">
                    <AlertCircle size={56} color="#ef4444" />
                    <h2>Checkout Failed</h2>
                    <p className="err-msg">{error}</p>
                    <div className="checkout-error-actions">
                        <button className="btn-back" onClick={() => navigate('/cart')}>
                            ← Return to Cart
                        </button>
                        <NavLink to="/contact" className="btn-support">Contact Support</NavLink>
                    </div>
                </div>
                <style>{checkoutStyles}</style>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <div className="checkout-card">
                <div className="checkout-logo-wrap">
                    <div className="checkout-logo">A</div>
                </div>
                <div className="checkout-lock"><Lock size={18} /> Secure Institutional Checkout</div>
                <h2>Preparing Your Order</h2>
                <p className="checkout-sub">Please wait while we establish a secure payment session.</p>

                <div className="steps-list">
                    {steps.map((step, i) => (
                        <div key={i} className={`step-row ${i < currentStep ? 'done' : i === currentStep ? 'active' : 'pending'}`}>
                            <div className="step-indicator">
                                {i < currentStep
                                    ? <ShieldCheck size={16} />
                                    : i === currentStep
                                        ? <Loader2 size={16} className="spin-icon" />
                                        : <span className="dot" />
                                }
                            </div>
                            <span>{step.label}</span>
                        </div>
                    ))}
                </div>

                <div className="checkout-trust">
                    <CreditCard size={14} /> Powered by Stripe • 256-bit AES Encryption
                </div>
            </div>
            <style>{checkoutStyles}</style>
        </div>
    );
};

const checkoutStyles = `
    .checkout-page {
        min-height: calc(100vh - var(--header-height, 80px));
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #f0f7ff 0%, #e8f4fd 50%, #f0f7ff 100%);
        padding: 4rem 1rem;
    }
    .checkout-card {
        background: white;
        border-radius: 28px;
        padding: 3.5rem;
        max-width: 480px;
        width: 100%;
        text-align: center;
        box-shadow: 0 40px 80px -20px rgba(0, 92, 151, 0.15);
        border: 1px solid #bfdbfe;
    }
    .checkout-logo-wrap { margin-bottom: 1.5rem; }
    .checkout-logo { width: 60px; height: 60px; background: var(--primary); color: white; font-size: 1.8rem; font-weight: 900; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto; }
    .checkout-lock { display: inline-flex; align-items: center; gap: 0.5rem; background: #f0fdf4; color: #059669; font-size: 0.75rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; padding: 0.4rem 1rem; border-radius: 99px; margin-bottom: 1.5rem; }
    .checkout-card h2 { font-size: 1.9rem; font-weight: 900; color: #012a4a; margin-bottom: 0.8rem; }
    .checkout-sub { color: #64748b; font-size: 0.95rem; line-height: 1.6; margin-bottom: 2.5rem; }
    .steps-list { display: flex; flex-direction: column; gap: 1rem; text-align: left; margin-bottom: 2.5rem; }
    .step-row { display: flex; align-items: center; gap: 1rem; padding: 0.8rem 1.2rem; border-radius: 12px; transition: all 0.4s ease; font-weight: 700; font-size: 0.9rem; }
    .step-row.done { background: #f0fdf4; color: #059669; }
    .step-row.active { background: #eff6ff; color: var(--primary); }
    .step-row.pending { background: #f8fafc; color: #94a3b8; }
    .step-indicator { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .step-row.done .step-indicator { background: #dcfce7; color: #059669; }
    .step-row.active .step-indicator { background: #dbeafe; color: var(--primary); }
    .step-row.pending .step-indicator { background: #f1f5f9; }
    .dot { width: 8px; height: 8px; background: #cbd5e1; border-radius: 50%; display: block; }
    .spin-icon { animation: spin 0.8s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .checkout-trust { color: #94a3b8; font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
    .err-msg { color: #64748b; line-height: 1.6; margin: 1rem 0 2rem; }
    .checkout-error-actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
    .btn-back { padding: 0.8rem 1.5rem; border: 1.5px solid #e2e8f0; border-radius: 12px; font-weight: 800; color: #475569; }
    .btn-back:hover { border-color: var(--primary); color: var(--primary); }
    .btn-support { padding: 0.8rem 1.5rem; background: var(--primary); color: white; border-radius: 12px; font-weight: 800; text-decoration: none; }
`;

export default Checkout;
