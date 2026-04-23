import { useEffect, useState } from 'react';
import { ticketsAPI, usersAPI } from '../services/api';
import Loader from '../components/ui/Loader';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#6b7280', '#ef4444', '#f59e0b', '#3b82f6'];

export default function Reports() {
  const [stats, setStats] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('7d');

  useEffect(() => {
    const init = async () => {
      try {
        const [sr, ar] = await Promise.all([ticketsAPI.getStats(), usersAPI.getAgents()]);
        setStats(sr.data.stats);
        setAgents(ar.data.agents);
      } catch {}
      finally { setLoading(false); }
    };
    init();
  }, []);

  const handleExportCSV = () => {
    if (!stats) return;
    const rows = [
      ['Metric', 'Value'],
      ['Open Tickets', stats.open],
      ['In Progress', stats.inProgress],
      ['Resolved', stats.resolved],
      ['Closed', stats.closed],
      ['SLA Breached', stats.slaBreached],
      ...stats.categoryBreakdown.map(c => [`Category: ${c._id}`, c.count]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'ticketflow-report.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <Loader />;

  const categoryData = stats?.categoryBreakdown?.map(c => ({ name: c._id, value: c.count })) || [];
  const activityData = stats?.dailyActivity?.map(d => ({ date: d._id?.slice(5), count: d.count })) || [];
  const statusData = [
    { name: 'Open', value: stats?.open || 0 },
    { name: 'In Progress', value: stats?.inProgress || 0 },
    { name: 'Resolved', value: stats?.resolved || 0 },
    { name: 'Closed', value: stats?.closed || 0 },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">📈 Reports & Analytics</h1>
          <p className="page-subtitle">Track performance, trends, and team metrics</p>
        </div>
        <button className="btn btn-secondary" id="export-csv-btn" onClick={handleExportCSV}>
          📥 Export CSV
        </button>
      </div>

      {/* KPI Row */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Tickets', value: stats?.total || 0, icon: '🎫', color: 'blue' },
          { label: 'Resolution Rate', value: stats?.total ? `${Math.round(((stats.resolved + stats.closed) / stats.total) * 100)}%` : '0%', icon: '✅', color: 'green' },
          { label: 'SLA Breach Rate', value: stats?.total ? `${Math.round((stats.slaBreached / stats.total) * 100)}%` : '0%', icon: '🚨', color: 'red' },
          { label: 'Active Agents', value: agents.length, icon: '🧑‍💼', color: 'purple' },
        ].map(s => (
          <div key={s.label} className={`stat-card ${s.color}`}>
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="charts-grid">
        {/* Daily Activity Line Chart */}
        <div className="chart-card">
          <div className="chart-title">📅 Daily Ticket Volume</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Line type="monotone" dataKey="count" stroke="var(--accent)" strokeWidth={2} dot={{ fill: 'var(--accent)', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status Pie Chart */}
        <div className="chart-card">
          <div className="chart-title">📊 Status Distribution</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" outerRadius={75} dataKey="value"
                label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                labelLine={false} fontSize={11}>
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Category Bar Chart */}
        <div className="chart-card">
          <div className="chart-title">🏷️ Tickets by Category</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
              <YAxis stroke="var(--text-muted)" fontSize={12} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Bar dataKey="value" fill="#8b5cf6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Agent Performance */}
        <div className="chart-card">
          <div className="chart-title">🧑‍💼 Agent Performance</div>
          {agents.length === 0 ? (
            <div className="empty-state" style={{ padding: 30 }}>
              <p className="text-muted">No agents found</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {agents.slice(0, 5).map(a => (
                <div key={a._id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="mini-avatar" style={{ width: 28, height: 28, fontSize: 12 }}>
                    {a.avatar ? <img src={a.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : a.name?.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                      <span style={{ fontWeight: 600 }}>{a.name}</span>
                      <span style={{ color: 'var(--warning)', fontSize: 12 }}>
                        {a.avgRating ? `${Number(a.avgRating).toFixed(1)}★` : 'No ratings'}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{
                        width: `${Math.min((a.ticketsResolved / Math.max(...agents.map(x => x.ticketsResolved), 1)) * 100, 100)}%`,
                        background: 'var(--accent)'
                      }} />
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{a.ticketsResolved || 0} resolved</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
