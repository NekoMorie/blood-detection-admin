import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Droplet, Calendar, Activity } from 'lucide-react';

export default function PendonorDetail() {
  const { id } = useParams();

  // Simulated data based on requirements
  const donorData = {
    id: id,
    nama: 'Budi Santoso',
    jk: 'Laki-laki',
    tanggalLahir: '15 Agustus 1990',
    alamat: 'Jl. Merdeka No. 45, Jakarta',
    telepon: '081234567890',
    email: 'budi@gmail.com',
    statusVerifikasi: 'Terverifikasi (Admin Utama)',
    jumlahDonor: 3,
    golonganDarah: 'O',
    rhesus: '+',
    alatDeteksi: 'Smart Blood Scanner V2',
    nilaiSensor: '98.5%',
    riwayat: [
      { id: 'R001', tanggal: '10 Jan 2026', keterangan: 'Donor Darah Rutin' },
      { id: 'R002', tanggal: '05 Mei 2025', keterangan: 'Donor Darah Sukarela' },
      { id: 'R003', tanggal: '12 Nov 2024', keterangan: 'Pengganti Keluarga' },
    ]
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Link to="/pendonor" className="btn btn-secondary" style={{ display: 'inline-flex' }}>
          <ArrowLeft size={18} /> Kembali
        </Link>
      </div>

      <div className="detail-grid">
        {/* Kolom Kiri: Profil Singkat */}
        <div className="detail-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {donorData.nama.substring(0, 2).toUpperCase()}
            </div>
            <h2 className="profile-name">{donorData.nama}</h2>
            <div className="badge badge-success">
              <CheckCircle size={14} /> {donorData.statusVerifikasi}
            </div>
          </div>
          
          <div className="info-list">
            <div className="info-item">
              <span className="info-label">ID Pendonor</span>
              <span className="info-value">{donorData.id}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Jenis Kelamin</span>
              <span className="info-value">{donorData.jk}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Tanggal Lahir</span>
              <span className="info-value">{donorData.tanggalLahir}</span>
            </div>
            <div className="info-item">
              <span className="info-label">No. Telepon</span>
              <span className="info-value">{donorData.telepon}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email</span>
              <span className="info-value">{donorData.email}</span>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Hasil & Riwayat */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="detail-card">
            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Droplet color="var(--primary)" /> Hasil Deteksi Darah
            </h3>
            <div className="grid-cols-2">
              <div style={{ background: 'var(--primary-light)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ color: 'var(--primary)', fontSize: '14px', fontWeight: 600 }}>Golongan Darah</div>
                <div style={{ fontSize: '48px', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>
                  {donorData.golonganDarah} <span style={{ fontSize: '24px' }}>{donorData.rhesus}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
                <div className="info-item">
                  <span className="info-label">Total Donor</span>
                  <span className="info-value badge badge-primary">{donorData.jumlahDonor} Kali</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Alat Deteksi</span>
                  <span className="info-value">{donorData.alatDeteksi}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Nilai Sensor</span>
                  <span className="info-value">{donorData.nilaiSensor}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="detail-card">
            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity color="var(--secondary)" /> Riwayat Donor
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {donorData.riwayat.map((r, index) => (
                <div key={index} style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '16px', background: 'var(--background)', borderRadius: '12px' }}>
                  <div style={{ background: 'var(--surface)', padding: '12px', borderRadius: '50%', color: 'var(--primary)' }}>
                    <Calendar size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontWeight: 600, color: 'var(--secondary)' }}>{r.keterangan}</h4>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{r.tanggal} (ID: {r.id})</span>
                  </div>
                  <div className="badge badge-success">Selesai</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
