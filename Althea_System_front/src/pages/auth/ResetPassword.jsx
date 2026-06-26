import { useState } from 'react';
import { useSearchParams, useNavigate, NavLink } from 'react-router-dom';
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { resetPassword } from '../../services/api';
import Loader from '../../components/common/Loader';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Access keys do not match.');
            return;
        }

        if (!token) {
            setError('Reset token is missing from URL. Please use the link from your email.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // FIXED: POST /api/auth/reset-password/{token} with body { password }
            await resetPassword(token, password);
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            console.error('Reset Password Error:', err);
            setError(
                err.response?.data?.error ||
                err.response?.data?.message ||
                'Failed to update access key. The link may have expired.'
            );
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="auth-page">
            <div className="auth-container" style={{ gridTemplateColumns: '1fr' }}>
                <div className="auth-form-side">
                    <div className="form-card">
                        <header className="auth-header text-center">
                            <NavLink to="/" className="auth-logo">
                                <span className="sym">A</span>
                                <span className="txt">ALTHEA</span>
                            </NavLink>
                            <h2>New Access Key</h2>
                            <p>Define a new security credential for your workstation</p>
                        </header>

                        {success ? (
                            <div className="success-view text-center pulse">
                                <ShieldCheck size={64} color="var(--primary)" />
                                <h3>Key Updated</h3>
                                <p>Your access key has been successfully reset. Redirecting to login...</p>
                            </div>
                        ) : (
                            <>
                                {error && (
                                    <div className="auth-error pulse">
                                        <AlertCircle size={18} />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="auth-form">
                                    <div className="field-group">
                                        <label>New Access Key</label>
                                        <div className="input-icon-wrap">
                                            <Lock size={18} />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                required
                                                minLength={8}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                className="eye-toggle"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="field-group">
                                        <label>Confirm Access Key</label>
                                        <div className="input-icon-wrap">
                                            <Lock size={18} />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                required
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <button type="submit" className="btn-auth-submit">
                                        <span>Update Credentials</span>
                                        <ArrowRight size={20} />
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <style>{`
                .auth-page { 
                    max-width: 100vw; 
                    min-height: calc(100vh - var(--header-height, 80px)); 
                    background: linear-gradient(135deg, #f0f7ff 0%, #e8f4fd 50%, #f0f7ff 100%); 
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 4rem 1rem;
                }
                .auth-container { 
                    width: 100%;
                    max-width: 480px;
                    background: white;
                    border-radius: 28px;
                    box-shadow: 0 40px 80px -20px rgba(0, 92, 151, 0.15);
                    border: 1px solid #bfdbfe;
                    overflow: hidden;
                }
                .auth-form-side { 
                    padding: 3.5rem; 
                    display: flex; 
                    flex-direction: column; 
                    justify-content: center; 
                    background: white;
                }
                .form-card { width: 100%; }
                
                .auth-header { text-align: center; margin-bottom: 3rem; }
                .auth-logo { display: inline-flex; align-items: center; gap: 0.6rem; margin-bottom: 1.5rem; text-decoration: none; }
                .auth-logo .sym { background: var(--primary); color: white; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 12px; font-weight: 900; font-size: 1.4rem; }
                .auth-logo .txt { font-size: 1.6rem; font-weight: 900; color: #012a4a; letter-spacing: -0.05em; }
                
                .auth-header h2 { font-size: 1.8rem; font-weight: 850; color: #012a4a; margin-bottom: 0.5rem; }
                .auth-header p { color: #64748b; font-size: 0.95rem; }

                .auth-error { background: #fee2e2; color: #b91c1c; padding: 1rem; border-radius: 12px; margin-bottom: 2rem; display: flex; align-items: center; gap: 0.75rem; font-size: 0.85rem; font-weight: 700; border: 1px solid #fecaca; }
                .pulse { animation: p 0.4s ease; }
                @keyframes p { 0% { transform: scale(0.98); } 50% { transform: scale(1.02); } 100% { transform: scale(1); } }

                .field-group { margin-bottom: 1.8rem; }
                .field-group label { display: block; font-size: 0.7rem; font-weight: 900; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em; margin-bottom: 0.8rem; }

                .input-icon-wrap { position: relative; display: flex; align-items: center; }
                .input-icon-wrap svg { position: absolute; left: 1rem; color: #94a3b8; }
                .input-icon-wrap input { width: 100%; padding: 0.9rem 1rem 0.9rem 3rem; border-radius: 12px; border: 1.5px solid #e2e8f0; background: white; font-weight: 600; font-size: 0.95rem; transition: var(--transition); }
                .input-icon-wrap input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(0, 92, 151, 0.08); outline: none; }

                .eye-toggle { position: absolute; right: 1rem; color: #94a3b8; background: transparent; border: none; cursor: pointer; }

                .btn-auth-submit { width: 100%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; gap: 1rem; padding: 1.1rem; border-radius: 14px; font-weight: 800; font-size: 1rem; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                .btn-auth-submit:hover { transform: translateY(-4px); box-shadow: 0 15px 30px rgba(0, 92, 151, 0.25); }
                .btn-auth-submit:disabled { opacity: 0.85; cursor: wait; transform: none; box-shadow: none; }

                .success-view { display: flex; flex-direction: column; align-items: center; }
                .success-view svg { background: #f0fdf4; color: #166534; width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; padding: 12px; }
                .success-view h3 { font-size: 1.6rem; font-weight: 900; color: #012a4a; margin-top: 1.5rem; }
                .success-view p { color: #64748b; line-height: 1.6; margin-top: 1rem; }
                
                @media (max-width: 600px) {
                    .auth-page { padding: 1.5rem 0.5rem; }
                    .auth-form-side { padding: 2rem 1.5rem; }
                }
            `}</style>
        </div>
    );
};

export default ResetPassword;
