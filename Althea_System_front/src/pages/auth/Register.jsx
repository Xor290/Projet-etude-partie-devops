import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  User as UserIcon,
  Building,
  Phone,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  MapPin,
  Hash,
  Globe as GlobeIcon
} from 'lucide-react';
import { register } from '../../services/api';
import Loader from '../../components/common/Loader';

const Register = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        company: '',
        siret: '',
        phone: '',
        address: '',
        postalCode: '',
        city: '',
        country: 'France',
        password: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await register(formData);
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2500);
        } catch (err) {
            console.error('Registration Error:', err);
            setError(err.response?.data?.message || "L'inscription a echoue. Verifie les informations saisies.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-visual desktop-only">
                    <div className="visual-overlay">
                        <div className="visual-content">
                            <div className="visual-badge">Acces Professionnel</div>
                            <h1>Creez un espace clair et securise.</h1>
                            <p>Inscrivez votre structure pour acceder au catalogue, aux commandes et a un suivi centralise.</p>

                            <div className="visual-stats">
                                <div className="v-stat">
                                    <strong>Catalogue</strong>
                                    <span>Categories simplifiees</span>
                                </div>
                                <div className="v-stat">
                                    <strong>Compte</strong>
                                    <span>Gestion plus lisible</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="auth-form-side">
                    <div className="form-card">
                        <header className="auth-header">
                            <NavLink to="/" className="auth-logo">
                                <span className="sym">A</span>
                                <span className="txt">ALTHEA</span>
                            </NavLink>
                            <h2>Creer un compte</h2>
                            <p>Une interface proche de la connexion, mais dediee a l'inscription.</p>
                        </header>

                        {success ? (
                            <div className="success-panel pulse">
                                <ShieldCheck size={56} />
                                <h3>Compte cree</h3>
                                <p>Votre demande a bien ete enregistree. Redirection vers la connexion en cours.</p>
                                <NavLink to="/login" className="btn-auth-submit inline-submit">
                                    Aller a la connexion
                                </NavLink>
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
                                    <div className="form-row">
                                        <div className="field-group">
                                            <label>Prenom</label>
                                            <div className="input-icon-wrap">
                                                <UserIcon size={18} />
                                                <input type="text" name="firstName" placeholder="Jean" required value={formData.firstName} onChange={handleChange} />
                                            </div>
                                        </div>
                                        <div className="field-group">
                                            <label>Nom</label>
                                            <div className="input-icon-wrap">
                                                <UserIcon size={18} />
                                                <input type="text" name="lastName" placeholder="Dupont" required value={formData.lastName} onChange={handleChange} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="field-group">
                                        <label>Email professionnel</label>
                                        <div className="input-icon-wrap">
                                            <Mail size={18} />
                                            <input type="email" name="email" placeholder="nom@etablissement.fr" required value={formData.email} onChange={handleChange} />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="field-group">
                                            <label>Etablissement</label>
                                            <div className="input-icon-wrap">
                                                <Building size={18} />
                                                <input type="text" name="company" placeholder="Clinique Althea" required value={formData.company} onChange={handleChange} />
                                            </div>
                                        </div>
                                        <div className="field-group">
                                            <label>SIRET</label>
                                            <div className="input-icon-wrap">
                                                <Hash size={18} />
                                                <input type="text" name="siret" placeholder="123 456 789 00012" value={formData.siret} onChange={handleChange} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="field-group">
                                        <label>Adresse</label>
                                        <div className="input-icon-wrap">
                                            <MapPin size={18} />
                                            <input type="text" name="address" placeholder="12 rue de la Paix" value={formData.address} onChange={handleChange} />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="field-group">
                                            <label>Code Postal</label>
                                            <div className="input-icon-wrap">
                                                <Hash size={18} />
                                                <input type="text" name="postalCode" placeholder="75000" value={formData.postalCode} onChange={handleChange} />
                                            </div>
                                        </div>
                                        <div className="field-group">
                                            <label>Ville</label>
                                            <div className="input-icon-wrap">
                                                <MapPin size={18} />
                                                <input type="text" name="city" placeholder="Paris" value={formData.city} onChange={handleChange} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="field-group">
                                            <label>Pays</label>
                                            <div className="input-icon-wrap">
                                                <GlobeIcon size={18} />
                                                <input type="text" name="country" placeholder="France" value={formData.country} onChange={handleChange} />
                                            </div>
                                        </div>
                                        <div className="field-group">
                                            <label>Telephone</label>
                                            <div className="input-icon-wrap">
                                                <Phone size={18} />
                                                <input type="tel" name="phone" placeholder="+33 6 00 00 00 00" required value={formData.phone} onChange={handleChange} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="field-group">
                                        <label>Mot de passe</label>
                                        <div className="input-icon-wrap">
                                            <Lock size={18} />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                placeholder="••••••••"
                                                required
                                                value={formData.password}
                                                onChange={handleChange}
                                            />
                                            <button type="button" className="eye-toggle" onClick={() => setShowPassword((prev) => !prev)}>
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <button type="submit" className="btn-auth-submit">
                                        <span>Creer mon espace</span>
                                        <ArrowRight size={20} />
                                    </button>
                                </form>

                                <footer className="auth-footer">
                                    <p>Acces reserve aux utilisateurs autorises.</p>
                                    <div className="access-prompt">
                                        Vous avez deja un compte ? <NavLink to="/login">Se connecter</NavLink>
                                    </div>
                                </footer>
                            </>
                        )}
                    </div>

                    <div className="auth-security-footer">
                        <div className="sec-item"><ShieldCheck size={14} /> Donnees securisees</div>
                        <div className="sec-item"><Building size={14} /> Parcours harmonise</div>
                    </div>
                </div>
            </div>

            <style>{`
                .auth-page {
                    max-width: 100vw;
                    min-height: 100vh;
                    background: white;
                    display: flex;
                    align-items: stretch;
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
                    background: linear-gradient(135deg, rgba(0, 92, 151, 0.9) 0%, rgba(1, 42, 74, 0.72) 100%);
                    display: flex;
                    align-items: center;
                    padding: 5rem;
                }
                .visual-content { color: white; max-width: 500px; }
                .visual-badge { display: inline-block; background: rgba(255,255,255,0.15); padding: 0.5rem 1rem; border-radius: 99px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; margin-bottom: 2rem; border: 1px solid rgba(255,255,255,0.2); }
                .visual-content h1 { font-size: 3.4rem; font-weight: 950; line-height: 1.1; margin-bottom: 1.5rem; }
                .visual-content p { font-size: 1.05rem; opacity: 0.85; line-height: 1.6; margin-bottom: 3rem; }
                .visual-stats { display: flex; gap: 3rem; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 2rem; }
                .v-stat strong { display: block; font-size: 1.2rem; font-weight: 900; }
                .v-stat span { font-size: 0.85rem; opacity: 0.75; }

                .auth-form-side {
                    padding: 4rem 2rem;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-start;
                    align-items: center;
                    background: #fcfdfe;
                    overflow-y: auto;
                    height: 100vh;
                }
                .form-card { width: 100%; max-width: 400px; }
                .auth-header { text-align: center; margin-bottom: 3rem; }
                .auth-logo { display: inline-flex; align-items: center; gap: 0.6rem; margin-bottom: 2rem; text-decoration: none; }
                .auth-logo .sym { background: var(--primary); color: white; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 12px; font-weight: 900; font-size: 1.4rem; }
                .auth-logo .txt { font-size: 1.6rem; font-weight: 900; color: #012a4a; letter-spacing: -0.05em; }
                .auth-header h2 { font-size: 1.8rem; font-weight: 850; color: #012a4a; margin-bottom: 0.5rem; }
                .auth-header p { color: #64748b; font-size: 0.95rem; }

                .auth-error { background: #fee2e2; color: #b91c1c; padding: 1rem; border-radius: 12px; margin-bottom: 2rem; display: flex; align-items: center; gap: 0.75rem; font-size: 0.85rem; font-weight: 700; border: 1px solid #fecaca; }
                .pulse { animation: p 0.4s ease; }
                @keyframes p { 0% { transform: scale(0.98); } 50% { transform: scale(1.02); } 100% { transform: scale(1); } }

                .auth-form { display: flex; flex-direction: column; gap: 1.3rem; }
                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                .field-group label { display: block; font-size: 0.7rem; font-weight: 900; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em; margin-bottom: 0.8rem; }
                .input-icon-wrap { position: relative; display: flex; align-items: center; }
                .input-icon-wrap svg { position: absolute; left: 1rem; color: #94a3b8; }
                .input-icon-wrap input { width: 100%; padding: 0.9rem 1rem 0.9rem 3rem; border-radius: 12px; border: 1.5px solid #e2e8f0; background: white; font-weight: 600; font-size: 0.95rem; transition: var(--transition); }
                .input-icon-wrap input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(0, 92, 151, 0.08); outline: none; }
                .eye-toggle { position: absolute; right: 1rem; color: #94a3b8; }

                .btn-auth-submit { width: 100%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; gap: 1rem; padding: 1.1rem; border-radius: 14px; font-weight: 800; font-size: 1rem; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); text-decoration: none; }
                .btn-auth-submit:hover { transform: translateY(-4px); box-shadow: 0 15px 30px rgba(0, 92, 151, 0.25); }
                .inline-submit { margin-top: 1.5rem; }

                .auth-footer { text-align: center; margin-top: 3rem; }
                .auth-footer p { font-size: 0.85rem; color: #64748b; margin-bottom: 1.5rem; font-style: italic; }
                .access-prompt { font-size: 0.9rem; font-weight: 700; color: #334155; }
                .access-prompt a { color: var(--primary); text-decoration: underline; }

                .success-panel {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    gap: 1rem;
                    padding: 2.5rem;
                    border: 1px solid #dbeafe;
                    border-radius: 24px;
                    background: white;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.06);
                    color: #012a4a;
                }
                .success-panel svg { color: var(--primary); }
                .success-panel p { color: #64748b; line-height: 1.6; }

                .auth-security-footer { margin-top: 4rem; display: flex; gap: 2rem; color: #cbd5e1; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
                .sec-item { display: flex; align-items: center; gap: 6px; }

                @media (max-width: 1024px) {
                    .auth-container { grid-template-columns: 1fr; }
                    .auth-form-side { min-height: 100vh; padding: 2rem; }
                    .form-row { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};

export default Register;
