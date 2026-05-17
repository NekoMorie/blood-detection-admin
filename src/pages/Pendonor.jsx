import { useState, useEffect } from 'react';
import { Eye, CheckCircle, XCircle, Plus, Edit, Trash2, X } from 'lucide-react';
import Pagination from '../components/Pagination';
import { Link } from 'react-router-dom';
import { apiClient as axios } from '../api/darah';

const API_URL = 'http://localhost:5000/pendonor';

export default function Pendonor() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ nama_pendonor: '', jenis_kelamin: 'Laki-laki', no_telepon: '', email: '', status_verifikasi: 'Belum Verifikasi' });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(API_URL);
      setData(res.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const filteredData = data.filter(d => 
    (d.nama_pendonor || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (d._id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.id_user || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleOpenModal = (row = null) => {
    if (row) {
      setEditId(row._id);
      setFormData({ 
        nama_pendonor: row.nama_pendonor, 
        jenis_kelamin: row.jenis_kelamin, 
        no_telepon: row.no_telepon, 
        email: row.email, 
        status_verifikasi: row.status_verifikasi 
      });
    } else {
      setEditId(null);
      setFormData({ nama_pendonor: '', jenis_kelamin: 'Laki-laki', no_telepon: '', email: '', status_verifikasi: 'Belum Verifikasi' });
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
          <div className="search-box" style={{ background: 'var(--background)' }}>
            <input 
              type="text" 
              placeholder="Cari ID atau Nama Pendonor..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>ID Pendonor</th>
              <th>Nama Pendonor</th>
              <th>Jenis Kelamin</th>
              <th>No Telepon</th>
              <th>Email</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row) => (
              <tr key={row._id}>
                <td>{row.id_user || row._id}</td>
                <td>{row.nama_pendonor}</td>
                <td>{row.jenis_kelamin}</td>
                <td>{row.no_telepon}</td>
                <td>{row.email}</td>
                <td>
                  <span className={`badge ${
                    row.status_verifikasi === 'Terverifikasi' ? 'badge-success' : 
                    row.status_verifikasi === 'Belum Verifikasi' ? 'badge-warning' : 'badge-danger'
                  }`}>
                    {row.status_verifikasi === 'Terverifikasi' && <CheckCircle size={14} />}
                    {row.status_verifikasi === 'Ditolak' && <XCircle size={14} />}
                    {row.status_verifikasi}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link to={`/pendonor/${row._id}`} className="btn-icon" title="Lihat Detail">
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
              <h3 className="modal-title">{editId ? 'Edit Pendonor' : 'Tambah Pendonor'}</h3>
              <button className="btn-icon" onClick={handleCloseModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nama Pendonor</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.nama_pendonor} 
                    onChange={(e) => setFormData({...formData, nama_pendonor: e.target.value})}
                    required
                  />
                </div>
                <div className="grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">Jenis Kelamin</label>
                    <select 
                      className="form-control"
                      value={formData.jenis_kelamin}
                      onChange={(e) => setFormData({...formData, jenis_kelamin: e.target.value})}
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select 
                      className="form-control"
                      value={formData.status_verifikasi}
                      onChange={(e) => setFormData({...formData, status_verifikasi: e.target.value})}
                    >
                      <option value="Belum Verifikasi">Belum Verifikasi</option>
                      <option value="Terverifikasi">Terverifikasi</option>
                      <option value="Ditolak">Ditolak</option>
                    </select>
                  </div>
                </div>
                <div className="grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">No Telepon</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={formData.no_telepon} 
                      onChange={(e) => setFormData({...formData, no_telepon: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      value={formData.email} 
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
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
                Apakah Anda yakin ingin menghapus data pendonor ini?
              </p>
              <p style={{ margin: '8px 0 0', fontSize: '14px', color: 'var(--text-muted)' }}>
                Data yang dihapus tidak dapat dikembalikan beserta riwayatnya.
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
