import { useState, useEffect } from 'react';
import { Eye, CheckCircle, Clock, Plus, Edit, Trash2, X } from 'lucide-react';
import Pagination from '../components/Pagination';
import { Link } from 'react-router-dom';
import { apiClient as axios } from '../api/darah';
import Select from 'react-select';

const API_URL = `${import.meta.env.VITE_BACKEND_API || 'http://localhost:5000'}/pemeriksaan`;

export default function Pemeriksaan() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [goldarFilter, setGoldarFilter] = useState('Semua');
  const [rhesusFilter, setRhesusFilter] = useState('Semua');
  const [data, setData] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [pendonors, setPendonors] = useState([]);
  const [alats, setAlats] = useState([]);
  const [hasils, setHasils] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ id_pendonor: '', nama_pendonor: '', id_admin: 'admin', tanggal_pemeriksaan: '', status: 'Proses', nama_alat: '' });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchData();

    const handleSSEUpdate = (event) => {
      const { type } = event.detail || {};
      if (['pemeriksaan', 'hasil', 'pendonor', 'alat'].includes(type)) {
        fetchData();
      }
    };

    window.addEventListener('sse-update', handleSSEUpdate);
    return () => {
      window.removeEventListener('sse-update', handleSSEUpdate);
    };
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(API_URL);
      setData(res.data);

      const adminRes = await axios.get(`${import.meta.env.VITE_BACKEND_API || 'http://localhost:5000'}/admin`);
      setAdmins(adminRes.data);

      const pendonorRes = await axios.get(`${import.meta.env.VITE_BACKEND_API || 'http://localhost:5000'}/pendonor`);
      setPendonors(pendonorRes.data);

      const alatRes = await axios.get(`${import.meta.env.VITE_BACKEND_API || 'http://localhost:5000'}/alat`);
      setAlats(alatRes.data);

      const hasilRes = await axios.get(`${import.meta.env.VITE_BACKEND_API || 'http://localhost:5000'}/hasil`);
      setHasils(hasilRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const filteredData = data.filter(d => {
    // Exclude 'Menunggu Konfirmasi' and 'Ditolak'
    if (d.status === 'Menunggu Konfirmasi' || d.status === 'Ditolak') {
      return false;
    }

    const matchesSearch =
      (d.nama_alat || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.id_pendonor || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.nama_pendonor || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'Semua' || d.status === statusFilter;

    const hasil = hasils.find(h => h.id_pemeriksaan === d._id);
    const dbGoldar = hasil ? hasil.golongan_darah : '-';
    const dbRhesus = hasil ? hasil.rhesus : '-';

    const matchesGoldar = goldarFilter === 'Semua' || dbGoldar === goldarFilter;
    const matchesRhesus = rhesusFilter === 'Semua' || dbRhesus === rhesusFilter;

    return matchesSearch && matchesStatus && matchesGoldar && matchesRhesus;
  });

  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getAdminUsername = (adminId) => {
    const admin = admins.find(a => a._id === adminId);
    return admin ? admin.username : adminId;
  };

  const getPendonorIdUser = (pendonorId) => {
    const pendonor = pendonors.find(p => p._id === pendonorId);
    return pendonor ? (pendonor.id_user || pendonorId) : pendonorId;
  };

  const getGolonganDarah = (pemeriksaanId) => {
    const hasil = hasils.find(h => h.id_pemeriksaan === pemeriksaanId);
    if (!hasil || !hasil.golongan_darah || hasil.golongan_darah === '-') {
      return '-';
    }
    const rhesusSym = hasil.rhesus === 'Positif' ? 'Rh+' : hasil.rhesus === 'Negatif' ? 'Rh-' : (hasil.rhesus === '-' ? '' : hasil.rhesus);
    return rhesusSym ? `${hasil.golongan_darah} (${rhesusSym})` : hasil.golongan_darah;
  };

  const pendonorOptions = pendonors
    .filter(p => p.status_verifikasi === 'Terverifikasi')
    .map(p => ({
      value: p._id,
      label: `${p.id_user || p._id} - ${p.nama_pendonor}`,
      nama: p.nama_pendonor
    }));

  const alatOptions = alats.map(a => ({
    value: a.nama_alat,
    label: a.nama_alat
  }));

  const handleOpenModal = (row = null) => {
    if (row) {
      setEditId(row._id);
      setFormData({
        id_pendonor: row.id_pendonor,
        nama_pendonor: row.nama_pendonor,
        id_admin: row.id_admin,
        tanggal_pemeriksaan: row.tanggal_pemeriksaan,
        status: row.status,
        nama_alat: row.nama_alat
      });
    } else {
      setEditId(null);
      const adminStr = localStorage.getItem('logged_in_admin');
      const loggedInAdmin = adminStr ? JSON.parse(adminStr) : null;
      setFormData({
        id_pendonor: '',
        nama_pendonor: '',
        id_admin: loggedInAdmin ? loggedInAdmin._id : 'admin',
        tanggal_pemeriksaan: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        status: 'Menunggu',
        nama_alat: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, formData);
      } else {
        await axios.post(API_URL, formData);
      }
      fetchData();
      handleCloseModal();
    } catch (err) {
      console.error('Error saving data:', err);
      alert('Gagal menyimpan data');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await axios.delete(`${API_URL}/${deleteModal.id}`);
      fetchData();
      setDeleteModal({ isOpen: false, id: null });
    } catch (err) {
      console.error('Error deleting data:', err);
      alert('Gagal menghapus data');
    }
  };

  return (
    <div>
      <div className="table-container">
        <div className="table-header-row">
          <div style={{ display: 'flex', gap: '12px', flex: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="search-box" style={{ width: '300px' }}>
              <input
                type="text"
                placeholder="Cari berdasarkan ID User (Pasien) atau Nama Alat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '14px',
                fontWeight: 500,
                outline: 'none',
                cursor: 'pointer',
                backgroundColor: 'white',
                color: 'var(--text)',
                height: '42px',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                transition: 'border-color 0.2s'
              }}
            >
              <option value="Semua">Semua Status</option>
              <option value="Menunggu">Menunggu</option>
              <option value="Proses">Proses</option>
              <option value="Selesai">Selesai</option>
            </select>
            <select
              value={goldarFilter}
              onChange={(e) => {
                setGoldarFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '14px',
                fontWeight: 500,
                outline: 'none',
                cursor: 'pointer',
                backgroundColor: 'white',
                color: 'var(--text)',
                height: '42px',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                transition: 'border-color 0.2s'
              }}
            >
              <option value="Semua">Semua Golongan Darah</option>
              <option value="A">Golongan Darah A</option>
              <option value="B">Golongan Darah B</option>
              <option value="AB">Golongan Darah AB</option>
              <option value="O">Golongan Darah O</option>
              <option value="-">Belum Terbaca / Kosong</option>
            </select>
            <select
              value={rhesusFilter}
              onChange={(e) => {
                setRhesusFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '14px',
                fontWeight: 500,
                outline: 'none',
                cursor: 'pointer',
                backgroundColor: 'white',
                color: 'var(--text)',
                height: '42px',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                transition: 'border-color 0.2s'
              }}
            >
              <option value="Semua">Semua Rhesus</option>
              <option value="Positif">Rhesus Positif (+)</option>
              <option value="Negatif">Rhesus Negatif (-)</option>
              <option value="-">Belum Terbaca / Kosong</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={18} /> Tambah Pemeriksaan
          </button>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Pasien</th>
              <th>Nama Alat</th>
              <th>Tanggal</th>
              <th>Admin Pemeriksa</th>
              <th>Golongan Darah</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row) => (
              <tr key={row._id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{row.nama_pendonor}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span>{getPendonorIdUser(row.id_pendonor)}</span>
                    {row.no_antrian && (
                      <span className="badge badge-danger" style={{ fontSize: '11px', padding: '2px 6px', margin: 0, backgroundColor: '#ef4444', color: 'white', fontWeight: 'bold', borderRadius: '4px' }}>
                        Antrean: {row.no_antrian}
                      </span>
                    )}
                  </div>
                </td>
                <td>{row.nama_alat}</td>
                <td>{row.tanggal_pemeriksaan}</td>
                <td>{getAdminUsername(row.id_admin)}</td>
                <td>
                  <span className={`badge ${getGolonganDarah(row._id) === '-' ? 'badge-secondary' : 'badge-primary'}`} style={{ fontSize: '13px', padding: '4px 8px' }}>
                    {getGolonganDarah(row._id)}
                  </span>
                </td>
                <td>
                  <span className={`badge ${row.status === 'Selesai' ? 'badge-success' : row.status === 'Proses' ? 'badge-warning' : 'badge-secondary'}`}>
                    {row.status === 'Selesai' ? <CheckCircle size={14} /> : <Clock size={14} />}
                    {row.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link to={`/pemeriksaan/${row._id}`} className="btn-icon" title="Lihat Detail Pemeriksaan">
                      <Eye size={18} />
                    </Link>
                    <button className="btn-icon" title="Edit" onClick={() => handleOpenModal(row)}><Edit size={18} /></button>
                    <button className="btn-icon" style={{ color: 'var(--danger)' }} title="Hapus" onClick={() => setDeleteModal({ isOpen: true, id: row._id })}><Trash2 size={18} /></button>
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

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">{editId ? 'Edit Pemeriksaan' : 'Tambah Pemeriksaan'}</h3>
              <button className="btn-icon" onClick={handleCloseModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Pasien</label>
                  <Select
                    options={pendonorOptions}
                    value={pendonorOptions.find(o => o.value === formData.id_pendonor) || null}
                    onChange={(selected) => setFormData({ ...formData, id_pendonor: selected ? selected.value : '', nama_pendonor: selected ? selected.nama : '' })}
                    placeholder="Cari dan pilih Pasien..."
                    isClearable
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Nama Alat</label>
                  <Select
                    options={alatOptions}
                    value={alatOptions.find(o => o.value === formData.nama_alat) || null}
                    onChange={(selected) => setFormData({ ...formData, nama_alat: selected ? selected.value : '' })}
                    placeholder="Pilih Alat Deteksi..."
                    isClearable
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Konfirmasi Hapus</h3>
              <button className="btn-icon" onClick={() => setDeleteModal({ isOpen: false, id: null })}><X size={20} /></button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '20px 0' }}>
              <Trash2 size={48} color="var(--danger)" style={{ margin: '0 auto 16px', display: 'block' }} />
              <p style={{ margin: 0, fontSize: '16px', color: 'var(--text)' }}>
                Apakah Anda yakin ingin menghapus data pemeriksaan ini?
              </p>
              <p style={{ margin: '8px 0 0', fontSize: '14px', color: 'var(--text-muted)' }}>
                Data yang dihapus tidak dapat dikembalikan.
              </p>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'center' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setDeleteModal({ isOpen: false, id: null })}>Tidak, Batal</button>
              <button type="button" className="btn btn-primary" style={{ background: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={handleDelete}>Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
