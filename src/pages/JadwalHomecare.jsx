import { useState, useEffect } from 'react';
import { CheckCircle, Clock, X, AlertTriangle, Search, Filter, Phone, MapPin, MessageSquare, ShieldCheck, ShieldAlert, Eye, Check, Ban } from 'lucide-react';
import Pagination from '../components/Pagination';
import { apiClient as axios } from '../api/darah';
import Select from 'react-select';

export default function JadwalHomecare() {
  const [data, setData] = useState([]);
  const [alats, setAlats] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Semua');

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, item: null, nama_alat: '' });
  const [rejectModal, setRejectModal] = useState({ isOpen: false, item: null, alasan_penolakan: '' });
  const [detailModal, setDetailModal] = useState({ isOpen: false, item: null });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_API || 'http://localhost:5000'}/jadwal-homecare`);
      setData(res.data);

      const alatRes = await axios.get(`${import.meta.env.VITE_BACKEND_API || 'http://localhost:5000'}/alat`);
      setAlats(alatRes.data);
    } catch (err) {
      console.error('Error fetching homecare data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and search
  const filteredData = data.filter(item => {
    const matchesSearch = 
      (item.nama_pendonor || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (item.alamat_homecare || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.id_pendonor?.id_user || '').toLowerCase().includes(searchTerm.toLowerCase());
      
    if (activeTab === 'Semua') return matchesSearch;
    return matchesSearch && item.status === activeTab;
  });

  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleOpenConfirm = (item) => {
    setConfirmModal({ isOpen: true, item, nama_alat: alats[0]?.nama_alat || '' });
  };

  const handleCloseConfirm = () => {
    setConfirmModal({ isOpen: false, item: null, nama_alat: '' });
  };

  const handleConfirmSubmit = async (e) => {
    e.preventDefault();
    if (!confirmModal.item || !confirmModal.nama_alat) return;

    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_API || 'http://localhost:5000'}/jadwal-homecare/${confirmModal.item._id}/konfirmasi`, {
        status: 'Menunggu',
        nama_alat: confirmModal.nama_alat
      });
      fetchData();
      handleCloseConfirm();
    } catch (err) {
      console.error('Error confirming homecare:', err);
      alert('Gagal mengkonfirmasi jadwal homecare.');
    }
  };

  const handleOpenReject = (item) => {
    setRejectModal({ isOpen: true, item, alasan_penolakan: '' });
  };

  const handleCloseReject = () => {
    setRejectModal({ isOpen: false, item: null, alasan_penolakan: '' });
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectModal.item) return;

    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_API || 'http://localhost:5000'}/jadwal-homecare/${rejectModal.item._id}/konfirmasi`, {
        status: 'Ditolak',
        alasan_penolakan: rejectModal.alasan_penolakan
      });
      fetchData();
      handleCloseReject();
    } catch (err) {
      console.error('Error rejecting homecare:', err);
      alert('Gagal menolak jadwal homecare.');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Menunggu Konfirmasi':
        return 'badge-warning';
      case 'Menunggu':
        return 'badge-success';
      case 'Ditolak':
        return 'badge-danger';
      case 'Proses':
        return 'badge-primary';
      case 'Selesai':
        return 'badge-success';
      default:
        return 'badge-secondary';
    }
  };

  const tabs = ['Semua', 'Menunggu Konfirmasi', 'Menunggu', 'Ditolak', 'Proses', 'Selesai'];

  const alatOptions = alats.map(a => ({
    value: a.nama_alat,
    label: a.nama_alat
  }));

  return (
    <div>
      <div className="table-container">
        <div style={{ padding: '20px 24px 0' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: 'var(--text-dark)' }}>
            Daftar Jadwal Homecare Pendonor
          </h2>
          <p style={{ margin: '4px 0 16px', fontSize: '14px', color: 'var(--text-muted)' }}>
            Kelola dan konfirmasi jadwal pemeriksaan golongan darah secara homecare yang diajukan oleh pendonor.
          </p>
        </div>

        {/* Tab Filters */}
        <div style={{ 
          display: 'flex', 
          borderBottom: '1px solid #e5e7eb', 
          padding: '0 24px', 
          gap: '16px',
          overflowX: 'auto',
          scrollbarWidth: 'none'
        }}>
          {tabs.map((tab) => {
            const count = data.filter(d => tab === 'Semua' || d.status === tab).length;
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setCurrentPage(1);
                }}
                style={{
                  padding: '12px 8px',
                  fontWeight: 600,
                  fontSize: '14px',
                  border: 'none',
                  background: 'none',
                  borderBottom: activeTab === tab ? '2px solid #ef4444' : '2px solid transparent',
                  color: activeTab === tab ? '#ef4444' : '#6b7280',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
              >
                {tab}
                <span style={{
                  fontSize: '11px',
                  background: activeTab === tab ? '#fee2e2' : '#f3f4f6',
                  color: activeTab === tab ? '#ef4444' : '#6b7280',
                  borderRadius: '9999px',
                  padding: '2px 6px',
                  fontWeight: 'bold'
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="table-header-row" style={{ marginTop: '15px' }}>
          <div className="search-box" style={{ width: '400px' }}>
            <input 
              type="text" 
              placeholder="Cari berdasarkan nama pasien, ID, atau alamat..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Pendonor</th>
              <th>Alamat & Kontak</th>
              <th>Tanggal Rencana</th>
              <th>Alat / Catatan</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                  <Clock className="animate-spin" size={24} style={{ margin: '0 auto 8px', display: 'block', color: 'var(--text-muted)' }} />
                  Memuat data jadwal homecare...
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  Tidak ada jadwal homecare yang cocok.
                </td>
              </tr>
            ) : paginatedData.map((row) => (
              <tr key={row._id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{row.nama_pendonor}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {row.id_pendonor?.id_user || '-'}
                  </div>
                </td>
                <td>
                  <div style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={14} color="#6b7280" />
                    <span style={{ 
                      maxWidth: '220px', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap' 
                    }} title={row.alamat_homecare}>
                      {row.alamat_homecare}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <Phone size={12} />
                    {row.id_pendonor?.no_telepon || '-'}
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: 500 }}>{row.tanggal_pemeriksaan}</div>
                </td>
                <td>
                  <div style={{ fontSize: '13px' }}>
                    <strong>Alat:</strong> {row.nama_alat || '-'}
                  </div>
                  {row.catatan_homecare && (
                    <div style={{ 
                      fontSize: '12px', 
                      color: 'var(--text-muted)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '4px',
                      marginTop: '2px' 
                    }}>
                      <MessageSquare size={12} />
                      <span style={{ 
                        maxWidth: '200px', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'nowrap' 
                      }} title={row.catatan_homecare}>
                        {row.catatan_homecare}
                      </span>
                    </div>
                  )}
                  {row.alasan_penolakan && (
                    <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '2px' }}>
                      <strong>Ditolak:</strong> {row.alasan_penolakan}
                    </div>
                  )}
                </td>
                <td>
                  <span className={`badge ${getStatusBadgeClass(row.status)}`}>
                    {row.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn-icon" 
                      title="Lihat Detail" 
                      onClick={() => setDetailModal({ isOpen: true, item: row })}
                    >
                      <Eye size={18} />
                    </button>
                    {row.status === 'Menunggu Konfirmasi' && (
                      <>
                        <button 
                          className="btn-icon" 
                          style={{ color: '#22c55e' }} 
                          title="Setujui & Konfirmasi" 
                          onClick={() => handleOpenConfirm(row)}
                        >
                          <Check size={18} />
                        </button>
                        <button 
                          className="btn-icon" 
                          style={{ color: '#ef4444' }} 
                          title="Tolak Pengajuan" 
                          onClick={() => handleOpenReject(row)}
                        >
                          <Ban size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination 
          currentPage={currentPage} 
          totalItems={filteredData.length} 
          itemsPerPage={itemsPerPage} 
          onPageChange={setCurrentPage} 
          onItemsPerPageChange={setItemsPerPage} 
        />
      </div>

      {/* MODAL DETAIL */}
      {detailModal.isOpen && detailModal.item && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Detail Pengajuan Homecare</h3>
              <button className="btn-icon" onClick={() => setDetailModal({ isOpen: false, item: null })}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Pasien / Pendonor</label>
                  <div style={{ fontWeight: 600, fontSize: '15px' }}>{detailModal.item.nama_pendonor}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>ID: {detailModal.item.id_pendonor?.id_user || '-'}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>No. Telepon</label>
                    <div style={{ fontSize: '14px' }}>{detailModal.item.id_pendonor?.no_telepon || '-'}</div>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Email</label>
                    <div style={{ fontSize: '14px' }}>{detailModal.item.id_pendonor?.email || '-'}</div>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Alamat Homecare</label>
                  <div style={{ fontSize: '14px', background: '#f9fafb', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                    {detailModal.item.alamat_homecare}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Tanggal Rencana</label>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>{detailModal.item.tanggal_pemeriksaan}</div>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Status Pengajuan</label>
                    <div>
                      <span className={`badge ${getStatusBadgeClass(detailModal.item.status)}`} style={{ margin: 0 }}>
                        {detailModal.item.status}
                      </span>
                    </div>
                  </div>
                </div>

                {detailModal.item.catatan_homecare && (
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Catatan Pasien</label>
                    <div style={{ fontSize: '13px', background: '#f9fafb', padding: '8px 12px', borderRadius: '6px', fontStyle: 'italic' }}>
                      "{detailModal.item.catatan_homecare}"
                    </div>
                  </div>
                )}

                {detailModal.item.nama_alat && detailModal.item.nama_alat !== '-' && (
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Alat Yang Ditugaskan</label>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>{detailModal.item.nama_alat}</div>
                  </div>
                )}

                {detailModal.item.alasan_penolakan && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', padding: '12px', borderRadius: '6px' }}>
                    <label style={{ fontSize: '12px', color: '#ef4444', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertTriangle size={14} /> Alasan Penolakan
                    </label>
                    <div style={{ fontSize: '13px', color: '#b91c1c', marginTop: '4px' }}>
                      {detailModal.item.alasan_penolakan}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDetailModal({ isOpen: false, item: null })}>Tutup</button>
              {detailModal.item.status === 'Menunggu Konfirmasi' && (
                <>
                  <button 
                    className="btn btn-danger" 
                    style={{ backgroundColor: '#ef4444', borderColor: '#ef4444', color: 'white' }}
                    onClick={() => {
                      const item = detailModal.item;
                      setDetailModal({ isOpen: false, item: null });
                      handleOpenReject(item);
                    }}
                  >
                    Tolak
                  </button>
                  <button 
                    className="btn btn-success" 
                    style={{ backgroundColor: '#22c55e', borderColor: '#22c55e', color: 'white' }}
                    onClick={() => {
                      const item = detailModal.item;
                      setDetailModal({ isOpen: false, item: null });
                      handleOpenConfirm(item);
                    }}
                  >
                    Konfirmasi
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI (ASSIGN HARDWARE ALAT) */}
      {confirmModal.isOpen && confirmModal.item && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={22} color="#22c55e" /> Setujui Jadwal Homecare
              </h3>
              <button className="btn-icon" onClick={handleCloseConfirm}><X size={20} /></button>
            </div>
            <form onSubmit={handleConfirmSubmit}>
              <div className="modal-body">
                <p style={{ margin: '0 0 16px', fontSize: '14px', color: 'var(--text)' }}>
                  Setujui pengajuan homecare untuk <strong>{confirmModal.item.nama_pendonor}</strong> pada tanggal <strong>{confirmModal.item.tanggal_pemeriksaan}</strong>.
                </p>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Tugaskan Alat Deteksi</label>
                  {alats.length === 0 ? (
                    <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '4px' }}>
                      Tidak ada alat deteksi yang tersedia di sistem. Tambahkan alat deteksi terlebih dahulu.
                    </div>
                  ) : (
                    <Select 
                      options={alatOptions}
                      value={alatOptions.find(o => o.value === confirmModal.nama_alat) || null}
                      onChange={(selected) => setConfirmModal({...confirmModal, nama_alat: selected ? selected.value : ''})}
                      placeholder="Pilih Alat Deteksi untuk Homecare..."
                      required
                    />
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseConfirm}>Batal</button>
                <button 
                  type="submit" 
                  className="btn btn-success"
                  style={{ backgroundColor: '#22c55e', borderColor: '#22c55e', color: 'white' }}
                  disabled={alats.length === 0}
                >
                  Setujui & Tugaskan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PENOLAKAN */}
      {rejectModal.isOpen && rejectModal.item && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={22} color="#ef4444" /> Tolak Jadwal Homecare
              </h3>
              <button className="btn-icon" onClick={handleCloseReject}><X size={20} /></button>
            </div>
            <form onSubmit={handleRejectSubmit}>
              <div className="modal-body">
                <p style={{ margin: '0 0 16px', fontSize: '14px', color: 'var(--text)' }}>
                  Apakah Anda yakin ingin menolak pengajuan homecare untuk <strong>{rejectModal.item.nama_pendonor}</strong>?
                </p>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Alasan Penolakan (Wajib)</label>
                  <textarea
                    className="form-control"
                    style={{
                      width: '100%',
                      minHeight: '80px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb',
                      fontSize: '14px',
                      outline: 'none',
                      fontFamily: 'inherit'
                    }}
                    placeholder="Masukkan alasan penolakan agar pendonor dapat melakukan penyesuaian..."
                    value={rejectModal.alasan_penolakan}
                    onChange={(e) => setRejectModal({...rejectModal, alasan_penolakan: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseReject}>Batal</button>
                <button 
                  type="submit" 
                  className="btn btn-danger"
                  style={{ backgroundColor: '#ef4444', borderColor: '#ef4444', color: 'white' }}
                >
                  Tolak Pengajuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
