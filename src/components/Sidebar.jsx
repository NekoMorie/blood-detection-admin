import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  BookOpen, 
  Stethoscope, 
  Activity,
  Droplet
} from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/pendonor', label: 'Data Pasien', icon: <Users size={20} /> },
    { path: '/pemeriksaan', label: 'Pemeriksaan', icon: <Activity size={20} /> },
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
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
