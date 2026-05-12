import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Bilgisayarda (web) test için: 'http://localhost:5000/api'
// Telefonda test için: bilgisayarının IP'si (ipconfig ile öğren)
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

export const debtApi = {
  getByCustomer: (customerId) => client.get(`/debts/customer/${customerId}`),
  create: (data) => client.post('/debts', data),
  update: (id, data) => client.put(`/debts/${id}`, data),
  delete: (id) => client.delete(`/debts/${id}`),
};

export const installmentApi = {
  getByDebt: (debtId) => client.get(`/installments/debt/${debtId}`),
  pay: (id) => client.put(`/installments/${id}/pay`),
  unpay: (id) => client.put(`/installments/${id}/unpay`),
};

export const musteriApi = {
  getMyProfile: () => client.get('/customers/my-profile'),
};

export const notificationApi = {
  send: (data) => client.post('/notifications', data),
  getPending: () => client.get('/notifications/pending'),
  approve: (id) => client.put(`/notifications/${id}/approve`),
  reject: (id) => client.put(`/notifications/${id}/reject`),
};

export default client;
