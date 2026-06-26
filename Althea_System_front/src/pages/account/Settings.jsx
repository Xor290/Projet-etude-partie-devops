import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Mail, Phone, Building, Save, ShieldCheck, BellRing, MapPin } from 'lucide-react';
import { getUserProfile, updateUserProfile } from '../../services/api';

const Settings = () => {
    const { t } = useTranslation();
    const [user, setUser] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        siret: '',
        address: '',
        postalCode: '',
        city: '',
        country: '',
    });

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await getUserProfile();
                const u = response.data;
                setUser({
                    firstName: u.firstName || '',
                    lastName: u.lastName || '',
                    email: u.email || '',
                    phone: u.phone || '',
                    company: u.company || '',
                    siret: u.siret || '',
                    address: u.address || '',
                    postalCode: u.postalCode || '',
                    city: u.city || '',
                    country: u.country || '',
                });
            } catch (err) {
                console.error("Erreur lors de la récupération du profil", err);
                setError(t('settings.error_load', 'Impossible de charger les données du profil.'));
            } finally {
                setFetching(false);
            }
        };
        fetchProfile();
    }, [t]);

    const handleChange = (e) => {
        setUser({...user, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSaved(false);
        try {
            const response = await updateUserProfile(user);
            const u = response.data.user;
            setUser({
                firstName: u.firstName || '',
                lastName: u.lastName || '',
                email: u.email || '',
                phone: u.phone || '',
                company: u.company || '',
                siret: u.siret || '',
                address: u.address || '',
                postalCode: u.postalCode || '',
                city: u.city || '',
                country: u.country || '',
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 4000);
        } catch (err) {
            console.error("Erreur lors de la mise à jour du profil", err);
            setError(t('settings.error_save', 'Une erreur est survenue lors de la sauvegarde.'));
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="settings-page loading-state">
                <div className="spinner"></div>
                <p>{t('settings.loading', 'Chargement de votre profil institutionnel...')}</p>
                <style>{`
                    .loading-state { display: flex; flex-direction: column; gap: 1.5rem; align-items: center; justify-content: center; min-height: 400px; font-weight: 700; color: #64748b; font-size: 1.1rem; }
                    .spinner { width: 40px; height: 40px; border: 4px solid #f1f5f9; border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; }
                    @keyframes spin { to { transform: rotate(360deg); } }
                `}</style>
            </div>
        );
    }

    return (
        <div className="settings-page">
            <header className="page-header">
                <h1 className="page-title">{t('settings.title', 'Profile Settings')}</h1>
                <p className="page-subtitle">{t('settings.subtitle', 'Manage your personal information and institutional preferences.')}</p>
            </header>

            <form onSubmit={handleSubmit} className="settings-grid">
                {error && (
                    <div className="error-alert">
                        <span>⚠️ {error}</span>
                    </div>
                )}

                <section className="settings-section">
                    <h3 className="section-title"><User size={18} /> {t('settings.basic_info', 'Basic Information')}</h3>
                    <div className="form-row">
                        <div className="input-group">
                            <label>{t('settings.first_name', 'First Name')}</label>
                            <input type="text" name="firstName" value={user.firstName} onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <label>{t('settings.last_name', 'Last Name')}</label>
                            <input type="text" name="lastName" value={user.lastName} onChange={handleChange} required />
                        </div>
                    </div>
                </section>

                <section className="settings-section">
                    <h3 className="section-title"><Mail size={18} /> {t('settings.contact_info', 'Professional Contact')}</h3>
                    <div className="form-row">
                        <div className="input-group">
                            <label>{t('settings.email', 'Institutional Email')}</label>
                            <input type="email" name="email" value={user.email} disabled className="disabled-input" title="L'adresse email de connexion ne peut pas être modifiée." />
                        </div>
                        <div className="input-group">
                            <label>{t('settings.phone', 'Direct Phone')}</label>
                            <input type="text" name="phone" value={user.phone} onChange={handleChange} />
                        </div>
                    </div>
                </section>

                <section className="settings-section">
                    <h3 className="section-title"><Building size={18} /> {t('settings.organization', 'Organization')}</h3>
                    <div className="form-row">
                        <div className="input-group">
                            <label>{t('settings.company', 'Company / Hospital')}</label>
                            <input type="text" name="company" value={user.company} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <label>{t('settings.siret', 'SIRET / Company ID')}</label>
                            <input type="text" name="siret" value={user.siret} onChange={handleChange} />
                        </div>
                    </div>
                </section>

                <section className="settings-section">
                    <h3 className="section-title"><MapPin size={18} /> {t('settings.address_details', 'Address Details')}</h3>
                    <div className="input-group mb-4">
                        <label>{t('settings.street_address', 'Street Address')}</label>
                        <input type="text" name="address" value={user.address} onChange={handleChange} />
                    </div>
                    <div className="form-row">
                        <div className="input-group">
                            <label>{t('settings.postal_code', 'Postal Code')}</label>
                            <input type="text" name="postalCode" value={user.postalCode} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <label>{t('settings.city', 'City')}</label>
                            <input type="text" name="city" value={user.city} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="input-group mt-4">
                        <label>{t('settings.country', 'Country')}</label>
                        <input type="text" name="country" value={user.country} onChange={handleChange} />
                    </div>
                </section>

                <div className="form-actions">
                    <button type="submit" className="btn-save" disabled={loading}>
                        {loading ? t('settings.updating', 'Updating...') : <><Save size={18} /> {t('settings.save_changes', 'Save Workspace Changes')}</>}
                    </button>
                    {saved && <span className="save-success">{t('settings.success', '✓ Changes persisted successfully')}</span>}
                </div>
            </form>

            <div className="extra-options-grid mt-4">
                <div className="option-card">
                    <ShieldCheck size={24} className="text-primary" />
                    <div>
                        <h4>{t('settings.security_title', 'Security & 2FA')}</h4>
                        <p>{t('settings.security_desc', 'Protect your medical procurement access with Two-Factor Authentication.')}</p>
                    </div>
                </div>
                <div className="option-card">
                    <BellRing size={24} className="text-primary" />
                    <div>
                        <h4>{t('settings.notif_title', 'Notifications')}</h4>
                        <p>{t('settings.notif_desc', 'Configure alerts for order status, maintenance cycles, and compliance updates.')}</p>
                    </div>
                </div>
            </div>

            <style>{`
                .page-header { margin-bottom: 4rem; padding-bottom: 2rem; border-bottom: 2px solid #f8fafc; }
                .page-title { font-size: 2.2rem; font-weight: 900; color: #012a4a; margin-bottom: 0.5rem; letter-spacing: -0.02em; }
                .page-subtitle { color: #64748b; font-size: 1rem; font-weight: 500; }

                .settings-grid { display: flex; flex-direction: column; gap: 3rem; }
                .settings-section { padding: 2rem; background: #fcfdfe; border: 1px solid #f1f5f9; border-radius: 20px; }
                .section-title { display: flex; align-items: center; gap: 0.8rem; font-size: 1.1rem; font-weight: 800; color: var(--primary); margin-bottom: 2rem; }
                
                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
                .input-group { display: flex; flex-direction: column; gap: 0.5rem; }
                .input-group label { font-size: 0.75rem; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.2rem; }
                .input-group input { padding: 1rem 1.25rem; border-radius: 12px; border: 1.5px solid #e2e8f0; font-weight: 700; color: #012a4a; background: white; transition: all 0.3s ease; }
                .input-group input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(1, 42, 74, 0.05); outline: none; }
                .input-group input.disabled-input { background: #f8fafc; border-color: #e2e8f0; color: #94a3b8; cursor: not-allowed; }

                .mb-4 { margin-bottom: 1.5rem; }
                .mt-4 { margin-top: 1.5rem; }

                .error-alert { background: #fee2e2; border: 1px solid #fca5a5; padding: 1rem 1.5rem; border-radius: 12px; color: #b91c1c; font-weight: 700; font-size: 0.95rem; }

                .form-actions { display: flex; align-items: center; gap: 2rem; margin-top: 1rem; }
                .btn-save { display: flex; align-items: center; gap: 0.8rem; background: var(--primary); color: white; padding: 1.25rem 2.5rem; border-radius: 16px; font-weight: 800; font-size: 1rem; box-shadow: 0 10px 20px rgba(1, 42, 74, 0.1); border: none; cursor: pointer; transition: all 0.3s ease; }
                .btn-save:hover { transform: translateY(-3px); box-shadow: 0 20px 30px rgba(1, 42, 74, 0.2); }
                .btn-save:disabled { background: #94a3b8; cursor: not-allowed; transform: none; box-shadow: none; }
                .save-success { color: #10b981; font-weight: 800; font-size: 0.9rem; }

                .extra-options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 4rem; }
                .option-card { display: flex; gap: 1.5rem; padding: 2rem; background: white; border: 1px solid #f1f5f9; border-radius: 20px; transition: all 0.3s ease; cursor: pointer; }
                .option-card:hover { transform: translateY(-4px); box-shadow: 0 15px 35px -10px rgba(0,0,0,0.08); border-color: var(--primary); }
                .option-card h4 { font-size: 1.1rem; font-weight: 800; color: #012a4a; margin-bottom: 0.4rem; }
                .option-card p { font-size: 0.9rem; color: #64748b; line-height: 1.5; }

                .text-primary { color: var(--primary); }

                @media (max-width: 768px) {
                    .form-row, .extra-options-grid { grid-template-columns: 1fr; }
                    .page-title { font-size: 1.8rem; }
                }
            `}</style>
        </div>
    );
};

export default Settings;
