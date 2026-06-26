import { NavLink } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, MessageCircle, ArrowUp, Zap, ShieldCheck, HeartPulse } from 'lucide-react';

const Footer = () => {

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const footerLinks = {
    solutions: [
      { name: 'Surgical Imaging', path: '/category/surgical' },
      { name: 'Laboratory Automation', path: '/category/lab' },
      { name: 'Patient Monitoring', path: '/category/diagnostics' },
      { name: 'Hospital Infrastructure', path: '/category/ward' }
    ],
    support: [
      { name: 'Maintenance Services', path: '/services/maintenance' },
      { name: 'Regulatory Support', path: '/services/regulatory' },
      { name: 'Logistics & Warehousing', path: '/services/logistics' },
      { name: 'Technical Training', path: '/services/training' }
    ],
    company: [
      { name: 'Our Identity', path: '/about' },
      { name: 'Global Network', path: '/network' },
      { name: 'Innovation Hub', path: '/innovation' },
      { name: 'Career Opportunities', path: '/careers' }
    ]
  };

  return (
    <footer className="footer-premium">
      {/* Top Banner: Values */}
      <div className="footer-values">
        <div className="container">
          <div className="value-item">
             <ShieldCheck size={28} />
             <div className="v-meta">
               <strong>Certified Quality</strong>
               <span>ISO 13485:2016 Compliant</span>
             </div>
          </div>
          <div className="value-item">
             <Zap size={28} />
             <div className="v-meta">
               <strong>Express Logistics</strong>
               <span>Next-day medical supply</span>
             </div>
          </div>
          <div className="value-item">
             <HeartPulse size={28} />
             <div className="v-meta">
               <strong>24/7 Life Support</strong>
               <span>Emergency technical assistance</span>
             </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            {/* Column 1: Brand Info */}
            <div className="footer-col brand-col">
              <NavLink to="/" className="brand-footer">
                <span className="b-main">ALTHEA</span>
                <span className="b-accent">SYSTEMS</span>
              </NavLink>
              <p className="footer-desc">
                Pioneering medical excellence through high-end hardware and smarter infrastructure solutions since 2012. Trusted by 2,500+ clinics worldwide.
              </p>
              <div className="social-links">
                <a href="#"><Facebook size={20} /></a>
                <a href="#"><Twitter size={20} /></a>
                <a href="#"><Linkedin size={20} /></a>
              </div>
            </div>

            {/* Links Columns */}
            <div className="footer-col">
              <h4>Solutions</h4>
              <ul>
                {footerLinks.solutions.map(l => <li key={l.name}><NavLink to={l.path}>{l.name}</NavLink></li>)}
              </ul>
            </div>
            <div className="footer-col">
              <h4>Expertise</h4>
              <ul>
                {footerLinks.support.map(l => <li key={l.name}><NavLink to={l.path}>{l.name}</NavLink></li>)}
              </ul>
            </div>

            {/* Column 4: Contact */}
            <div className="footer-col contact-col">
              <h4>Connect</h4>
              <ul className="contact-list">
                <li><MapPin size={18} /> 128 Medical Row, Berlin, Germany</li>
                <li><Phone size={18} /> +49 (0) 30 1234 5678</li>
                <li><Mail size={18} /> systems@althea.med</li>
              </ul>
              <button className="chat-trigger-btn">
                <MessageCircle size={18} /> 
                Open Live Support
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal */}
      <div className="footer-bottom">
        <div className="container bottom-wrap">
          <p className="copyright">© 2026 Althea Systems AG. All rights reserved.</p>
          <div className="legal-links">
             <NavLink to="/legal/privacy">Privacy Policy</NavLink>
             <NavLink to="/legal/terms">Terms of Service</NavLink>
             <NavLink to="/legal/compliance">Cookie Policy</NavLink>
          </div>
          <button className="back-to-top" onClick={scrollToTop}>
            <ArrowUp size={18} />
          </button>
        </div>
      </div>

      <style>{`
        .footer-premium { background: #0f172a; color: #e2e8f0; padding-top: 4rem; position: relative; }
        .container { max-width: var(--container-width); margin: 0 auto; padding: 0 1.5rem; }

        .footer-values { padding-bottom: 4rem; border-bottom: 1px solid rgba(255,255,255,0.05); margin-bottom: 4rem; }
        .footer-values .container { display: flex; flex-wrap: wrap; gap: 3rem; justify-content: space-between; }
        .value-item { display: flex; align-items: center; gap: 1rem; }
        .value-item svg { color: var(--accent); }
        .v-meta { display: flex; flex-direction: column; }
        .v-meta strong { color: white; font-size: 1.1rem; }
        .v-meta span { font-size: 0.85rem; color: #94a3b8; }

        .footer-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 4rem; }
        .brand-col { grid-column: span 2; }

        .brand-footer { display: flex; align-items: center; gap: 0.3rem; font-weight: 800; font-size: 1.8rem; margin-bottom: 1.5rem; text-decoration: none; }
        .b-main { color: white; }
        .b-accent { color: var(--accent); font-weight: 400; }
        .footer-desc { color: #94a3b8; line-height: 1.6; margin-bottom: 2rem; max-width: 400px; }

        .social-links { display: flex; gap: 1rem; }
        .social-links a { width: 40px; height: 40px; background: rgba(255,255,255,0.05); border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: var(--transition); }
        .social-links a:hover { background: var(--primary); transform: translateY(-3px); }

        .footer-col h4 { color: white; font-size: 1.1rem; margin-bottom: 1.5rem; font-weight: 700; position: relative; }
        .footer-col h4::after { content: ''; position: absolute; left: 0; bottom: -8px; width: 30px; height: 2px; background: var(--primary); }
        
        .footer-col ul { list-style: none; padding: 0; }
        .footer-col li { margin-bottom: 0.8rem; }
        .footer-col a { color: #94a3b8; text-decoration: none; transition: var(--transition); font-size: 0.95rem; }
        .footer-col a:hover { color: white; padding-left: 5px; }

        .contact-list li { display: flex; align-items: flex-start; gap: 0.8rem; color: #94a3b8; font-size: 0.95rem; }
        .contact-list svg { color: var(--primary); flex-shrink: 0; }

        .chat-trigger-btn { margin-top: 1.5rem; display: flex; align-items: center; gap: 0.5rem; background: var(--primary); color: white; padding: 0.8rem 1.5rem; border-radius: 12px; font-weight: 600; width: 100%; justify-content: center; }

        .footer-bottom { margin-top: 5rem; padding: 2rem 0; border-top: 1px solid rgba(255,255,255,0.05); font-size: 0.85rem; color: #64748b; }
        .bottom-wrap { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1.5rem; }
        
        .legal-links { display: flex; gap: 2rem; }
        .legal-links a:hover { color: white; }

        .back-to-top { background: rgba(255,255,255,0.05); padding: 0.5rem; border-radius: 8px; color: white; }
        .back-to-top:hover { background: var(--primary); }

        @media (max-width: 1024px) {
           .brand-col { grid-column: span 1; }
           .footer-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 640px) {
           .footer-grid { grid-template-columns: 1fr; }
           .footer-values .container { flex-direction: column; gap: 2rem; }
           .legal-links { flex-direction: column; gap: 1rem; }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
