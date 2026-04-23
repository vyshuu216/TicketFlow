import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';
import { ticketsAPI } from '../services/api';
import Badge from '../components/ui/Badge';
import Loader from '../components/ui/Loader';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', department: '' });
  const [stats, setStats] = useState(null);
  const [myTickets, setMyTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [tab, setTab] = useState('Profile');

  useEffect(() => {
    if (user) setForm({ name: user.name || '', phone: user.phone || '', department: user.department || '' });
    const init = async () => {
      try {
        const [tr, sr] = await Promise.all([
          ticketsAPI.getAll({ limit: 10 }),
          user?.role !== 'user' ? usersAPI.getStats(user._id) : Promise.resolve(null)
        ]);
        setMyTickets(tr.data.tickets);
        if (sr) setStats(sr.data.stats);
      } catch {}
      finally { setLoading(false); }
    };
    init();
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await usersAPI.updateProfile(form);
      updateUser(data.user);
      toast.success('Profile updated ✓');
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  const handleAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const { data } = await usersAPI.uploadAvatar(fd);
      updateUser({ avatar: data.avatar });
      toast.success('Avatar updated!');
    } catch { toast.error('Failed to upload avatar'); }
    finally { setUploadingAvatar(false); }
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: 20 }}>My Profile</h1>

      {/* Profile Header */}
      <div className="profile-header">
        <div style={{ position: 'relative' }}>
          <div className="profile-avatar-lg">
            {user?.avatar
              ? <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initials}
          </div>
          <label htmlFor="avatar-upload" style={{
            position: 'absolute', bottom: 0, right: 0,
            width: 26, height: 26, borderRadius: '50%',
            background: 'var(--accent)', border: '2px solid var(--bg-card)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: 12
          }}>
            {uploadingAvatar ? '⏳' : '✏️'}
          </label>
          <input id="avatar-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatar} />
        </div>
        <div className="profile-info">
          <h2>{user?.name}</h2>
          <p>{user?.email}</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <Badge status={user?.role} type="role" />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>· {user?.department}</span>
          </div>
        </div>
        {user?.role !== 'user' && stats && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 24, textAlign: 'center' }}>
            {[
              { label: 'Assigned', value: stats.totalAssigned },
              { label: 'Resolved', value: stats.resolved + stats.closed },
              { label: 'Avg Rating', value: stats.avgRating ? `${Number(stats.avgRating).toFixed(1)}★` : 'N/A' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="tabs">
        {['Profile', 'My Tickets'].map(t => (
          <div key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</div>
        ))}
      </div>

      {tab === 'Profile' && (
        <div style={{ maxWidth: 520 }}>
          <div className="card">
            <h3 style={{ marginBottom: 20 }}>Personal Information</h3>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label" htmlFor="profile-name">Full Name</label>
                <input id="profile-name" type="text" className="form-control"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-control" value={user?.email} disabled
                  style={{ opacity: 0.6, cursor: 'not-allowed' }} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="profile-phone">Phone</label>
                  <input id="profile-phone" type="tel" className="form-control" placeholder="+1 (555) 000-0000"
                    value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="profile-dept">Department</label>
                  <select id="profile-dept" className="form-control"
                    value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                    {['General', 'IT', 'HR', 'Finance', 'Operations', 'Sales', 'Support'].map(d =>
                      <option key={d} value={d}>{d}</option>
                    )}
                  </select>
                </div>
              </div>
              <button id="save-profile" type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? '⏳ Saving…' : '💾 Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {tab === 'My Tickets' && (
        <div>
          {myTickets.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🎫</div>
              <div className="empty-state-title">No tickets yet</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {myTickets.map(t => (
                <div key={t._id} className="ticket-card" onClick={() => window.location.href = `/tickets/${t._id}`}>
                  <div className="ticket-card-header">
                    <div>
                      <div className="ticket-id">{t.ticketId}</div>
                      <div className="ticket-title">{t.title}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Badge status={t.priority} type="priority" />
                      <Badge status={t.status} type="status" />
                    </div>
                  </div>
                  <div className="ticket-meta">
                    <span className="ticket-meta-item">🏷️ {t.category}</span>
                    <span className="ticket-meta-item">🕐 {new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
