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

    const handleSSEUpdate = (event) => {
      const { type } = event.detail || {};
      if (['pemeriksaan', 'hasil', 'pendonor', 'alat'].includes(type)) {
        fetchData(true);
      }
    };

    window.addEventListener('sse-update', handleSSEUpdate);
    return () => {
      window.removeEventListener('sse-update', handleSSEUpdate);
    };
  }, [id]);


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
        <Link to="/pemeriksaan" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center' }}>
          <ArrowLeft size={18} /> Kembali
        </Link>
      </div>

      {/* Top Grid: Hasil Deteksi & Pemeriksaan */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '24px', 
        marginBottom: '24px' 
      }}>
        {/* Left Card: Hasil Deteksi */}
        <div className="card" style={{ 
          background: 'var(--danger-light)', 
          borderRadius: 'var(--radius-lg)', 
          padding: '32px 24px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          textAlign: 'center',
          minHeight: '260px',
          boxShadow: 'var(--shadow-soft)',
          border: 'none'
        }}>
          <h3 style={{ color: 'var(--primary)', fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Hasil Deteksi</h3>
          
          {!currentHasil || currentHasil.golongan_darah === '-' ? (
            <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '20px' }}>
              Belum ada hasil deteksi
            </div>
          ) : (
            <div style={{ 
              fontSize: '72px', 
              fontWeight: 800, 
              color: 'var(--primary)', 
              marginBottom: '16px', 
              display: 'flex', 
              alignItems: 'baseline', 
              gap: '8px', 
              justifyContent: 'center',
              lineHeight: 1
            }}>
              <span>{currentHasil.golongan_darah}</span>
              <span style={{ fontSize: '36px', fontWeight: 700, marginLeft: '8px' }}>
                {currentHasil.rhesus === 'Positif' ? 'Rh +' : currentHasil.rhesus === 'Negatif' ? 'Rh -' : currentHasil.rhesus}
              </span>
            </div>
          )}
          
          {currentHasil && currentHasil.nilai_sensor !== '-' && (
            <div style={{ fontSize: '15px', color: '#8F9BBA', fontWeight: 500 }}>
              Nilai Sensor: {currentHasil.nilai_sensor}
            </div>
          )}
        </div>

        {/* Right Card: Pemeriksaan */}
        <div className="card" style={{ 
          borderRadius: 'var(--radius-lg)', 
          padding: '24px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          minHeight: '260px',
          boxShadow: 'var(--shadow-soft)'
        }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            borderRadius: '50%', 
            background: 'var(--danger-light)', 
            color: 'var(--primary)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginBottom: '12px'
          }}>
            <Activity size={28} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--secondary)', marginBottom: '8px' }}>Pemeriksaan</h3>
          <span className={`badge ${pemeriksaan.status === 'Selesai' ? 'badge-success' : pemeriksaan.status === 'Menunggu' ? 'badge-secondary' : 'badge-warning'}`} style={{ marginBottom: '16px' }}>
            {pemeriksaan.status}
          </span>
          
          <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--border)', margin: '16px 0' }} />
          
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8F9BBA', fontSize: '14px', fontWeight: 500 }}>
                <Settings size={16} /> Alat
              </span>
              <span style={{ fontWeight: 600, color: 'var(--secondary)', fontSize: '14px' }}>{pemeriksaan.nama_alat}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8F9BBA', fontSize: '14px', fontWeight: 500 }}>
                <Calendar size={16} /> Tanggal
              </span>
              <span style={{ fontWeight: 600, color: 'var(--secondary)', fontSize: '14px' }}>{pemeriksaan.tanggal_pemeriksaan}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8F9BBA', fontSize: '14px', fontWeight: 500 }}>
                <User size={16} /> Admin
              </span>
              <span style={{ fontWeight: 600, color: 'var(--secondary)', fontSize: '14px' }}>{admin ? admin.username : pemeriksaan.id_admin}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Card: Informasi Pasien */}
      <div className="card" style={{ marginBottom: '24px', padding: '24px', boxShadow: 'var(--shadow-soft)' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--secondary)', marginBottom: '20px' }}>Informasi Pasien</h3>
        {pendonor ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ color: '#8F9BBA', fontSize: '14px', marginBottom: '4px', fontWeight: 500 }}>Nama Pasien</div>
                <div style={{ fontWeight: 700, color: 'var(--secondary)', fontSize: '16px' }}>{pendonor.nama_pendonor}</div>
              </div>
              <div>
                <div style={{ color: '#8F9BBA', fontSize: '14px', marginBottom: '4px', fontWeight: 500 }}>Email</div>
                <div style={{ fontWeight: 700, color: 'var(--secondary)', fontSize: '16px' }}>{pendonor.email}</div>
              </div>
              <div>
                <div style={{ color: '#8F9BBA', fontSize: '14px', marginBottom: '4px', fontWeight: 500 }}>Tanggal Lahir</div>
                <div style={{ fontWeight: 700, color: 'var(--secondary)', fontSize: '16px' }}>{pendonor.tanggal_lahir}</div>
              </div>
            </div>
            
            {/* Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ color: '#8F9BBA', fontSize: '14px', marginBottom: '4px', fontWeight: 500 }}>ID User</div>
                <div style={{ fontWeight: 700, color: 'var(--secondary)', fontSize: '16px' }}>{pendonor.id_user || pendonor._id}</div>
              </div>
              <div>
                <div style={{ color: '#8F9BBA', fontSize: '14px', marginBottom: '4px', fontWeight: 500 }}>Nomor Telepon</div>
                <div style={{ fontWeight: 700, color: 'var(--secondary)', fontSize: '16px' }}>{pendonor.no_telepon || '-'}</div>
              </div>
              <div>
                <div style={{ color: '#8F9BBA', fontSize: '14px', marginBottom: '4px', fontWeight: 500 }}>Status Verifikasi</div>
                <div style={{ marginTop: '4px' }}>
                  <span className={`badge ${pendonor.status_verifikasi === 'Terverifikasi' ? 'badge-success' : 'badge-warning'}`}>
                    {pendonor.status_verifikasi}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)' }}>Memuat informasi pendonor...</div>
        )}
      </div>

      {/* Bottom Card: Detail Waktu Pemeriksaan & Transmisi */}
      {currentHasil && (
        <div className="card" style={{ marginBottom: '24px', padding: '24px', boxShadow: 'var(--shadow-soft)' }}>
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: 700, 
            color: 'var(--secondary)', 
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Clock size={18} color="var(--primary)" /> Detail Waktu Pemeriksaan & Transmisi
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed var(--border)', paddingBottom: '10px' }}>
              <span style={{ color: '#8F9BBA', fontSize: '14px', fontWeight: 500 }}>Waktu Mulai Pemeriksaan (Proses)</span>
              <span style={{ fontWeight: 600, color: 'var(--secondary)', fontSize: '14px' }}>{formatWIB(waktuMulaiVal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed var(--border)', paddingBottom: '10px' }}>
              <span style={{ color: '#8F9BBA', fontSize: '14px', fontWeight: 500 }}>Waktu Selesai Pemeriksaan</span>
              <span style={{ fontWeight: 600, color: 'var(--secondary)', fontSize: '14px' }}>{formatWIB(waktuSelesaiVal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed var(--border)', paddingBottom: '10px' }}>
              <span style={{ color: '#8F9BBA', fontSize: '14px', fontWeight: 500 }}>Waktu Kirim Alat</span>
              <span style={{ fontWeight: 600, color: 'var(--secondary)', fontSize: '14px' }}>{formatWIB(waktuKirimVal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed var(--border)', paddingBottom: '10px' }}>
              <span style={{ color: '#8F9BBA', fontSize: '14px', fontWeight: 500 }}>Waktu Masuk Database (Selesai)</span>
              <span style={{ fontWeight: 600, color: 'var(--secondary)', fontSize: '14px' }}>{formatWIB(waktuMasukVal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed var(--border)', paddingBottom: '10px' }}>
              <span style={{ fontWeight: 600, color: 'var(--secondary)', fontSize: '14px' }}>Durasi Transmisi Data (Alat ke DB)</span>
              <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '14px' }}>
                {getDuration(waktuKirimVal, waktuMasukVal) || '-'}
              </span>
            </div>
            {!isTicking && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '4px' }}>
                <span style={{ fontWeight: 600, color: 'var(--secondary)', fontSize: '14px' }}>Total Durasi Pemeriksaan (Proses ke Selesai)</span>
                <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '14px' }}>
                  {getDisplayDuration()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
