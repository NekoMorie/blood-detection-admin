import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import Pagination from '../components/Pagination';
import axios from 'axios';

const API_URL = 'http://localhost:5000/alat';

export default function Alat() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ nama_alat: '', jenis_sensor: '', mikrokontroler: '' });

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
    (d.nama_alat || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (d.jenis_sensor || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.mikrokontroler || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.id_alat || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleOpenModal = (row = null) => {
    if (row) {
      setEditId(row.id_alat);
      setFormData({ nama_alat: row.nama_alat, jenis_sensor: row.jenis_sensor, mikrokontroler: row.mikrokontroler });
    } else {
      setEditId(null);
      setFormData({ nama_alat: '', jenis_sensor: '', mikrokontroler: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditId(null);
    setFormData({ nama_alat: '', jenis_sensor: '', mikrokontroler: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, formData);
      } else {
        const newId = `AL00${Math.floor(Math.random() * 1000)}`;
        await axios.post(API_URL, { id_alat: newId, ...formData });
      }
      fetchData();
      handleCloseModal();
    } catch (err) {
      console.error('Error saving data:', err);
      alert('Gagal menyimpan data');
    }
  };
  
  const handleDelete = async (id) => {
    if(window.confirm('Hapus alat ini?')) {
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
              placeholder="Cari Alat Deteksi..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={18} /> Tambah Alat
          </button>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>ID Alat</th>
              <th>Nama Alat</th>
              <th>Jenis Sensor</th>
              <th>Mikrokontroler</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row) => (
              <tr key={row.id_alat}>
                <td>{row.id_alat}</td>
                <td style={{ fontWeight: 600 }}>{row.nama_alat}</td>
                <td>{row.jenis_sensor}</td>
                <td>{row.mikrokontroler}</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-icon" title="Edit" onClick={() => handleOpenModal(row)}><Edit size={18} /></button>
                    <button className="btn-icon" style={{ color: 'var(--danger)' }} title="Hapus" onClick={() => handleDelete(row.id_alat)}><Trash2 size={18} /></button>
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
              <h3 className="modal-title">{editId ? 'Edit Alat' : 'Tambah Alat'}</h3>
              <button className="btn-icon" onClick={handleCloseModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
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
                  <label className="form-label">Jenis Sensor</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.jenis_sensor} 
                    onChange={(e) => setFormData({...formData, jenis_sensor: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mikrokontroler</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.mikrokontroler} 
                    onChange={(e) => setFormData({...formData, mikrokontroler: e.target.value})}
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
