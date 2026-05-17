import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Pendonor from './pages/Pendonor';
import PendonorDetail from './pages/PendonorDetail';
import Pemeriksaan from './pages/Pemeriksaan';
import Alat from './pages/Alat';
import Edukasi from './pages/Edukasi';
import EdukasiForm from './pages/EdukasiForm';
import Admin from './pages/Admin';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="pendonor" element={<Pendonor />} />
          <Route path="pendonor/:id" element={<PendonorDetail />} />
          <Route path="pemeriksaan" element={<Pemeriksaan />} />
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
