import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', department: 'General' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const user = await register(form);
      toast.success(`Account created! Welcome, ${user.name.split(' ')[0]}! 🎉`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">
          <div className="auth-logo-icon">🎯</div>
          <span className="auth-logo-text">TicketFlow</span>
        </div>

        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Start managing your support tickets today</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Full Name</label>
            <input id="reg-name" type="text" className="form-control" placeholder="John Doe"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email Address</label>
            <input id="reg-email" type="email" className="form-control" placeholder="you@example.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-dept">Department</label>
              <select id="reg-dept" className="form-control"
                value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                {['General', 'IT', 'HR', 'Finance', 'Operations', 'Sales', 'Support'].map(d =>
                  <option key={d} value={d}>{d}</option>
                )}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-pass">Password</label>
              <input id="reg-pass" type="password" className="form-control" placeholder="6+ characters"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
          </div>

          <button id="register-submit" type="submit"
            className="btn btn-primary w-full"
            style={{ marginTop: 4, justifyContent: 'center', padding: '12px' }}
            disabled={loading}>
            {loading ? '⏳ Creating account…' : '✓ Create Account'}
          </button>
        </form>

        <p className="auth-divider">Already have an account?</p>
        <div style={{ textAlign: 'center' }}>
          <Link to="/login" className="auth-link">← Sign in</Link>
        </div>
      </div>
    </div>
  );
}
