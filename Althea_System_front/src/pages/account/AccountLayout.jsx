import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  User, 
  Package, 
  Settings, 
  LogOut, 
  ShieldCheck
} from 'lucide-react';

const AccountLayout = () => {
    const navigate = useNavigate();
    
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('authchange'));
        navigate('/', { replace: true });
    };

    return (
        <div className="account-layout modern-bg">
            <div className="container layout-grid">
                {/* Sidebar Navigation */}
                <aside className="account-sidebar">
                    <div className="sidebar-header">
                        <div className="user-avatar">
                            <User size={32} />
                        </div>
                        <div className="user-meta">
                            <h4>Personal Workspace</h4>
                            <p>Premium Institutional Access</p>
                        </div>
                    </div>

                    <nav className="sidebar-nav">
                        <NavLink to="/account/settings" className={({isActive}) => isActive ? 'active' : ''}>
                            <Settings size={18} /> Parametres du compte
                        </NavLink>
                        <NavLink to="/account/orders" className={({isActive}) => isActive ? 'active' : ''}>
                            <Package size={18} /> Mes commandes
                        </NavLink>
                        <div className="sidebar-note">
                            <ShieldCheck size={18} />
                            <span>Sections facture, adresses et securite a brancher ensuite.</span>
                        </div>
                        <button className="nav-logout" onClick={handleLogout}>
                            <LogOut size={18} /> Se deconnecter
                        </button>
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="account-main-content">
                    <Outlet />
                </main>
            </div>

            <style>{`
                .account-layout { padding: 4rem 0 8rem; min-height: 80vh; background: #fcfdfe; }
                .layout-grid { display: grid; grid-template-columns: 320px 1fr; gap: 4rem; align-items: start; }

                .account-sidebar { 
                    background: white; 
                    border-radius: 24px; 
                    padding: 2.5rem; 
                    box-shadow: 0 10px 40px -10px rgba(0,0,0,0.05);
                    border: 1px solid #f1f5f9;
                    position: sticky;
                    top: 120px;
                }

                .sidebar-header { display: flex; align-items: center; gap: 1.25rem; margin-bottom: 3rem; padding-bottom: 2rem; border-bottom: 1px solid #f1f5f9; }
                .user-avatar { width: 64px; height: 64px; background: #f1f5f9; color: var(--primary); display: flex; align-items: center; justify-content: center; border-radius: 18px; }
                .user-meta h4 { font-size: 1.1rem; font-weight: 800; color: #012a4a; margin-bottom: 0.2rem; }
                .user-meta p { font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }

                .sidebar-nav { display: flex; flex-direction: column; gap: 0.5rem; }
                .sidebar-nav a, .nav-logout { 
                    display: flex; 
                    align-items: center; 
                    gap: 1rem; 
                    padding: 1rem 1.25rem; 
                    border-radius: 12px; 
                    font-weight: 700; 
                    font-size: 0.95rem; 
                    color: #475569; 
                    transition: all 0.3s ease;
                    text-decoration: none;
                    background: transparent;
                    width: 100%;
                    text-align: left;
                }
                .sidebar-nav a:hover, .nav-logout:hover { background: #f8fafc; color: var(--primary); }
                .sidebar-nav a.active { background: #f0f4f8; color: var(--primary); box-shadow: inset 0 0 0 1px rgba(1, 42, 74, 0.05); }
                .sidebar-note {
                    display: flex;
                    align-items: flex-start;
                    gap: 1rem;
                    padding: 1rem 1.25rem;
                    border-radius: 12px;
                    background: #f8fafc;
                    color: #64748b;
                    font-size: 0.9rem;
                    font-weight: 600;
                }
                
                .nav-logout { margin-top: 1rem; color: #ef4444; border-top: 1px solid #f1f5f9; padding-top: 1.5rem; border-radius: 0; }
                .nav-logout:hover { color: #dc2626; background: transparent; }

                .account-main-content { background: white; border-radius: 32px; padding: 4rem; border: 1px solid #f1f5f9; min-height: 600px; box-shadow: 0 40px 100px -40px rgba(0,0,0,0.05); }

                @media (max-width: 1024px) {
                    .layout-grid { grid-template-columns: 1fr; gap: 2rem; }
                    .account-sidebar { position: static; }
                }
            `}</style>
        </div>
    );
};

export default AccountLayout;
