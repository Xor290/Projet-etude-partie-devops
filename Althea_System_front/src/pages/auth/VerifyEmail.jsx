import { useEffect, useState } from 'react';
import { useSearchParams, NavLink, useNavigate } from 'react-router-dom';
import { ShieldCheck, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { verifyEmail } from '../../services/api';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); // loading | success | error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verify = async () => {
            if (!token) {
                setStatus('error');
                setMessage('Verification token is missing from the link.');
                return;
            }

            try {
                // Backend returns { message, token } — store JWT and log user in immediately
                const res = await verifyEmail(token);
                const jwt = res.data?.token;

                if (jwt) {
                    localStorage.setItem('token', jwt);
                    // Notify all components (Header cart count, auth state, etc.)
                    window.dispatchEvent(new Event('authchange'));
                }

                setStatus('success');
            } catch (err) {
                console.error('Email Verification Error:', err);
                setStatus('error');
                setMessage(err.response?.data?.error || 'Verification failed. The link may have expired.');
            }
        };
        verify();
    }, [token]);

    return (
        <div className="auth-page">
            <div className="auth-container" style={{ gridTemplateColumns: '1fr' }}>
                <div className="auth-form-side">
                    <div className="form-card text-center">
                        <header className="auth-header">
                            <NavLink to="/" className="auth-logo">
                                <span className="sym">A</span>
                                <span className="txt">ALTHEA</span>
                            </NavLink>
                            <h2>Security Verification</h2>
                        </header>

                        <div className="status-display">
                            {status === 'loading' && (
                                <div className="loading-state pulse">
                                    <Loader2 className="spinner" size={48} />
                                    <p>Verifying your institutional credentials...</p>
                                </div>
                            )}

                            {status === 'success' && (
                                <div className="success-state pulse">
                                    <ShieldCheck size={64} color="var(--primary)" />
                                    <h3>Email Verified</h3>
                                    <p>
                                        Your account has been successfully activated and you are now
                                        logged in. Access your professional workspace below.
                                    </p>
                                    <div className="verify-actions">
                                        <button
                                            className="btn-auth-submit"
                                            onClick={() => navigate('/account/orders', { replace: true })}
                                        >
                                            <span>Open My Workspace</span>
                                            <ArrowRight size={20} />
                                        </button>
                                        <NavLink to="/catalogue" className="btn-outline-secondary">
                                            Browse Catalogue
                                        </NavLink>
                                    </div>
                                </div>
                            )}

                            {status === 'error' && (
                                <div className="error-state pulse">
                                    <XCircle size={64} color="#ef4444" />
                                    <h3>Verification Failed</h3>
                                    <p>{message}</p>
                                    <NavLink
                                        to="/contact"
                                        className="btn-outline-primary"
                                        style={{ marginTop: '2rem', display: 'inline-block' }}
                                    >
                                        Contact IT Support
                                    </NavLink>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                .text-center { text-align: center; }
                .spinner { animation: spin 2s linear infinite; margin: 0 auto 1.5rem; color: var(--primary); }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .status-display p { color: #64748b; margin-top: 1rem; line-height: 1.7; max-width: 380px; margin-left: auto; margin-right: auto; }
                .success-state h3, .error-state h3 { font-size: 1.8rem; font-weight: 850; margin-top: 1.5rem; color: #012a4a; }
                .verify-actions { display: flex; flex-direction: column; gap: 1rem; margin-top: 2rem; align-items: center; }
                .btn-outline-primary { border: 2px solid var(--primary); color: var(--primary); padding: 0.8rem 2rem; border-radius: 12px; font-weight: 800; text-decoration: none; }
                .btn-outline-secondary { color: #64748b; font-weight: 700; font-size: 0.9rem; text-decoration: underline; }
            `}</style>
        </div>
    );
};

export default VerifyEmail;
