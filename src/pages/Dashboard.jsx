import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Users, Droplet, CheckCircle, Activity } from 'lucide-react';

const bloodTypeData = [
  { name: 'A+', count: 120 },
  { name: 'A-', count: 15 },
  { name: 'B+', count: 150 },
  { name: 'B-', count: 12 },
  { name: 'AB+', count: 45 },
  { name: 'AB-', count: 5 },
  { name: 'O+', count: 200 },
  { name: 'O-', count: 25 },
];

export default function Dashboard() {
  return (
    <div>
      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon primary">
            <Users size={28} />
          </div>
          <div className="stat-details">
            <h4>Total Pendonor</h4>
            <h2>1,245</h2>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon success">
            <CheckCircle size={28} />
          </div>
          <div className="stat-details">
            <h4>Terverifikasi</h4>
            <h2>1,102</h2>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon warning">
            <Activity size={28} />
          </div>
          <div className="stat-details">
            <h4>Total Pemeriksaan</h4>
            <h2>3,450</h2>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon info">
            <Droplet size={28} />
          </div>
          <div className="stat-details">
            <h4>Stok Darah Terdeteksi</h4>
            <h2>572 Kantong</h2>
          </div>
        </div>
      </div>

      <div className="chart-container">
        <div className="chart-header">
          <h3 className="chart-title">Distribusi Golongan Darah</h3>
        </div>
        <div style={{ height: 400, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bloodTypeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{ fill: 'var(--background)' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-md)' }}
              />
              <Legend />
              <Bar dataKey="count" name="Jumlah Pendonor" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
