import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import JoditEditor from 'jodit-react';
import ImageModal from '../components/ImageModal';

export default function EdukasiForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editor = useRef(null);
  
  const [selectedImage, setSelectedImage] = useState(null);
  
  const [formData, setFormData] = useState({
    judul: '',
    sumber: '',
    isi: '',
    admin: 'admin',
    image: ''
  });

  useEffect(() => {
    // If editing, load data from localStorage
    if (id) {
      const storedData = localStorage.getItem('edukasi_data');
      if (storedData) {
        const parsed = JSON.parse(storedData);
        const item = parsed.find(d => d.id === id);
        if (item) {
          setFormData({
            judul: item.judul,
            sumber: item.sumber,
            isi: item.isi,
            admin: item.admin,
            image: item.image || ''
          });
        }
      }
    }
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Load current data
    const storedData = localStorage.getItem('edukasi_data');
    let currentData = [];
    if (storedData) {
      currentData = JSON.parse(storedData);
    } else {
      currentData = [
        { id: 'E001', admin: 'admin', judul: 'Manfaat Donor Darah', isi: 'Donor darah sangat bermanfaat bagi kesehatan...', sumber: 'Kemenkes RI' },
        { id: 'E002', admin: 'budistaff', judul: 'Syarat Donor Darah', isi: 'Sebelum donor, pastikan berat badan...', sumber: 'PMI' }
      ];
    }

    if (id) {
      // Edit
      currentData = currentData.map(d => d.id === id ? { ...d, ...formData } : d);
    } else {
      // Add
      const newId = `E00${Math.floor(Math.random() * 1000)}`;
      currentData.push({ id: newId, ...formData });
    }

    // Save back to localStorage
    localStorage.setItem('edukasi_data', JSON.stringify(currentData));
    
    // Navigate back
    navigate('/edukasi');
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
            {formData.image && (
              <div 
                style={{ marginTop: '12px', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px', display: 'inline-block', cursor: 'pointer' }}
                onClick={() => setSelectedImage(formData.image)}
              >
                <img src={formData.image} alt="Preview" style={{ maxHeight: '200px', maxWidth: '100%', objectFit: 'contain', borderRadius: '4px' }} />
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
              value={formData.isi}
              config={config}
              tabIndex={1} // tabIndex of textarea
              onBlur={newContent => setFormData({...formData, isi: newContent})}
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
