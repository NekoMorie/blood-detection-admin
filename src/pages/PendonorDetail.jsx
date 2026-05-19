import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Droplet, Calendar, Activity } from 'lucide-react';
import axios from 'axios';

export default function PendonorDetail() {
  const { id } = useParams();
  const [donorData, setDonorData] = useState(null);
  const [alats, setAlats] = useState([]);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_API || 'http://localhost:5000'}/pendonor/${id}/detail`);
        setDonorData(res.data);
      } catch (err) {
        console.error('Error fetching detail:', err);
      }
    };
    const fetchAlats = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_API || 'http://localhost:5000'}/alat`);
        setAlats(res.data);
      } catch (err) {
        console.error('Error fetching alats:', err);
      }
    };
    fetchDetail();
    fetchAlats();
  }, [id]);

  const getAlatNama = (alatId) => {
    const alat = alats.find(a => a._id === alatId);
    return alat ? alat.nama_alat : alatId;
  };

  if (!donorData) return <div style={{ padding: '24px' }}>Loading...</div>;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Link to="/pendonor" className="btn btn-secondary" style={{ display: 'inline-flex' }}>
          <ArrowLeft size={18} /> Kembali
        </Link>
      </div>

      <div className="detail-grid">
        <div className="detail-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {(donorData.nama_pendonor || 'U').substring(0, 2).toUpperCase()}
            </div>
            <h2 className="profile-name">{donorData.nama_pendonor}</h2>
            <div className="badge badge-success">
              <CheckCircle size={14} /> {donorData.status_verifikasi}
            </div>
          </div>
          
          <div className="info-list">
            <div className="info-item">
              <span className="info-label">ID Pasien</span>
              <span className="info-value">{donorData.id_pendonor}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Jenis Kelamin</span>
              <span className="info-value">{donorData.jenis_kelamin}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Tanggal Lahir</span>
              <span className="info-value">{donorData.tanggal_lahir || '-'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">No. Telepon</span>
              <span className="info-value">{donorData.no_telepon}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email</span>
              <span className="info-value">{donorData.email}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="detail-card">
            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Droplet color="var(--primary)" /> Hasil Deteksi Darah
            </h3>
            <div className="grid-cols-2">
              <div style={{ background: 'var(--primary-light)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ color: 'var(--primary)', fontSize: '14px', fontWeight: 600 }}>Golongan Darah</div>
                <div style={{ fontSize: '48px', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>
                  {(() => {
                    const result = donorData.hasil || {};
                    if (!result.golongan_darah) return '-';
                    const rh = result.rhesus === 'Positif' ? 'Rh+' : result.rhesus === 'Negatif' ? 'Rh-' : '';
                    return rh ? `${result.golongan_darah} (${rh})` : result.golongan_darah;
                  })()}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
                <div className="info-item">
                  <span className="info-label">Total Donor</span>
                  <span className="info-value badge badge-primary">{donorData.jumlahDonor || 0} Kali</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Alat Deteksi</span>
                  <span className="info-value">{getAlatNama(donorData.hasil?.id_alat) || '-'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Nilai Sensor</span>
                  <span className="info-value">{donorData.hasil?.nilai_sensor || '-'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="detail-card">
            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity color="var(--secondary)" /> Riwayat Donor
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {(donorData.riwayat || []).map((r, index) => (
                <div key={index} style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '16px', background: 'var(--background)', borderRadius: '12px' }}>
                  <div style={{ background: 'var(--surface)', padding: '12px', borderRadius: '50%', color: 'var(--primary)' }}>
                    <Calendar size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontWeight: 600, color: 'var(--secondary)' }}>{r.keterangan || 'Donor'}</h4>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{r.tanggal_donor} (ID: {r.id_riwayat})</span>
                  </div>
                  <div className="badge badge-success">Selesai</div>
                </div>
              ))}
              {donorData.riwayat?.length === 0 && (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>Belum ada riwayat</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
