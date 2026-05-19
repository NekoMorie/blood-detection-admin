import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Pendonor from './pages/Pendonor';
import PendonorDetail from './pages/PendonorDetail';
import Pemeriksaan from './pages/Pemeriksaan';
import PemeriksaanDetail from './pages/PemeriksaanDetail';
import Alat from './pages/Alat';
import Edukasi from './pages/Edukasi';
import EdukasiForm from './pages/EdukasiForm';
import Admin from './pages/Admin';
import Login from './pages/Login';

// Axios global interceptor
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

import { Navigate } from 'react-router-dom';

const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp && payload.exp * 1000 < Date.now();
  } catch (e) {
    return true; 
  }
};

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token || isTokenExpired(token)) {
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="pendonor" element={<Pendonor />} />
          <Route path="pendonor/:id" element={<PendonorDetail />} />
          <Route path="pemeriksaan" element={<Pemeriksaan />} />
          <Route path="pemeriksaan/:id" element={<PemeriksaanDetail />} />
          <Route path="alat" element={<Alat />} />
          <Route path="edukasi" element={<Edukasi />} />
          <Route path="edukasi/tambah" element={<EdukasiForm />} />
          <Route path="edukasi/edit/:id" element={<EdukasiForm />} />
          <Route path="admin" element={<Admin />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
