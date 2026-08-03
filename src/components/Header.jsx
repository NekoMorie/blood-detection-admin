import { Bell, LogOut, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [connectionStatus, setConnectionStatus] = useState('checking'); // 'checking' | 'connected' | 'error'
  const [isRetrying, setIsRetrying] = useState(false);
  const apiUrl = import.meta.env.VITE_BACKEND_API || 'http://localhost:5000';
  
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

  const checkConnection = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      
      await fetch(apiUrl, { method: 'GET', signal: controller.signal });
      clearTimeout(timeoutId);
      setConnectionStatus('connected');
    } catch (err) {
      if (err.name === 'AbortError' || err.message === 'Failed to fetch') {
        setConnectionStatus('error');
      } else {
        // If we get any response status (like 404, 401), the server is alive
        setConnectionStatus('connected');
      }
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    setConnectionStatus('checking');
    await checkConnection();
    setIsRetrying(false);
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 15000);
    return () => clearInterval(interval);
  }, [apiUrl]);

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <h1 className="page-title">{getPageTitle()}</h1>
        
        {/* Status Badge */}
        {connectionStatus === 'connected' && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#d1fae5',
            color: '#065f46',
            fontSize: '12px',
            fontWeight: 600,
            padding: '4px 12px',
            borderRadius: '9999px',
            border: '1px solid #a7f3d0',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.3s ease'
          }} title={`Connected to backend at ${apiUrl}`}>
            <Wifi size={14} color="#10b981" />
            <span>API Terhubung</span>
            <span style={{ fontSize: '11px', opacity: 0.7, fontWeight: 500 }}>({apiUrl.replace(/^https?:\/\//, '')})</span>
          </div>
        )}

        {connectionStatus === 'error' && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            fontSize: '12px',
            fontWeight: 600,
            padding: '4px 12px',
            borderRadius: '9999px',
            border: '1px solid #fca5a5',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.3s ease'
          }} title={`Cannot connect to backend at ${apiUrl}`}>
            <WifiOff size={14} color="#ef4444" />
            <span>API Terputus</span>
            <button 
              onClick={handleRetry} 
              disabled={isRetrying}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#991b1b',
                opacity: 0.8,
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'rotate(45deg)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
            >
              <RefreshCw size={12} className={isRetrying ? 'animate-spin' : ''} />
            </button>
          </div>
        )}

        {connectionStatus === 'checking' && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#fef3c7',
            color: '#92400e',
            fontSize: '12px',
            fontWeight: 600,
            padding: '4px 12px',
            borderRadius: '9999px',
            border: '1px solid #fde68a',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
          }}>
            <RefreshCw size={12} className="animate-spin" style={{ color: '#d97706' }} />
            <span>Memeriksa API...</span>
          </div>
        )}
      </div>
      
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
