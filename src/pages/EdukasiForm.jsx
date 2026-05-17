import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import JoditEditor from 'jodit-react';
import ImageModal from '../components/ImageModal';
import { apiClient as axios } from '../api/darah';

const API_URL = 'http://localhost:5000/edukasi';

export default function EdukasiForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editor = useRef(null);
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const adminStr = localStorage.getItem('logged_in_admin');
  const loggedInAdmin = adminStr ? JSON.parse(adminStr) : null;
  const adminId = loggedInAdmin ? loggedInAdmin._id : null;

  const [formData, setFormData] = useState({
    judul: '',
    sumber: '',
    isi_materi: '',
    id_admin: adminId,
    gambar: ''
  });

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      const res = await axios.get(API_URL);
      const item = res.data.find(d => d._id === id);
      if (item) {
        setFormData({
          judul: item.judul || '',
          sumber: item.sumber || '',
          isi_materi: item.isi_materi || '',
          id_admin: item.id_admin || adminId,
          gambar: item.gambar || ''
        });
        setImagePreview(item.gambar || null);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let finalData = { ...formData };
      
      if (imageFile) {
        const formDataObj = new FormData();
        formDataObj.append('gambar', imageFile);
        const uploadRes = await axios.post('http://localhost:5000/upload/edukasi', formDataObj);
        finalData.gambar = uploadRes.data.imageUrl;
      }

      if (id) {
        await axios.put(`${API_URL}/${id}`, finalData);
      } else {
        await axios.post(API_URL, finalData);
      }
      navigate('/edukasi');
    } catch (err) {
      console.error('Error saving data:', err);
      alert('Gagal menyimpan data edukasi');
    }
  };

  const config = {
    readonly: false,
    placeholder: 'Mulai menulis...',
    height: 350,
  };

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '24px' }}>
        <h2 className="page-title">{id ? 'Edit Edukasi' : 'Tambah Edukasi Baru'}</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/edukasi')}>
          <ArrowLeft size={18} /> Kembali
        </button>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Gambar Edukasi</label>
            <input 
              type="file" 
              className="form-control" 
              accept="image/*"
              onChange={handleImageChange}
              style={{ marginBottom: '12px' }}
            />
            {imagePreview && (
              <div 
                style={{ marginTop: '12px', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px', display: 'inline-block', cursor: 'pointer' }}
                onClick={() => setSelectedImage(imagePreview)}
              >
                <img src={imagePreview} alt="Preview" style={{ maxHeight: '200px', maxWidth: '100%', objectFit: 'contain', borderRadius: '4px' }} />
              </div>
            )}
          </div>
          
          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label">Judul Materi</label>
              <input 
                type="text" 
                className="form-control" 
                value={formData.judul}
                onChange={(e) => setFormData({...formData, judul: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Sumber</label>
              <input 
                type="text" 
                className="form-control" 
                value={formData.sumber}
                onChange={(e) => setFormData({...formData, sumber: e.target.value})}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Isi / Deskripsi</label>
            <JoditEditor
              ref={editor}
              value={formData.isi_materi}
              config={config}
              tabIndex={1}
              onBlur={newContent => setFormData({...formData, isi_materi: newContent})}
              onChange={newContent => {}}
            />
          </div>

          <div className="flex-between" style={{ marginTop: '32px', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/edukasi')}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={18} /> Simpan Data
            </button>
          </div>
        </form>
      </div>
      
      <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
    </div>
  );
}
