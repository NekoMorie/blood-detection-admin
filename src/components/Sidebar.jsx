import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  BookOpen, 
  Stethoscope, 
  Activity,
  Droplet,
  Calendar
} from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  const [waitingCount, setWaitingCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_API || 'http://localhost:5000'}/jadwal-homecare`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const count = response.data.filter(item => item.status === 'Menunggu Konfirmasi').length;
        setWaitingCount(count);
      } catch (err) {
        console.error("Failed to fetch homecare waiting count:", err);
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 15000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/pendonor', label: 'Data Pasien', icon: <Users size={20} /> },
    { path: '/pemeriksaan', label: 'Pemeriksaan', icon: <Activity size={20} /> },
    { path: '/jadwal-homecare', label: 'Jadwal Homecare', icon: <Calendar size={20} />, badge: waitingCount },
    { path: '/alat', label: 'Alat Deteksi', icon: <Stethoscope size={20} /> },
    { path: '/edukasi', label: 'Edukasi', icon: <BookOpen size={20} /> },
    { path: '/admin', label: 'Data Admin', icon: <ShieldCheck size={20} /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <img src="/logo.png" alt="logo" style={{ height: '28px' }} />
        </div>
        BloodCare
      </div>
      
      <nav className="nav-menu">
        {navItems.map((item) => (
          <Link 
            key={item.path} 
            to={item.path} 
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {item.icon}
              <span>{item.label}</span>
            </div>
            {item.badge > 0 && (
              <span style={{
                backgroundColor: '#ef4444',
                color: 'white',
                fontSize: '11px',
                fontWeight: 'bold',
                borderRadius: '9999px',
                padding: '2px 6px',
                minWidth: '18px',
                textAlign: 'center'
              }}>
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
