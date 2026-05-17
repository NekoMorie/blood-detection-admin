import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Users, Droplet, CheckCircle, Activity } from 'lucide-react';
import axios from 'axios';

export default function Dashboard() {
  const [stats, setStats] = useState({ totalPendonor: 0, verifiedPendonor: 0, totalPemeriksaan: 0, stokDarah: 0 });
  const [bloodTypeData, setBloodTypeData] = useState([
    { name: 'A+', count: 0 }, { name: 'A-', count: 0 },
    { name: 'B+', count: 0 }, { name: 'B-', count: 0 },
    { name: 'AB+', count: 0 }, { name: 'AB-', count: 0 },
    { name: 'O+', count: 0 }, { name: 'O-', count: 0 },
  ]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_API || 'http://localhost:5000'}/dashboard/stats`);
        setStats(res.data.stats);
        setBloodTypeData(res.data.bloodTypeData);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div>
      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon primary">
            <Users size={28} />
          </div>
          <div className="stat-details">
            <h4>Total Pendonor</h4>
            <h2>{stats.totalPendonor}</h2>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon success">
            <CheckCircle size={28} />
          </div>
          <div className="stat-details">
            <h4>Terverifikasi</h4>
            <h2>{stats.verifiedPendonor}</h2>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon warning">
            <Activity size={28} />
          </div>
          <div className="stat-details">
            <h4>Total Pemeriksaan</h4>
            <h2>{stats.totalPemeriksaan}</h2>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon info">
            <Droplet size={28} />
          </div>
          <div className="stat-details">
            <h4>Stok Darah Terdeteksi</h4>
            <h2>{stats.stokDarah} Kantong</h2>
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
