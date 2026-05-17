import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import Pagination from '../components/Pagination';
import ImageModal from '../components/ImageModal';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:5000/edukasi';

export default function Edukasi() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [selectedImage, setSelectedImage] = useState(null);

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
    (d.judul || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (d.isi_materi || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.sumber || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDelete = async (id) => {
    if(window.confirm('Hapus artikel ini?')) {
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
              <tr key={row.id_edukasi}>
                <td>
                  {row.gambar ? (
                    <img 
                      src={row.gambar} 
                      alt="" 
                      style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer' }} 
                      onClick={() => setSelectedImage(row.gambar)}
                    />
                  ) : (
                    <div style={{ width: '40px', height: '40px', background: 'var(--background)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                      <ImageIcon size={20} />
                    </div>
                  )}
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>{row.judul}</div>
                  <div 
                    style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}
                    dangerouslySetInnerHTML={{ __html: row.isi_materi }} 
                  />
                </td>
                <td>{row.sumber}</td>
                <td>{row.id_admin}</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-icon" title="Edit" onClick={() => navigate(`/edukasi/edit/${row.id_edukasi}`)}><Edit size={18} /></button>
                    <button className="btn-icon" style={{ color: 'var(--danger)' }} title="Hapus" onClick={() => handleDelete(row.id_edukasi)}><Trash2 size={18} /></button>
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
      
      <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
    </div>
  );
}
