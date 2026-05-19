import { Bell, LogOut } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Dashboard Overview';
      case '/pendonor': return 'Data Pasien';
      case '/pemeriksaan': return 'Data Pemeriksaan';
      case '/alat': return 'Manajemen Alat Deteksi';
      case '/edukasi': return 'Konten Edukasi';
      case '/admin': return 'Manajemen Admin';
      default:
        if (location.pathname.startsWith('/pendonor/')) return 'Detail Pasien';
        return 'BloodCare System';
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('logged_in_admin');
    navigate('/login');
  };

  const adminStr = localStorage.getItem('logged_in_admin');
  const admin = adminStr ? JSON.parse(adminStr) : { nama_admin: 'Admin Utama', username: 'admin' };

  return (
    <header className="header">
      <h1 className="page-title">{getPageTitle()}</h1>
      
      <div className="header-actions">
        <button className="btn-icon">
          <Bell size={20} />
        </button>
        
        <div className="dropdown-container" ref={dropdownRef}>
          <div className="user-profile" onClick={() => setDropdownOpen(!dropdownOpen)}>
            <div className="avatar">{(admin.nama_admin || 'A').substring(0, 2).toUpperCase()}</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--secondary)' }}>{admin.nama_admin || admin.username}</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Admin</span>
            </div>
          </div>
          
          {dropdownOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-item" onClick={handleLogout}>
                <LogOut size={16} /> Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
