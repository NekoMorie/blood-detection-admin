import { useState } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import Pagination from '../components/Pagination';

export default function Alat() {
  const [data, setData] = useState([
    { id: 'AL001', nama: 'BloodScanner V1', sensor: 'Optical Sensor', mikro: 'ESP32' },
    { id: 'AL002', nama: 'Smart Darah Detect', sensor: 'Infrared & Optical', mikro: 'Arduino Uno' },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ nama: '', sensor: '', mikro: '' });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredData = data.filter(d => 
    d.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.sensor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.mikro.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleOpenModal = (row = null) => {
    if (row) {
      setEditId(row.id);
      setFormData({ nama: row.nama, sensor: row.sensor, mikro: row.mikro });
    } else {
      setEditId(null);
      setFormData({ nama: '', sensor: '', mikro: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditId(null);
    setFormData({ nama: '', sensor: '', mikro: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editId) {
      setData(data.map(d => d.id === editId ? { ...d, ...formData } : d));
    } else {
      const newId = `AL00${Math.floor(Math.random() * 1000)}`;
      setData([...data, { id: newId, ...formData }]);
    }
    handleCloseModal();
  };
  
  const handleDelete = (id) => {
    if(window.confirm('Hapus alat ini?')) {
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
              <tr key={row.id}>
                <td>{row.id}</td>
                <td style={{ fontWeight: 600 }}>{row.nama}</td>
                <td>{row.sensor}</td>
                <td>{row.mikro}</td>
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
                    value={formData.nama} 
                    onChange={(e) => setFormData({...formData, nama: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Jenis Sensor</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.sensor} 
                    onChange={(e) => setFormData({...formData, sensor: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mikrokontroler</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.mikro} 
                    onChange={(e) => setFormData({...formData, mikro: e.target.value})}
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
