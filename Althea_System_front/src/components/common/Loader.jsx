import React from 'react';

const Loader = () => {
    return (
        <div className="loader-overlay">
            <div className="loader-container">
                <div className="loader-logo">A</div>
                <div className="loader-spinner"></div>
                <div className="loader-text">ALTHEA SYSTEMS</div>
                <div className="loader-tag">Initializing Premium Infrastructure...</div>
            </div>
            
            <style>{`
                .loader-overlay {
                    position: fixed;
                    inset: 0;
                    background: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                }
                
                .loader-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1.5rem;
                }
                
                .loader-logo {
                    width: 80px;
                    height: 80px;
                    background: var(--primary);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 20px;
                    font-size: 2.5rem;
                    font-weight: 900;
                    animation: pulseLogo 1.5s infinite ease-in-out;
                    box-shadow: 0 20px 40px rgba(0, 92, 151, 0.2);
                }
                
                .loader-spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid #f1f5f9;
                    border-top: 3px solid var(--primary);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                
                .loader-text {
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: #012a4a;
                    letter-spacing: 0.1rem;
                }
                
                .loader-tag {
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.2rem;
                }
                
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes pulseLogo { 
                    0% { transform: scale(1); box-shadow: 0 20px 40px rgba(0, 92, 151, 0.2); }
                    50% { transform: scale(1.05); box-shadow: 0 30px 60px rgba(0, 92, 151, 0.3); }
                    100% { transform: scale(1); box-shadow: 0 20px 40px rgba(0, 92, 151, 0.2); }
                }
                @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; visibility: hidden; } }
            `}</style>
        </div>
    );
};

export default Loader;
