export default function Badge({ status, type = 'status' }) {
  const label = status?.replace('-', ' ') || '';

  if (type === 'status') {
    const cls = {
      open: 'badge-open',
      'in-progress': 'badge-in-progress',
      resolved: 'badge-resolved',
      closed: 'badge-closed',
    }[status] || 'badge-open';
    const dot = {
      open: '🔵',
      'in-progress': '🟣',
      resolved: '🟢',
      closed: '⚫',
    }[status] || '⚪';
    return <span className={`badge ${cls}`}>{dot} {label}</span>;
  }

  if (type === 'priority') {
    const cls = {
      low: 'badge-low',
      medium: 'badge-medium',
      high: 'badge-high',
      critical: 'badge-critical',
    }[status] || 'badge-low';
    const icon = {
      low: '↓',
      medium: '→',
      high: '↑',
      critical: '⚡',
    }[status] || '';
    return <span className={`badge ${cls}`}>{icon} {label}</span>;
  }

  if (type === 'role') {
    const cls = {
      user: 'badge-user',
      agent: 'badge-agent',
      admin: 'badge-admin',
    }[status] || 'badge-user';
    return <span className={`badge ${cls}`}>{label}</span>;
  }

  return <span className="badge">{label}</span>;
}
