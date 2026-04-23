import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Loader from '../components/ui/Loader';
import StatsCards from '../components/dashboard/StatsCards';
import { ActivityBarChart, CategoryPieChart, PriorityBarChart } from '../components/dashboard/TicketChart';
import RecentActivity from '../components/dashboard/RecentActivity';

export default function Dashboard() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, ticketsRes] = await Promise.all([
        ticketsAPI.getStats(),
        ticketsAPI.getAll({ limit: 5, sort: '-createdAt' })
      ]);
      setStats(statsRes.data.stats);
      setRecent(ticketsRes.data.tickets);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('ticket_created', fetchData);
    socket.on('ticket_updated', fetchData);
    return () => { socket.off('ticket_created'); socket.off('ticket_updated'); };
  }, [socket]);

  if (loading) return <Loader />;

  const pieData = stats?.categoryBreakdown?.map(c => ({ name: c._id, value: c.count })) || [];
  const barData = stats?.dailyActivity?.map(d => ({ date: d._id?.slice(5), tickets: d.count })) || [];
  const priorityData = stats?.priorityBreakdown?.map(p => ({ name: p._id, value: p.count })) || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Here's what's happening with your tickets today</p>
        </div>
        <button className="btn btn-primary" id="dash-new-ticket" onClick={() => navigate('/tickets/new')}>
          ➕ New Ticket
        </button>
      </div>

      <StatsCards stats={stats} />

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-title">📅 Ticket Activity (Last 7 Days)</div>
          <ActivityBarChart data={barData} />
        </div>

        <div className="chart-card">
          <div className="chart-title">🏷️ Tickets by Category</div>
          <CategoryPieChart data={pieData} />
        </div>

        <div className="chart-card">
          <div className="chart-title">⚡ Priority Distribution</div>
          <PriorityBarChart data={priorityData} />
        </div>

        <div className="chart-card">
          <div className="chart-title">🕐 Recent Tickets</div>
          <RecentActivity tickets={recent} onNewTicket={() => navigate('/tickets/new')} />
        </div>
      </div>
    </div>
  );
}
