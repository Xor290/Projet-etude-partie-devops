import axios from 'axios';
import i18n from 'i18next';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const CACHE_TTL = 5 * 60 * 1000;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptors ────────────────────────────────────────────────────

api.interceptors.request.use((config) => {
  // Bearer token
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Locale: read from active i18next language
  const locale = (i18n.language || 'fr').split('-')[0].toLowerCase();
  if (!config.params) config.params = {};
  // Don't override if caller explicitly set locale already
  if (!config.params.locale) {
    config.params.locale = locale;
  }

  return config;
}, (error) => Promise.reject(error));

// ─── Cache Utilities ─────────────────────────────────────────────────────────

const responseFromData = (data) => ({ data });

const normalizeSearchValue = (value) => String(value ?? '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim();

const cacheStore = new Map();

// Clear ALL locale-sensitive caches when the user switches language
// so every product/category is re-fetched in the new locale on next access
i18n.on('languageChanged', () => {
  cacheStore.clear();
});

const getCachedEntry = (key) => {
  const entry = cacheStore.get(key);

  if (!entry) return null;

  if (entry.data && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry;
  }

  if (entry.promise) return entry;

  cacheStore.delete(key);
  return null;
};

const setCachedData = (key, data) => {
  cacheStore.set(key, { data, timestamp: Date.now() });
};

const seedProductCache = (product) => {
  if (product?.id) setCachedData(`product:${product.id}`, product);
};

const seedCategoryCache = (category) => {
  if (category?.id) setCachedData(`category:${category.id}`, category);
};

const seedProductsIntoEntityCache = (products) => {
  if (Array.isArray(products)) products.forEach(seedProductCache);
};

const seedFullProductsCache = (products) => {
  if (Array.isArray(products)) {
    seedProductsIntoEntityCache(products);
    setCachedData('products', products);
  }
};

const seedCategoriesCache = (categories) => {
  if (Array.isArray(categories)) {
    categories.forEach(seedCategoryCache);
    setCachedData('categories', categories);
  }
};

const cachedGet = async (key, fetcher, { onSuccess } = {}) => {
  const cachedEntry = getCachedEntry(key);

  if (cachedEntry?.data) return responseFromData(cachedEntry.data);
  if (cachedEntry?.promise) return cachedEntry.promise;

  const requestPromise = fetcher()
    .then((response) => {
      cacheStore.set(key, { data: response.data, timestamp: Date.now() });
      if (onSuccess) onSuccess(response.data);
      return responseFromData(response.data);
    })
    .catch((error) => {
      cacheStore.delete(key);
      throw error;
    });

  cacheStore.set(key, { promise: requestPromise });
  return requestPromise;
};

// ─── Home Service ────────────────────────────────────────────────────────────

export const getHomeData = () => cachedGet(
  'home',
  () => api.get('/home'),
  {
    onSuccess: (data) => {
      seedCategoriesCache(data?.categories);
      seedProductsIntoEntityCache(data?.topProducts);
    },
  }
);

// ─── Category Service ────────────────────────────────────────────────────────

export const getCategories = () => cachedGet(
  'categories',
  () => api.get('/categories'),
  {
    onSuccess: (data) => {
      seedCategoriesCache(data);
      data?.forEach((category) => seedProductsIntoEntityCache(category?.products));
    },
  }
);

export const getCategory = (id) => cachedGet(
  `category:${id}`,
  () => api.get(`/categories/${id}`),
  {
    onSuccess: (data) => {
      seedCategoryCache(data);
      seedProductsIntoEntityCache(data?.products);
    },
  }
);

export const getCategoryProducts = (categoryId, params) => cachedGet(
  `category-products:${categoryId}`,
  () => api.get(`/categories/${categoryId}/products`, { params }),
  { onSuccess: (data) => seedProductsIntoEntityCache(data) }
);

// ─── Products Service ─────────────────────────────────────────────────────────

export const getProducts = () => cachedGet(
  'products',
  () => api.get('/products'),
  { onSuccess: (data) => seedFullProductsCache(data) }
);

export const getProduct = (id) => cachedGet(
  `product:${id}`,
  () => api.get(`/products/${id}`),
  { onSuccess: (data) => seedProductCache(data) }
);

export const getSimilarProducts = (id) => cachedGet(
  `product-similar:${id}`,
  () => api.get(`/products/${id}/similar`),
  { onSuccess: (data) => seedProductsIntoEntityCache(data) }
);

// Real backend search — GET /api/products/search?q=... (min 2 chars)
export const searchProducts = async (query) => {
  const normalizedQuery = normalizeSearchValue(query);
  if (normalizedQuery.length < 2) return responseFromData([]);

  const response = await api.get('/products/search', { params: { q: query.trim() } });
  return responseFromData(response.data);
};

// ─── Auth Service ─────────────────────────────────────────────────────────────

export const register = (data) => api.post('/auth/register', data);

export const getUserProfile = () => api.get('/auth/me');
export const updateUserProfile = (data) => api.put('/auth/me', data);

// FIXED: path param — GET /api/auth/verify-email/{token}
// Returns { message, token } — frontend must store the JWT
export const verifyEmail = (token) => api.get(`/auth/verify-email/${token}`);

// Lexik JWT expects "username" key (mapped to email by the security provider)
export const login = (data) => api.post('/auth/login_check', {
  username: data.username,
  password: data.password,
});

export const logout = () => api.post('/auth/logout');

export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });

// FIXED: path param + body only contains {password} — POST /api/auth/reset-password/{token}
export const resetPassword = (token, password) =>
  api.post(`/auth/reset-password/${token}`, { password });

// ─── Cart & Order Service ─────────────────────────────────────────────────────

// GET /api/order/my-order — works for guest (session) and authenticated users (DB)
export const getMyCart = () => api.get('/order/my-order');

// POST /api/order/add-item — { productId, quantity } — guest and authenticated
export const addItemToCart = (productId, quantity = 1) =>
  api.post('/order/add-item', { productId, quantity });

// PATCH /api/order/update-items — { items: [{ itemId, quantity }] } — ROLE_USER required
export const updateCartItems = (items) =>
  api.patch('/order/update-items', { items });

// DELETE /api/order/remove-item/{itemId} — ROLE_USER required
export const removeCartItem = (itemId) =>
  api.delete(`/order/remove-item/${itemId}`);

// POST /api/order/checkout — returns { message, orderId, url } — ROLE_USER required
export const checkoutCart = () => api.post('/order/checkout');

// GET /api/order/success?session_id=... — Stripe success callback
export const getOrderSuccess = (sessionId) =>
  api.get('/order/success', { params: { session_id: sessionId } });

// ─── Invoice Service ──────────────────────────────────────────────────────────

// GET /api/invoice/{orderId} — returns PDF blob — ROLE_USER required, order status must be 'Payé'
export const getInvoicePdf = (orderId) =>
  api.get(`/invoice/${orderId}`, { responseType: 'blob' });

// ─── Messaging Service ────────────────────────────────────────────────────────

export const sendMessage = (data) => api.post('/contact', data);

export default api;
