import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api/api';
import { useAuth } from '../context/authcontext';

export default function RegisterPage() {
  const [form,     setForm]     = useState({ full_name: '', email: '', mobile: '', password: '' });
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleRegister = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await authAPI.register(form);
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="register-shell" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-50)', padding: 24 }}>
      <div className="register-content" style={{ width: '100%', maxWidth: 440 }}>

        <div style={{ textAlign: 'center', marginBottom: 36 }} className="fade-up">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--green-800)', fontWeight: 700 }}>
            Anytime<span style={{ color: 'var(--green-600)' }}>Doctor</span>
          </h1>
          <p style={{ color: 'var(--gray-500)', fontSize: 14, marginTop: 6 }}>Create your health account</p>
        </div>

        <div className="card register-card fade-up-2">
          <>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 6, color: 'var(--green-900)' }}>Create Account</h2>
              <p style={{ color: 'var(--gray-500)', fontSize: 13, marginBottom: 24 }}>Fill in your details to get started</p>

              {error   && <div className="alert alert-error">{error}</div>}
              <form onSubmit={handleRegister}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" placeholder="John Doe" required
                    value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" type="email" placeholder="john@email.com"
                      value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mobile</label>
                    <input className="form-input" placeholder="9999999999"
                      value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input className="form-input" type="password" placeholder="Min 6 characters" required
                    value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
                </div>
                <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>
          </>

          <hr className="divider" />
          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--gray-500)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--green-700)', fontWeight: 500 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}