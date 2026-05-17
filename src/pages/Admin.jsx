import { useState } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import Pagination from '../components/Pagination';

export default function Admin() {
  const [data, setData] = useState([
    { id: 'A001', nama: 'Admin Utama', username: 'superadmin' },
    { id: 'A002', nama: 'Budi Staff', username: 'budistaff' },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ nama: '', username: '' });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredData = data.filter(d => 
    d.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleOpenModal = (row = null) => {
    if (row) {
      setEditId(row.id);
      setFormData({ nama: row.nama, username: row.username });
    } else {
      setEditId(null);
      setFormData({ nama: '', username: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditId(null);
    setFormData({ nama: '', username: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editId) {
      setData(data.map(d => d.id === editId ? { ...d, ...formData } : d));
    } else {
      const newId = `A00${Math.floor(Math.random() * 1000)}`;
      setData([...data, { id: newId, ...formData }]);
    }
    handleCloseModal();
  };
  
  const handleDelete = (id) => {
    if(window.confirm('Hapus admin ini?')) {
      setData(data.filter(d => d.id !== id));
    }
  };

  return (
    <div>
      <div className="table-container">
        <div className="table-header-row">
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Cari Admin..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={18} /> Tambah Admin
          </button>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Nama Admin</th>
              <th>Username</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row) => (
              <tr key={row.id}>
                <td>{row.nama}</td>
                <td>{row.username}</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
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
              <h3 className="modal-title">{editId ? 'Edit Admin' : 'Tambah Admin'}</h3>
              <button className="btn-icon" onClick={handleCloseModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nama Admin</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.nama} 
                    onChange={(e) => setFormData({...formData, nama: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.username} 
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
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
    </div>
  );
}
