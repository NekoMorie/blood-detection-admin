import axios from 'axios';

const API_URL = 'http://localhost:5000';

// Membuat instance axios sebagai middleware khusus
export const apiClient = axios.create({
  baseURL: API_URL
});

// Middleware interceptor untuk memastikan pengguna sudah login
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (!token) {
    // Membatalkan request jika tidak ada token (belum login)
    return Promise.reject(new Error('Akses ditolak. Silakan login terlebih dahulu.'));
  }
  // Menambahkan token ke header Authorization
  config.headers.Authorization = `Bearer ${token}`;
  return config;
}, error => {
  return Promise.reject(error);
});

// Middleware / Service API untuk Hasil Deteksi Darah
export const darahMiddleware = {
  // Ambil semua data hasil deteksi darah
  getAllHasil: async () => {
    try {
      const response = await apiClient.get('/hasil');
      return response.data;
    } catch (error) {
      console.error('Error fetching hasil darah:', error.message || error);
      throw error;
    }
  },

  // Ambil hasil deteksi berdasarkan ID
  getHasilById: async (id) => {
    try {
      const response = await apiClient.get(`/hasil/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching hasil darah with id ${id}:`, error.message || error);
      throw error;
    }
  },

  // Buat data hasil deteksi baru
  createHasil: async (data) => {
    try {
      const response = await apiClient.post('/hasil', data);
      return response.data;
    } catch (error) {
      console.error('Error creating hasil darah:', error.message || error);
      throw error;
    }
  },

  // Update data hasil deteksi
  updateHasil: async (id, data) => {
    try {
      const response = await apiClient.put(`/hasil/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating hasil darah with id ${id}:`, error.message || error);
      throw error;
    }
  },

  // Hapus data hasil deteksi
  deleteHasil: async (id) => {
    try {
      const response = await apiClient.delete(`/hasil/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting hasil darah with id ${id}:`, error.message || error);
      throw error;
    }
  }
};
