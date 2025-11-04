import axios from 'axios';
import { auth } from '../config/firebase';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Product API
export const productApi = {
  getAll: () => api.get('/public/products'),
  getById: (id: string) => api.get(`/public/products/${id}`),
};

// Order API
export const orderApi = {
  create: (orderData: any) => api.post('/public/orders', orderData),
  getById: (id: string) => api.get(`/public/orders/${id}`),
};

// Store Owner API
export const storeApi = {
  getInventory: () => api.get('/store/inventory'),
  updateStock: (productId: string, quantity: number) =>
    api.post('/store/inventory/update', { productId, quantity }),
  getOrders: (limit?: number) => api.get('/store/orders', { params: { limit } }),
};

// Admin API
export const adminApi = {
  getDistributionInventory: () => api.get('/admin/inventory/distribution'),
  getAllInventory: () => api.get('/admin/inventory/all'),
  getAllOrders: (limit?: number) => api.get('/admin/orders', { params: { limit } }),
  updateStock: (productId: string, storeId: string, quantity: number) =>
    api.post('/admin/inventory/update', { productId, quantity }, { params: { storeId } }),
};

export default api;

