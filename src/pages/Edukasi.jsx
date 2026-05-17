import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import Pagination from '../components/Pagination';
import { useNavigate } from 'react-router-dom';

export default function Edukasi() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const storedData = localStorage.getItem('edukasi_data');
    if (storedData) {
      setData(JSON.parse(storedData));
    } else {
      const initialData = [
        { id: 'E001', admin: 'admin', judul: 'Manfaat Donor Darah', isi: 'Donor darah sangat bermanfaat bagi kesehatan...', sumber: 'Kemenkes RI' },
        { id: 'E002', admin: 'budistaff', judul: 'Syarat Donor Darah', isi: 'Sebelum donor, pastikan berat badan...', sumber: 'PMI' },
      ];
      setData(initialData);
      localStorage.setItem('edukasi_data', JSON.stringify(initialData));
    }
  }, []);

  const filteredData = data.filter(d => 
    d.judul.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.isi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.sumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDelete = (id) => {
    if(window.confirm('Hapus artikel ini?')) {
      const newData = data.filter(d => d.id !== id);
      setData(newData);
      localStorage.setItem('edukasi_data', JSON.stringify(newData));
    }
  };

  return (
    <div>
      <div className="table-container">
        <div className="table-header-row">
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Cari Artikel Edukasi..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/edukasi/tambah')}>
            <Plus size={18} /> Tambah Edukasi
          </button>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Gambar</th>
              <th>Judul Materi</th>
              <th>Sumber</th>
              <th>Username Admin</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row) => (
              <tr key={row.id}>
                <td>
                  <div style={{ width: '40px', height: '40px', background: 'var(--background)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    <ImageIcon size={20} />
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>{row.judul}</div>
                  <div 
                    style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}
                    dangerouslySetInnerHTML={{ __html: row.isi }} 
                  />
                </td>
                <td>{row.sumber}</td>
                <td>{row.admin}</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-icon" title="Edit" onClick={() => navigate(`/edukasi/edit/${row.id}`)}><Edit size={18} /></button>
                    <button className="btn-icon" style={{ color: 'var(--danger)' }} title="Hapus" onClick={() => handleDelete(row.id)}><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '32px' }}>
                  Tidak ada data edukasi ditemukan.
                </td>
              </tr>
            )}
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
    </div>
  );
}
