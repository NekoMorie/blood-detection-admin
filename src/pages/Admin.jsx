import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import Pagination from '../components/Pagination';
import axios from 'axios';

const API_URL = 'http://localhost:5000/admin';

export default function Admin() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ nama_admin: '', username: '', password: '' });
  
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
    (d.nama_admin || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (d.username || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleOpenModal = (row = null) => {
    if (row) {
      setEditId(row.id_admin);
      setFormData({ nama_admin: row.nama_admin, username: row.username, password: row.password || '' });
    } else {
      setEditId(null);
      setFormData({ nama_admin: '', username: '', password: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditId(null);
    setFormData({ nama_admin: '', username: '', password: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, formData);
      } else {
        const newId = `A00${Math.floor(Math.random() * 1000)}`;
        await axios.post(API_URL, { id_admin: newId, ...formData });
      }
      fetchData();
      handleCloseModal();
    } catch (err) {
      console.error('Error saving data:', err);
      alert('Gagal menyimpan data');
    }
  };
  
  const handleDelete = async (id) => {
    if(window.confirm('Hapus admin ini?')) {
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
              <th>ID Admin</th>
              <th>Nama Admin</th>
              <th>Username</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row) => (
              <tr key={row.id_admin}>
                <td>{row.id_admin}</td>
                <td>{row.nama_admin}</td>
                <td>{row.username}</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-icon" title="Edit" onClick={() => handleOpenModal(row)}><Edit size={18} /></button>
                    <button className="btn-icon" style={{ color: 'var(--danger)' }} title="Hapus" onClick={() => handleDelete(row.id_admin)}><Trash2 size={18} /></button>
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
                    value={formData.nama_admin} 
                    onChange={(e) => setFormData({...formData, nama_admin: e.target.value})}
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
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    value={formData.password} 
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required={!editId}
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
