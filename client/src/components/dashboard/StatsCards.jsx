import { useNavigate } from 'react-router-dom';

const cardConfigs = [
  { key: 'open', label: 'Open', icon: '🎫', color: 'blue', statusFilter: 'open' },
  { key: 'inProgress', label: 'In Progress', icon: '⚙️', color: 'purple', statusFilter: 'in-progress' },
  { key: 'resolved', label: 'Resolved', icon: '✅', color: 'green', statusFilter: 'resolved' },
  { key: 'closed', label: 'Closed', icon: '🔒', color: 'gray', statusFilter: 'closed' },
  { key: 'slaBreached', label: 'SLA Breached', icon: '🚨', color: 'red' },
];

export default function StatsCards({ stats }) {
  const navigate = useNavigate();

  return (
    <div className="stats-grid">
      {cardConfigs.map(({ key, label, icon, color, statusFilter }) => (
        <div
          key={key}
          className={`stat-card ${color}`}
          onClick={() =>
            navigate(statusFilter ? `/tickets?status=${statusFilter}` : '/tickets')
          }
          style={{ cursor: 'pointer' }}
          title={`View ${label} tickets`}
        >
          <div className={`stat-icon ${color}`}>{icon}</div>
          <div className="stat-value">{stats?.[key] ?? 0}</div>
          <div className="stat-label">{label} Tickets</div>
          {key === 'slaBreached' && stats?.slaBreached > 0 && (
            <div
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#ef4444',
                animation: 'pulse 2s infinite',
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
