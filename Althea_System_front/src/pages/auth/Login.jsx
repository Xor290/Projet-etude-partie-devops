import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  Building, 
  Eye, 
  EyeOff,
  AlertCircle,
  LoaderCircle
} from 'lucide-react';
import { login } from '../../services/api';

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        rememberMe: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await login(formData);
            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                window.dispatchEvent(new Event('authchange'));
                navigate('/account/orders', { replace: true });
            }
        } catch (err) {
            console.error("Login Error:", err);
            setError(err.response?.data?.message || 'Invalid credentials for Althea Systems gateway.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                {/* Left Side: Visual/Branding */}
                <div className="auth-visual desktop-only">
                    <div className="visual-overlay">
                        <div className="visual-content">
                            <div className="visual-badge">Secure Institutional Access</div>
                            <h1>Connecting Healthcare Excellence.</h1>
                            <p>Access your organization's specialized equipment catalogue, manage procurement cycles, and track technical infrastructure deployments.</p>
                            
                            <div className="visual-stats">
                                <div className="v-stat">
                                   <strong>2.5k+</strong>
                                   <span>Hospitals Managed</span>
                                </div>
                                <div className="v-stat">
                                   <strong>99.9%</strong>
                                   <span>System Uptime</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="auth-form-side">
                    <div className="form-card">
                        <header className="auth-header">
                            <NavLink to="/" className="auth-logo">
                                <span className="sym">A</span>
                                <span className="txt">ALTHEA</span>
                            </NavLink>
                            <h2>Professional Portal</h2>
                            <p>Enter your institutional credentials to continue</p>
                        </header>

                        {error && (
                            <div className="auth-error pulse">
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="field-group">
                                <label>Business Email</label>
                                <div className="input-icon-wrap">
                                    <Mail size={18} />
                                    <input 
                                        type="email" 
                                        name="username"
                                        placeholder="name@institution.com" 
                                        required
                                        disabled={loading}
                                        value={formData.username}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="field-group">
                                <div className="label-row">
                                    <label>Access Key</label>
                                    <NavLink to="/forgot-password">Trouble signing in?</NavLink>
                                </div>
                                <div className="input-icon-wrap">
                                    <Lock size={18} />
                                    <input 
                                        type={showPassword ? 'text' : 'password'} 
                                        name="password"
                                        placeholder="••••••••" 
                                        required
                                        disabled={loading}
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    <button 
                                        type="button" 
                                        className="eye-toggle"
                                        disabled={loading}
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="form-options">
                                <label className="check-label">
                                    <input 
                                        type="checkbox" 
                                        name="rememberMe"
                                        disabled={loading}
                                        checked={formData.rememberMe}
                                        onChange={handleChange}
                                    />
                                    <span>Keep this workstation logged in</span>
                                </label>
                            </div>

                            <button type="submit" className="btn-auth-submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <LoaderCircle size={20} className="spin-icon" />
                                        <span>Connexion en cours...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Sign In to Workspace</span>
                                        <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        </form>

                        <footer className="auth-footer">
                            <p>Management restricted to authorized clinical staff.</p>
                            <div className="access-prompt">
                                New to Althea Systems? <NavLink to="/register">Apply for Access</NavLink>
                            </div>
                        </footer>
                    </div>

                    <div className="auth-security-footer">
                        <div className="sec-item"><ShieldCheck size={14} /> 256-bit AES Encryption</div>
                        <div className="sec-item"><Building size={14} /> ISO 27001 Certified</div>
                    </div>
                </div>
            </div>

            <style>{`
                .auth-page { 
                    max-width: 100vw; 
                    min-height: calc(100vh - var(--header-height)); 
                    background: white; 
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .auth-container { 
                    display: grid; 
                    grid-template-columns: 1fr 500px; 
                    width: 100%; 
                    min-height: 100vh;
                }

                .auth-visual {
                    background: url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop');
                    background-size: cover;
                    background-position: center;
                    position: relative;
                }
                .visual-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, rgba(0, 92, 151, 0.9) 0%, rgba(1, 42, 74, 0.7) 100%);
                    display: flex;
                    align-items: center;
                    padding: 5rem;
                }
                .visual-content { color: white; max-width: 500px; }
                .visual-badge { display: inline-block; background: rgba(255,255,255,0.15); padding: 0.5rem 1rem; border-radius: 99px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; margin-bottom: 2rem; border: 1px solid rgba(255,255,255,0.2); }
                .visual-content h1 { font-size: 3.5rem; font-weight: 950; line-height: 1.1; margin-bottom: 1.5rem; }
                .visual-content p { font-size: 1.1rem; opacity: 0.8; line-height: 1.6; margin-bottom: 3rem; }
                
                .visual-stats { display: flex; gap: 3rem; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 2rem; }
                .v-stat strong { display: block; font-size: 1.8rem; font-weight: 900; }
                .v-stat span { font-size: 0.85rem; opacity: 0.7; }

                .auth-form-side { 
                    padding: 4rem; 
                    display: flex; 
                    flex-direction: column; 
                    justify-content: center; 
                    align-items: center; 
                    background: #fcfdfe;
                }
                .form-card { width: 100%; max-width: 400px; }
                
                .auth-header { text-align: center; margin-bottom: 3.5rem; }
                .auth-logo { display: inline-flex; align-items: center; gap: 0.6rem; margin-bottom: 2rem; }
                .auth-logo .sym { background: var(--primary); color: white; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 12px; font-weight: 900; font-size: 1.4rem; }
                .auth-logo .txt { font-size: 1.6rem; font-weight: 900; color: #012a4a; letter-spacing: -0.05em; }
                
                .auth-header h2 { font-size: 1.8rem; font-weight: 850; color: #012a4a; margin-bottom: 0.5rem; }
                .auth-header p { color: #64748b; font-size: 0.95rem; }

                .auth-error { background: #fee2e2; color: #b91c1c; padding: 1rem; border-radius: 12px; margin-bottom: 2rem; display: flex; align-items: center; gap: 0.75rem; font-size: 0.85rem; font-weight: 700; border: 1px solid #fecaca; }
                .pulse { animation: p 0.4s ease; }
                @keyframes p { 0% { transform: scale(0.98); } 50% { transform: scale(1.02); } 100% { transform: scale(1); } }

                .field-group { margin-bottom: 1.8rem; }
                .field-group label { display: block; font-size: 0.7rem; font-weight: 900; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em; margin-bottom: 0.8rem; }
                .label-row { display: flex; justify-content: space-between; align-items: center; }
                .label-row a { font-size: 0.75rem; font-weight: 700; color: var(--primary); }

                .input-icon-wrap { position: relative; display: flex; align-items: center; }
                .input-icon-wrap svg { position: absolute; left: 1rem; color: #94a3b8; }
                .input-icon-wrap input { width: 100%; padding: 0.9rem 1rem 0.9rem 3rem; border-radius: 12px; border: 1.5px solid #e2e8f0; background: white; font-weight: 600; font-size: 0.95rem; transition: var(--transition); }
                .input-icon-wrap input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(0, 92, 151, 0.08); outline: none; }
                
                .eye-toggle { position: absolute; right: 1rem; color: #94a3b8; }
                .eye-toggle:disabled { opacity: 0.5; cursor: not-allowed; }

                .form-options { margin-bottom: 2rem; }
                .check-label { display: flex; align-items: center; gap: 0.6rem; cursor: pointer; font-size: 0.85rem; font-weight: 700; color: #475569; }
                .check-label input { width: 18px; height: 18px; border-radius: 4px; border: 1.5px solid #cbd5e1; accent-color: var(--primary); }

                .btn-auth-submit { width: 100%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; gap: 1rem; padding: 1.1rem; border-radius: 14px; font-weight: 800; font-size: 1rem; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                .btn-auth-submit:hover { transform: translateY(-4px); box-shadow: 0 15px 30px rgba(0, 92, 151, 0.25); }
                .btn-auth-submit:disabled { opacity: 0.85; cursor: wait; transform: none; box-shadow: none; }
                .spin-icon { animation: spin 0.8s linear infinite; }
                
                .auth-footer { text-align: center; margin-top: 3.5rem; }
                .auth-footer p { font-size: 0.85rem; color: #64748b; margin-bottom: 1.5rem; font-style: italic; }
                .access-prompt { font-size: 0.9rem; font-weight: 700; color: #334155; }
                .access-prompt a { color: var(--primary); text-decoration: underline; }

                .auth-security-footer { margin-top: 5rem; display: flex; gap: 2rem; color: #cbd5e1; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
                .sec-item { display: flex; align-items: center; gap: 6px; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                @media (max-width: 1024px) {
                    .auth-container { grid-template-columns: 1fr; }
                    .auth-form-side { min-height: 100vh; padding: 2rem; }
                }
            `}</style>
        </div>
    );
};

export default Login;
