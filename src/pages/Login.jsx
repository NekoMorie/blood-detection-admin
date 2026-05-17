import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Droplets } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.username === 'admin' && formData.password === 'admin') {
      navigate('/');
    } else {
      setError('Username atau password salah! (Coba admin/admin)');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div style={{ display: 'inline-flex', background: 'var(--primary-light)', color: 'var(--primary)', padding: '16px', borderRadius: 'var(--radius-full)' }}>
            <Droplets size={32} />
          </div>
          <h2>BloodCare Admin</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '8px' }}>
            Masuk untuk mengelola sistem deteksi darah
          </p>
        </div>

        {error && (
          <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Masukkan username..." 
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: '32px' }}>
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="Masukkan password..." 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
            <LogIn size={18} /> Masuk Sekarang
          </button>
        </form>
      </div>
    </div>
  );
}
