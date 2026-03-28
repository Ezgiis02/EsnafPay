import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Fiziksel cihazda test ediyorsan localhost yerine bilgisayarının IP adresini yaz
// Örnek: 'http://192.168.1.100:5000/api'
// iOS Simulator: 'http://localhost:5000/api'
const API_URL = 'http://localhost:5000/api';

const client = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Her istekte token otomatik eklenir
client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  register: (data) => client.post('/auth/register', data),
  login: (data) => client.post('/auth/login', data),
};

export const customerApi = {
  getAll: () => client.get('/customers'),
  create: (data) => client.post('/customers', data),
  getById: (id) => client.get(`/customers/${id}`),
  update: (id, data) => client.put(`/customers/${id}`, data),
  delete: (id) => client.delete(`/customers/${id}`),
};

export default client;
