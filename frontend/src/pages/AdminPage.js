import React, { useEffect, useState } from 'react';
import { adminAPI } from '../api/api';

const emptyDoctor = {
  full_name: '', specialization: '', qualification: '', hospital: '', location: '',
  email: '', password: '', experience: 0, fee: 500, reg_number: '',
};

export default function AdminPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [doctorForm, setDoctorForm] = useState(emptyDoctor);
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(() => Boolean(localStorage.getItem('adminToken')));

  useEffect(() => {
    if (loggedIn) loadDoctors();
  }, [loggedIn]);

  const loadDoctors = async () => {
    const result = await adminAPI.call('/doctors');
    if (result.error) setError(result.error);
    else setDoctors(result.doctors || []);
  };

  const handleLogin = async event => {
    event.preventDefault();
    setError(''); setLoading(true);
    const result = await adminAPI.login(email, password);
    if (result.error) setError(result.error);
    else {
      localStorage.setItem('adminToken', result.token);
      setLoggedIn(true);
    }
    setLoading(false);
  };

  const handleAddDoctor = async event => {
    event.preventDefault();
    setError(''); setMessage(''); setLoading(true);
    const result = await adminAPI.call('/doctors', { method: 'POST', body: JSON.stringify(doctorForm) });
    if (result.error) setError(result.error);
    else {
      setMessage('Doctor added successfully.');
      setDoctorForm(emptyDoctor);
      setDoctors(current => [...current, result.doctor].sort((first, second) => first.full_name.localeCompare(second.full_name)));
    }
    setLoading(false);
  };

  const updateField = event => setDoctorForm({ ...doctorForm, [event.target.name]: event.target.value });

  const toggleStatus = async doctor => {
    const result = await adminAPI.call(`/doctors/${doctor.id}/status`, {
      method: 'PUT', body: JSON.stringify({ is_active: !doctor.is_active }),
    });
    if (result.error) setError(result.error);
    else setDoctors(current => current.map(item => item.id === doctor.id ? result.doctor : item));
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setLoggedIn(false);
  };

  if (!loggedIn) return (
    <div className="auth-form-panel" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg)' }}>
      <form className="card" onSubmit={handleLogin} style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--g600)', textTransform: 'uppercase', letterSpacing: 1 }}>AnytimeDoctor</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, margin: '8px 0', color: 'var(--text)' }}>Admin Portal</h1>
        <p style={{ color: 'var(--text3)', fontSize: 14, marginBottom: 24 }}>Manage doctors and their availability.</p>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="form-group"><label className="form-label">Admin Email</label><input className="form-input" type="email" value={email} onChange={event => setEmail(event.target.value)} required /></div>
        <div className="form-group"><label className="form-label">Password</label><input className="form-input" type="password" value={password} onChange={event => setPassword(event.target.value)} required /></div>
        <button className="btn btn-primary btn-full btn-lg" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
      </form>
    </div>
  );

  return (
    <div className="page-wrapper" style={{ background: 'var(--bg)' }}>
      <header className="navbar"><span className="navbar-brand">Anytime<span>Doctor</span> Admin</span><button className="btn btn-outline btn-sm" onClick={logout}>Logout</button></header>
      <main className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
        <div style={{ marginBottom: 24 }}><h1 className="section-title">Doctor Management</h1><p className="section-sub">Add doctors and control whether they are visible for appointments.</p></div>
        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 380px) 1fr', gap: 24, alignItems: 'start' }}>
          <form className="card" onSubmit={handleAddDoctor}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 21, marginBottom: 16 }}>Add New Doctor</h2>
            {[
              ['full_name', 'Full Name'], ['specialization', 'Specialization'], ['qualification', 'Qualification'],
              ['hospital', 'Hospital'], ['location', 'Location'], ['email', 'Email'], ['password', 'Password'],
              ['reg_number', 'Registration Number'],
            ].map(([name, label]) => <div className="form-group" key={name}><label className="form-label">{label}</label><input className="form-input" name={name} type={name === 'email' ? 'email' : name === 'password' ? 'password' : 'text'} value={doctorForm[name]} onChange={updateField} required={!['reg_number'].includes(name)} /></div>)}
            <div className="grid-2"><div className="form-group"><label className="form-label">Experience</label><input className="form-input" name="experience" type="number" min="0" value={doctorForm.experience} onChange={updateField} /></div><div className="form-group"><label className="form-label">Fee (INR)</label><input className="form-input" name="fee" type="number" min="0" value={doctorForm.fee} onChange={updateField} /></div></div>
            <button className="btn btn-primary btn-full" disabled={loading}>{loading ? 'Saving...' : 'Add Doctor'}</button>
          </form>
          <section className="card"><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}><h2 style={{ fontFamily: 'var(--font-display)', fontSize: 21 }}>Doctors</h2><span className="tag">{doctors.length} total</span></div>{doctors.length === 0 ? <p style={{ color: 'var(--text3)' }}>No doctors found.</p> : doctors.map(doctor => <div key={doctor.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, padding: '14px 0', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}><div><div style={{ fontWeight: 700, color: 'var(--text)' }}>{doctor.full_name}</div><div style={{ fontSize: 12, color: 'var(--text3)' }}>{doctor.specialization} · {doctor.email}</div></div><button className={doctor.is_active ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'} onClick={() => toggleStatus(doctor)}>{doctor.is_active ? 'Online' : 'Offline'}</button></div>)}</section>
        </div>
      </main>
    </div>
  );
}
