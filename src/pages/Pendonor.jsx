import { useState, useEffect } from 'react';
import { Eye, CheckCircle, XCircle, Plus, Edit, Trash2, X } from 'lucide-react';
import Pagination from '../components/Pagination';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:5000/pendonor';

export default function Pendonor() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    (d.id_pendonor || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleOpenModal = (row = null) => {
    if (row) {
      setEditId(row.id_pendonor);
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
        const newId = `P00${Math.floor(Math.random() * 1000)}`;
        await axios.post(API_URL, { id_pendonor: newId, ...formData });
      }
      fetchData();
      handleCloseModal();
    } catch (err) {
      console.error('Error saving data:', err);
      alert('Gagal menyimpan data');
    }
  };
  
  const handleDelete = async (id) => {
    if(window.confirm('Hapus pendonor ini?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchData();
      } catch (err) {
        console.error('Error deleting data:', err);
        alert('Gagal menghapus data');
      }
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
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={18} /> Tambah Pendonor
          </button>
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
              <tr key={row.id_pendonor}>
                <td>{row.id_pendonor}</td>
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
                    <Link to={`/pendonor/${row.id_pendonor}`} className="btn-icon" title="Lihat Detail">
                      <Eye size={18} />
                    </Link>
                    <button className="btn-icon" title="Edit" onClick={() => handleOpenModal(row)}><Edit size={18} /></button>
                    <button className="btn-icon" style={{ color: 'var(--danger)' }} title="Hapus" onClick={() => handleDelete(row.id_pendonor)}><Trash2 size={18} /></button>
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
    </div>
  );
}
