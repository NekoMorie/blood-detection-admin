import { useState } from 'react';
import { Eye, CheckCircle, XCircle, Plus, Edit, Trash2, X } from 'lucide-react';
import Pagination from '../components/Pagination';
import { Link } from 'react-router-dom';

const initialData = [
  { id: 'P001', nama: 'Budi Santoso', jk: 'Laki-laki', telepon: '081234567890', email: 'budi@gmail.com', status: 'Terverifikasi' },
  { id: 'P002', nama: 'Siti Aminah', jk: 'Perempuan', telepon: '081298765432', email: 'siti@gmail.com', status: 'Belum Verifikasi' },
  { id: 'P003', nama: 'Andi Wijaya', jk: 'Laki-laki', telepon: '085612345678', email: 'andi@gmail.com', status: 'Terverifikasi' },
  { id: 'P004', nama: 'Rina Marlina', jk: 'Perempuan', telepon: '087812349876', email: 'rina@gmail.com', status: 'Ditolak' },
];

export default function Pendonor() {
  const [data, setData] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ nama: '', jk: 'Laki-laki', telepon: '', email: '', status: 'Belum Verifikasi' });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredData = data.filter(d => 
    d.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleOpenModal = (row = null) => {
    if (row) {
      setEditId(row.id);
      setFormData({ nama: row.nama, jk: row.jk, telepon: row.telepon, email: row.email, status: row.status });
    } else {
      setEditId(null);
      setFormData({ nama: '', jk: 'Laki-laki', telepon: '', email: '', status: 'Belum Verifikasi' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editId) {
      setData(data.map(d => d.id === editId ? { ...d, ...formData } : d));
    } else {
      const newId = `P00${Math.floor(Math.random() * 1000)}`;
      setData([...data, { id: newId, ...formData }]);
    }
    handleCloseModal();
  };
  
  const handleDelete = (id) => {
    if(window.confirm('Hapus pendonor ini?')) {
      setData(data.filter(d => d.id !== id));
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
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.nama}</td>
                <td>{row.jk}</td>
                <td>{row.telepon}</td>
                <td>{row.email}</td>
                <td>
                  <span className={`badge ${
                    row.status === 'Terverifikasi' ? 'badge-success' : 
                    row.status === 'Belum Verifikasi' ? 'badge-warning' : 'badge-danger'
                  }`}>
                    {row.status === 'Terverifikasi' && <CheckCircle size={14} />}
                    {row.status === 'Ditolak' && <XCircle size={14} />}
                    {row.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link to={`/pendonor/${row.id}`} className="btn-icon" title="Lihat Detail">
                      <Eye size={18} />
                    </Link>
                    <button className="btn-icon" title="Edit" onClick={() => handleOpenModal(row)}><Edit size={18} /></button>
                    <button className="btn-icon" style={{ color: 'var(--danger)' }} title="Hapus" onClick={() => handleDelete(row.id)}><Trash2 size={18} /></button>
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
                    value={formData.nama} 
                    onChange={(e) => setFormData({...formData, nama: e.target.value})}
                    required
                  />
                </div>
                <div className="grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">Jenis Kelamin</label>
                    <select 
                      className="form-control"
                      value={formData.jk}
                      onChange={(e) => setFormData({...formData, jk: e.target.value})}
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select 
                      className="form-control"
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
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
                      value={formData.telepon} 
                      onChange={(e) => setFormData({...formData, telepon: e.target.value})}
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
