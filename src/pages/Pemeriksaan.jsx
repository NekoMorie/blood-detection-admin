import { useState } from 'react';
import { Eye, CheckCircle, Clock, Plus, Edit, Trash2, X } from 'lucide-react';
import Pagination from '../components/Pagination';
import { Link } from 'react-router-dom';

export default function Pemeriksaan() {
  const [searchTerm, setSearchTerm] = useState('');

  const [data, setData] = useState([
    { id: 'PM001', id_pendonor: 'P001', nama_pendonor: 'Budi Santoso', id_admin: 'A001', tanggal: '15 Mei 2026', status: 'Selesai', nama_alat: 'BloodScanner V1' },
    { id: 'PM002', id_pendonor: 'P002', nama_pendonor: 'Siti Aminah', id_admin: 'A001', tanggal: '16 Mei 2026', status: 'Proses', nama_alat: 'Smart Darah Detect' },
    { id: 'PM003', id_pendonor: 'P003', nama_pendonor: 'Andi Wijaya', id_admin: 'A002', tanggal: '16 Mei 2026', status: 'Selesai', nama_alat: 'BloodScanner V1' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ id_pendonor: '', nama_pendonor: '', id_admin: 'A001', tanggal: '', status: 'Proses', nama_alat: '' });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredData = data.filter(d => 
    d.nama_alat.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.id_pendonor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.nama_pendonor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleOpenModal = (row = null) => {
    if (row) {
      setEditId(row.id);
      setFormData({ 
        id_pendonor: row.id_pendonor, 
        nama_pendonor: row.nama_pendonor, 
        id_admin: row.id_admin, 
        tanggal: row.tanggal, 
        status: row.status, 
        nama_alat: row.nama_alat 
      });
    } else {
      setEditId(null);
      setFormData({ id_pendonor: '', nama_pendonor: '', id_admin: 'A001', tanggal: new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'}), status: 'Proses', nama_alat: '' });
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
      const newId = `PM00${Math.floor(Math.random() * 1000)}`;
      setData([...data, { id: newId, ...formData }]);
    }
    handleCloseModal();
  };
  
  const handleDelete = (id) => {
    if(window.confirm('Hapus pemeriksaan ini?')) {
      setData(data.filter(d => d.id !== id));
    }
  };

  return (
    <div>
      <div className="table-container">
        <div className="table-header-row">
          <div className="search-box" style={{ width: '400px' }}>
            <input 
              type="text" 
              placeholder="Cari berdasarkan ID User (Pendonor) atau Nama Alat..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={18} /> Tambah Pemeriksaan
          </button>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Pendonor</th>
              <th>Nama Alat</th>
              <th>Tanggal</th>
              <th>Admin Pemeriksa</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row) => (
              <tr key={row.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{row.nama_pendonor}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{row.id_pendonor}</div>
                </td>
                <td>{row.nama_alat}</td>
                <td>{row.tanggal}</td>
                <td>{row.id_admin}</td>
                <td>
                  <span className={`badge ${row.status === 'Selesai' ? 'badge-success' : 'badge-warning'}`}>
                    {row.status === 'Selesai' ? <CheckCircle size={14} /> : <Clock size={14} />}
                    {row.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link to={`/pendonor/${row.id_pendonor}`} className="btn-icon" title="Lihat Hasil Pendonor">
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
              <h3 className="modal-title">{editId ? 'Edit Pemeriksaan' : 'Tambah Pemeriksaan'}</h3>
              <button className="btn-icon" onClick={handleCloseModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">ID Pendonor</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={formData.id_pendonor} 
                      onChange={(e) => setFormData({...formData, id_pendonor: e.target.value})}
                      required
                    />
                  </div>
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
                </div>
                <div className="form-group">
                  <label className="form-label">Nama Alat</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.nama_alat} 
                    onChange={(e) => setFormData({...formData, nama_alat: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select 
                    className="form-control"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="Proses">Proses</option>
                    <option value="Selesai">Selesai</option>
                  </select>
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
