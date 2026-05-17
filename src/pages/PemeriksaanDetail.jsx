import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Activity, Calendar, Clock, Check, Settings, Droplet } from 'lucide-react';
import { apiClient as axios } from '../api/darah';

export default function PemeriksaanDetail() {
  const { id } = useParams();
  const [pemeriksaan, setPemeriksaan] = useState(null);
  const [pendonor, setPendonor] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentHasil, setCurrentHasil] = useState(null);
  const [prevHasil, setPrevHasil] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      // API call to get pemeriksaan detail
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_API || 'http://localhost:5000'}/pemeriksaan`);
      const item = res.data.find(p => p._id === id);
      
      if (item) {
        setPemeriksaan(item);
        
        // Fetch Pendonor
        try {
          const pendonorRes = await axios.get(`${import.meta.env.VITE_BACKEND_API || 'http://localhost:5000'}/pendonor/${item.id_pendonor}/detail`);
          setPendonor(pendonorRes.data);
        } catch (e) {
          console.error('Error fetching pendonor:', e);
        }

        // Fetch Admin
        try {
          const adminRes = await axios.get(`${import.meta.env.VITE_BACKEND_API || 'http://localhost:5000'}/admin`);
          const adminData = adminRes.data.find(a => a._id === item.id_admin);
          setAdmin(adminData);
        } catch (e) {
          console.error('Error fetching admin:', e);
        }

        // Fetch All Hasil to find current and previous hasil
        try {
          const hasilRes = await axios.get(`${import.meta.env.VITE_BACKEND_API || 'http://localhost:5000'}/hasil`);
          const allHasils = hasilRes.data;
          
          // Current Hasil
          const currH = allHasils.find(h => h.id_pemeriksaan === item._id);
          setCurrentHasil(currH);

          // Find previous pemeriksaan for this pendonor
          // Filter out the current one, and keep only ones for this pendonor
          const otherPemeriksaans = res.data.filter(p => p.id_pendonor === item.id_pendonor && p._id !== item._id);
          
          // Sort other pemeriksaans by _id to get the latest previous one
          otherPemeriksaans.sort((a, b) => b._id.localeCompare(a._id)); // latest first
          
          if (otherPemeriksaans.length > 0) {
            const prevPemeriksaan = otherPemeriksaans[0];
            const prevH = allHasils.find(h => h.id_pemeriksaan === prevPemeriksaan._id);
            setPrevHasil(prevH);
          }
        } catch (e) {
          console.error('Error fetching hasil:', e);
        }
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching detail:', err);
      setLoading(false);
    }
  };

  const changeStatus = async (newStatus) => {
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_API || 'http://localhost:5000'}/pemeriksaan/${id}`, {
        ...pemeriksaan,
        status: newStatus
      });
      setPemeriksaan({ ...pemeriksaan, status: newStatus });
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Gagal mengubah status');
    }
  };

  if (loading) return <div style={{ padding: '24px' }}>Loading...</div>;
  if (!pemeriksaan) return <div style={{ padding: '24px' }}>Data pemeriksaan tidak ditemukan.</div>;

  const steps = ['Menunggu', 'Proses', 'Selesai'];
  const currentStepIndex = steps.indexOf(pemeriksaan.status) !== -1 ? steps.indexOf(pemeriksaan.status) : 1; // Default to 'Proses'

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Link to="/pemeriksaan" className="btn btn-secondary" style={{ display: 'inline-flex' }}>
          <ArrowLeft size={18} /> Kembali
        </Link>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 className="chart-title" style={{ marginBottom: '16px' }}>Status Pemeriksaan</h3>
        
        <div className="stepper-container">
          {steps.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isActive = index === currentStepIndex;
            return (
              <div key={step} className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                <div className="step-circle">
                  {isCompleted ? <Check size={20} /> : (index + 1)}
                </div>
                <div className="step-label">{step}</div>
              </div>
            );
          })}
        </div>
        
        {/*
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '32px' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => changeStatus('Menunggu')}
            disabled={pemeriksaan.status === 'Menunggu'}
          >
            Set Menunggu
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => changeStatus('Proses')}
            disabled={pemeriksaan.status === 'Proses'}
          >
            Set Proses
          </button>
          <button 
            className="btn" 
            style={{ background: 'var(--success)', color: 'white' }} 
            onClick={() => changeStatus('Selesai')}
            disabled={pemeriksaan.status === 'Selesai'}
          >
            Set Selesai
          </button>
        </div>
        */}
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 className="chart-title" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Droplet color="var(--primary)" /> Hasil Deteksi Darah
        </h3>
        <div className="grid-cols-2">
          <div style={{ background: 'var(--primary-light)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ color: 'var(--primary)', fontSize: '14px', fontWeight: 600 }}>Hasil Deteksi Baru (Saat Ini)</div>
            <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--primary)', marginTop: '8px' }}>
              {!currentHasil || currentHasil.golongan_darah === '-' ? (
                <span style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-muted)' }}>Belum ada hasil deteksi</span>
              ) : (
                <>
                  {currentHasil.golongan_darah} 
                  <span style={{ fontSize: '20px', marginLeft: '4px' }}>
                    {currentHasil.rhesus === 'Positif' ? 'Rh+' : currentHasil.rhesus === 'Negatif' ? 'Rh-' : currentHasil.rhesus}
                  </span>
                </>
              )}
            </div>
            {currentHasil && currentHasil.nilai_sensor !== '-' && (
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
                Nilai Sensor: {currentHasil.nilai_sensor}
              </div>
            )}
          </div>

          <div style={{ background: '#F4F7FE', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ color: 'var(--secondary)', fontSize: '14px', fontWeight: 600 }}>Hasil Deteksi Sebelum</div>
            <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--secondary)', marginTop: '8px' }}>
              {!prevHasil || prevHasil.golongan_darah === '-' ? (
                <span style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-muted)' }}>Belum ada hasil sebelumnya</span>
              ) : (
                <>
                  {prevHasil.golongan_darah} 
                  <span style={{ fontSize: '20px', marginLeft: '4px' }}>
                    {prevHasil.rhesus === 'Positif' ? 'Rh+' : prevHasil.rhesus === 'Negatif' ? 'Rh-' : prevHasil.rhesus}
                  </span>
                </>
              )}
            </div>
            {prevHasil && prevHasil.nilai_sensor !== '-' && (
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
                Nilai Sensor: {prevHasil.nilai_sensor}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-card">
          <div className="profile-header">
            <div className="profile-avatar">
              <Activity size={48} />
            </div>
            <h3 className="profile-name">Pemeriksaan</h3>
            <span className={`badge ${pemeriksaan.status === 'Selesai' ? 'badge-success' : pemeriksaan.status === 'Menunggu' ? 'badge-secondary' : 'badge-warning'}`}>
              {pemeriksaan.status}
            </span>
          </div>
          
          <div className="info-list">
            <div className="info-item">
              <span className="info-label"><Settings size={14} style={{ display: 'inline', marginRight: '6px' }}/> Alat</span>
              <span className="info-value">{pemeriksaan.nama_alat}</span>
            </div>
            <div className="info-item">
              <span className="info-label"><Calendar size={14} style={{ display: 'inline', marginRight: '6px' }}/> Tanggal</span>
              <span className="info-value">{pemeriksaan.tanggal_pemeriksaan}</span>
            </div>
            <div className="info-item">
              <span className="info-label"><User size={14} style={{ display: 'inline', marginRight: '6px' }}/> Admin</span>
              <span className="info-value">{admin ? admin.username : pemeriksaan.id_admin}</span>
            </div>
          </div>
        </div>

        <div className="detail-card">
          <h3 className="chart-title" style={{ marginBottom: '24px' }}>Informasi Pendonor</h3>
          
          {pendonor ? (
            <div className="info-list grid-cols-2">
              <div className="info-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                <span className="info-label">Nama Pendonor</span>
                <span className="info-value" style={{ fontSize: '16px' }}>{pendonor.nama_pendonor}</span>
              </div>
              <div className="info-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                <span className="info-label">ID User</span>
                <span className="info-value">{pendonor.id_user || pendonor._id}</span>
              </div>
              <div className="info-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                <span className="info-label">Email</span>
                <span className="info-value">{pendonor.email}</span>
              </div>
              <div className="info-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                <span className="info-label">Nomor Telepon</span>
                <span className="info-value">{pendonor.no_telepon || '-'}</span>
              </div>
              <div className="info-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                <span className="info-label">Tanggal Lahir</span>
                <span className="info-value">{pendonor.tanggal_lahir}</span>
              </div>
              <div className="info-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                <span className="info-label">Status Verifikasi</span>
                <span className="info-value">
                  <span className={`badge ${pendonor.status_verifikasi === 'Terverifikasi' ? 'badge-success' : 'badge-warning'}`}>
                    {pendonor.status_verifikasi}
                  </span>
                </span>
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)' }}>Memuat informasi pendonor...</div>
          )}
        </div>
      </div>
    </div>
  );
}
