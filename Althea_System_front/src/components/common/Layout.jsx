import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div className="app-layout">
      <Header />
      <main className="app-main">
        {children || <Outlet />}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
