import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Layout from './components/common/Layout';
import Loader from './components/common/Loader';
import AccountLayout from './pages/account/AccountLayout';
import Orders from './pages/account/Orders';
import Settings from './pages/account/Settings';
import './index.css'; // Global CSS

// Lazy loading components for performance
const Home = lazy(() => import('./pages/Home'));
const Category = lazy(() => import('./pages/Category'));
const Product = lazy(() => import('./pages/Product'));
const Search = lazy(() => import('./pages/Search'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Catalogue = lazy(() => import('./pages/Catalogue'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'));
const Contact = lazy(() => import('./pages/Contact'));
const Cancel = lazy(() => import('./pages/Cancel'));

// Component for protected routes
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('token'); // Simplification for context
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Suspense fallback={<Loader />}>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/catalogue" element={<Catalogue />} />
          <Route path="/category/:id" element={<Category />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/search" element={<Search />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Protected Account Routes */}
          <Route path="/account" element={
            <ProtectedRoute>
              <AccountLayout />
            </ProtectedRoute>
          }>
              <Route path="settings" element={<Settings />} />
              <Route path="orders" element={<Orders />} />
              <Route index element={<Settings />} />
          </Route>

          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/cancel" element={<Cancel />} />
          <Route path="/contact" element={<Contact />} />

          {/* Redirect all unknown to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Suspense>
  );
}

export default App;
