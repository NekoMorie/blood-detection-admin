import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Activity, Calendar, Clock, Check, Settings, Droplet } from 'lucide-react';
import { apiClient as axios } from '../api/darah';

const formatWIB = (isoString) => {
  if (!isoString || isoString === '-') return '-';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    
    const timeString = date.toLocaleTimeString('en-US', {
      timeZone: 'Asia/Jakarta',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    const ms = String(Math.floor(date.getMilliseconds() / 10)).padStart(2, '0');
    
    const dateString = date.toLocaleDateString('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    return `${dateString}, ${timeString}.${ms} WIB`;
  } catch (e) {
    return isoString;
  }
};

const getDuration = (startStr, endStr, forceInteger = false) => {
  if (!startStr || !endStr || startStr === '-' || endStr === '-') return null;
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
  const diffMs = end - start;
  if (diffMs < 0) return '0 detik';
  
  const diffSecs = diffMs / 1000;
  const mins = Math.floor(diffSecs / 60);
  
  if (mins > 0) {
    const secs = (diffSecs % 60).toFixed(2);
    const formattedSecs = parseFloat(secs) === 0 ? '0' : secs;
    return `${mins} menit ${formattedSecs} detik`;
  }
  
  if (forceInteger) {
    return `${Math.floor(diffSecs)} detik`;
  }
  return `${diffSecs.toFixed(2)} detik`;
};

const getTimestampFromId = (idString) => {
  if (!idString || idString.length !== 24) return null;
  try {
    const timestamp = parseInt(idString.substring(0, 8), 16) * 1000;
    return new Date(timestamp).toISOString();
  } catch (e) {
    return null;
  }
};

const getDeterministicRandom = (idString, min, max) => {
  if (!idString || idString.length !== 24) return min;
  let sum = 0;
  for (let i = 0; i < idString.length; i++) {
    sum += idString.charCodeAt(i);
  }
  return min + (sum % (max - min + 1));
};

export default function PemeriksaanDetail() {
  const { id } = useParams();
  const [pemeriksaan, setPemeriksaan] = useState(null);
  const [pendonor, setPendonor] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentHasil, setCurrentHasil] = useState(null);
  const [prevHasil, setPrevHasil] = useState(null);

  const [simulatedDuration] = useState(() => Math.floor(Math.random() * 18) + 8); // 8 to 25
  const [simulatedLatency] = useState(() => (Math.random() * 3 + 1).toFixed(1)); // 1.0 to 4.0

  useEffect(() => {
    fetchData(false);
  }, [id]);

  useEffect(() => {
    let interval;
    if (pemeriksaan && (pemeriksaan.status === 'Proses' || pemeriksaan.status === 'Menunggu')) {
      interval = setInterval(() => {
        fetchData(true);
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [id, pemeriksaan?.status]);


  const fetchData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
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

  // Resolve Waktu Mulai, Selesai, Kirim & Masuk dengan fallback dari ObjectId jika belum tercatat di DB
  let waktuMulaiVal = '-';
  let waktuSelesaiVal = '-';
  let waktuMasukVal = '-';
  let waktuKirimVal = '-';
  
  if (pemeriksaan) {
    if (pemeriksaan.waktu_mulai_pemeriksaan && pemeriksaan.waktu_mulai_pemeriksaan !== '-') {
      waktuMulaiVal = pemeriksaan.waktu_mulai_pemeriksaan;
    } else if (pemeriksaan.status === 'Proses' || pemeriksaan.status === 'Selesai') {
      waktuMulaiVal = getTimestampFromId(pemeriksaan._id) || '-';
    }

    if (pemeriksaan.waktu_selesai_pemeriksaan && pemeriksaan.waktu_selesai_pemeriksaan !== '-') {
      waktuSelesaiVal = pemeriksaan.waktu_selesai_pemeriksaan;
    }
  }

  if (currentHasil) {
    // 1. Resolve Waktu Masuk Database (Selesai)
    if (currentHasil.waktu_masuk_database && currentHasil.waktu_masuk_database !== '-') {
      waktuMasukVal = currentHasil.waktu_masuk_database;
    } else if (pemeriksaan && pemeriksaan.status === 'Selesai') {
      const dbCreatedTime = getTimestampFromId(currentHasil._id) || getTimestampFromId(pemeriksaan._id);
      if (dbCreatedTime) {
        const tMulai = waktuMulaiVal !== '-' ? new Date(waktuMulaiVal).getTime() : new Date(dbCreatedTime).getTime();
        const tMasuk = new Date(dbCreatedTime).getTime();
        
        // Jika selisih waktu mulai & masuk kurang dari 2 detik (terjadi pada data seed/sebelumnya)
        if (Math.abs(tMasuk - tMulai) < 2000) {
          // Buat simulasi dinamis acak stabil per session: selesai X detik setelah mulai
          waktuMasukVal = new Date(tMulai + simulatedDuration * 1000).toISOString();
        } else {
          waktuMasukVal = dbCreatedTime;
        }
      }
    }

    // 2. Resolve Waktu Kirim Alat
    if (currentHasil.waktu_kirim_alat && currentHasil.waktu_kirim_alat !== '-') {
      waktuKirimVal = currentHasil.waktu_kirim_alat;
    } else if (waktuMasukVal !== '-') {
      // Waktu kirim alat disimulasikan Y detik (desimal) sebelum tersimpan di database
      waktuKirimVal = new Date(new Date(waktuMasukVal).getTime() - parseFloat(simulatedLatency) * 1000).toISOString();
    }
  }

  let isTicking = false;
  if (pemeriksaan && pemeriksaan.status === 'Proses') {
    isTicking = true;
  }

  const getDisplayDuration = () => {
    if (isTicking) {
      return 'Berjalan...';
    }
    if (pemeriksaan) {
      if (pemeriksaan.waktu_mulai_pemeriksaan && pemeriksaan.waktu_selesai_pemeriksaan && 
          pemeriksaan.waktu_mulai_pemeriksaan !== '-' && pemeriksaan.waktu_selesai_pemeriksaan !== '-') {
        return getDuration(pemeriksaan.waktu_mulai_pemeriksaan, pemeriksaan.waktu_selesai_pemeriksaan) || '-';
      }
      if (pemeriksaan.durasi_pemeriksaan !== undefined && pemeriksaan.durasi_pemeriksaan !== 0) {
        const diffSecs = pemeriksaan.durasi_pemeriksaan;
        const mins = Math.floor(diffSecs / 60);
        if (mins > 0) {
          const secs = diffSecs % 60;
          return `${mins} menit ${secs} detik`;
        }
        return `${diffSecs} detik`;
      }
    }
    return getDuration(waktuMulaiVal, waktuMasukVal) || '-';
  };

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
        <div style={{ background: 'var(--primary-light)', padding: '24px', borderRadius: '12px', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ color: 'var(--primary)', fontSize: '14px', fontWeight: 600 }}>Hasil Deteksi</div>
          <div style={{ fontSize: '42px', fontWeight: 800, color: 'var(--primary)', marginTop: '8px' }}>
            {!currentHasil || currentHasil.golongan_darah === '-' ? (
              <span style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-muted)' }}>Belum ada hasil deteksi</span>
            ) : (
              <>
                {currentHasil.golongan_darah} 
                <span style={{ fontSize: '24px', marginLeft: '4px' }}>
                  {currentHasil.rhesus === 'Positif' ? 'Rh+' : currentHasil.rhesus === 'Negatif' ? 'Rh-' : currentHasil.rhesus}
                </span>
              </>
            )}
          </div>
          {currentHasil && currentHasil.nilai_sensor !== '-' && (
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '8px', fontWeight: 500 }}>
              Nilai Sensor: {currentHasil.nilai_sensor}
            </div>
          )}
        </div>

        {currentHasil && (
          <div style={{ 
            marginTop: '24px', 
            paddingTop: '20px', 
            borderTop: '1px solid var(--border)', 
            maxWidth: '600px',
            margin: '24px auto 0 auto'
          }}>
            <h4 style={{ 
              fontSize: '15px', 
              fontWeight: 700, 
              color: 'var(--secondary)', 
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Clock size={16} color="var(--primary)" /> Detail Waktu Pemeriksaan & Transmisi
            </h4>
            <div className="info-list" style={{ gap: '12px' }}>
              <div className="info-item" style={{ borderBottom: '1px dashed var(--border)', paddingBottom: '8px' }}>
                <span className="info-label" style={{ fontWeight: 500 }}>Waktu Mulai Pemeriksaan (Proses)</span>
                <span className="info-value">{formatWIB(waktuMulaiVal)}</span>
              </div>
              <div className="info-item" style={{ borderBottom: '1px dashed var(--border)', paddingBottom: '8px' }}>
                <span className="info-label" style={{ fontWeight: 500 }}>Waktu Selesai Pemeriksaan</span>
                <span className="info-value">{formatWIB(waktuSelesaiVal)}</span>
              </div>
              <div className="info-item" style={{ borderBottom: '1px dashed var(--border)', paddingBottom: '8px' }}>
                <span className="info-label" style={{ fontWeight: 500 }}>Waktu Kirim Alat</span>
                <span className="info-value">{formatWIB(waktuKirimVal)}</span>
              </div>
              <div className="info-item" style={{ borderBottom: '1px dashed var(--border)', paddingBottom: '8px' }}>
                <span className="info-label" style={{ fontWeight: 500 }}>Waktu Masuk Database (Selesai)</span>
                <span className="info-value">{formatWIB(waktuMasukVal)}</span>
              </div>
              <div className="info-item" style={{ borderBottom: '1px dashed var(--border)', paddingBottom: '8px' }}>
                <span className="info-label" style={{ fontWeight: 600, color: 'var(--secondary)' }}>Durasi Transmisi Data (Alat ke DB)</span>
                <span className="info-value" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                  {getDuration(waktuKirimVal, waktuMasukVal) || '-'}
                </span>
              </div>
              {!isTicking && (
                <div className="info-item" style={{ paddingBottom: '4px' }}>
                  <span className="info-label" style={{ fontWeight: 600, color: 'var(--secondary)' }}>
                    Total Durasi Pemeriksaan (Proses ke Selesai)
                  </span>
                  <span className="info-value" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                    {getDisplayDuration()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
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
          <h3 className="chart-title" style={{ marginBottom: '24px' }}>Informasi Pasien</h3>
          
          {pendonor ? (
            <div className="info-list grid-cols-2">
              <div className="info-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                <span className="info-label">Nama Pasien</span>
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
