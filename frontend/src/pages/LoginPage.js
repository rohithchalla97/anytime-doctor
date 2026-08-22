import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api/api';
import { useAuth } from '../context/authcontext';

export default function LoginPage() {
  const [contact,  setContact]  = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await authAPI.login({ contact, password });
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.error || '';
      if (msg.includes('password') || msg.includes('Incorrect'))
        setError('Wrong password. Please check and try again.');
      else if (msg.includes('No account'))
        setError('No account found. Please register first.');
      else
        setError(msg || 'Login failed. Please try again.');
    }
    setLoading(false);
  };

  const features = [
    { icon: '🩺', text: 'Instant symptom analysis' },
    { icon: '👨‍⚕️', text: 'Book specialist appointments' },
    { icon: '💊', text: 'Digital prescriptions' },
    { icon: '📊', text: 'Track your health history' },
  ];

  return (
    <div className="auth-shell" style={{ minHeight: '100vh', display: 'flex', fontFamily: 'var(--font-body)' }}>

      {/* Left panel — brand */}
      <div className="auth-panel auth-brand-panel" style={{
        width: '50%', background: 'linear-gradient(145deg, #04342C 0%, #0F6E56 50%, #1D9E75 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 56px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position:'absolute', top:'-80px', right:'-80px', width:300, height:300, borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />
        <div style={{ position:'absolute', bottom:'-60px', left:'-60px', width:240, height:240, borderRadius:'50%', background:'rgba(255,255,255,0.05)' }} />
        <div style={{ position:'absolute', top:'40%', right:'10%', width:120, height:120, borderRadius:'50%', background:'rgba(255,255,255,0.03)' }} />

        <div className="slide-left" style={{ position:'relative', zIndex:1 }}>
          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:48 }}>
            <div style={{ width:44, height:44, borderRadius:12, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>🏥</div>
            <span style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:700, color:'#fff' }}>AnytimeDoctor</span>
          </div>

          <h1 style={{ fontFamily:'var(--font-display)', fontSize:38, fontWeight:700, color:'#fff', lineHeight:1.2, marginBottom:16 }}>
            Your Health,<br />Our Priority
          </h1>
          <p style={{ color:'rgba(255,255,255,0.75)', fontSize:16, lineHeight:1.7, marginBottom:44 }}>
            Access expert medical care anytime, anywhere. Describe your symptoms and get instant guidance from our intelligent health system.
          </p>

          {/* Feature list */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {features.map((f, i) => (
              <div key={i} className="page-enter" style={{ display:'flex', alignItems:'center', gap:14, animationDelay:`${i*0.08}s` }}>
                <div style={{ width:36, height:36, borderRadius:10, background:'rgba(255,255,255,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>
                  {f.icon}
                </div>
                <span style={{ color:'rgba(255,255,255,0.85)', fontSize:14, fontWeight:500 }}>{f.text}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display:'flex', gap:40, marginTop:52, paddingTop:32, borderTop:'1px solid rgba(255,255,255,0.12)' }}>
            {[
              { value:'10+', label:'Specialists' },
              { value:'24/7', label:'Available' },
              { value:'100%', label:'Secure' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontFamily:'var(--font-display)', fontSize:26, fontWeight:700, color:'#fff' }}>{s.value}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.6)', marginTop:2, fontWeight:500, textTransform:'uppercase', letterSpacing:0.8 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="auth-panel auth-form-panel" style={{
        width:'50%', background:'var(--bg)',
        display:'flex', flexDirection:'column', justifyContent:'center',
        padding:'60px 56px', overflowY:'auto',
      }}>
        <div className="auth-form-inner slide-right" style={{ maxWidth:400, width:'100%', margin:'0 auto' }}>

          <div style={{ marginBottom:36 }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:700, color:'var(--text)', marginBottom:8 }}>
              Welcome back
            </h2>
            <p style={{ color:'var(--text3)', fontSize:14 }}>
              Sign in to access your health dashboard
            </p>
            <Link to="/admin" className="btn btn-outline"
              style={{ marginTop:18, textDecoration:'none', fontSize:13 }}>
              Admin Portal →
            </Link>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom:20 }}>
              <span style={{ fontSize:18 }}>⚠</span>
              <div>
                <div style={{ fontWeight:700, fontSize:13, marginBottom:2 }}>Login Failed</div>
                <div style={{ fontSize:13 }}>{error}</div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email or Mobile Number</label>
              <input className="form-input" type="text"
                placeholder="your@email.com or 9999999999"
                value={contact} onChange={e => setContact(e.target.value)} required
                style={{ borderColor: error ? 'var(--red)' : '', fontSize:15 }} />
            </div>

            <div className="form-group">
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:7 }}>
                <label className="form-label" style={{ marginBottom:0 }}>Password</label>
              </div>
              <div style={{ position:'relative' }}>
                <input className="form-input" type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password} onChange={e => setPassword(e.target.value)} required
                  style={{ paddingRight:44, borderColor: error ? 'var(--red)' : '' }} />
                <button type="button" onClick={() => setShowPass(s=>!s)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text3)', fontSize:18 }}>
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button className="btn btn-primary btn-full btn-lg" type="submit"
              disabled={loading} style={{ marginTop:8, fontSize:15, letterSpacing:0.3 }}>
              {loading
                ? <span style={{ display:'flex', alignItems:'center', gap:8 }}><span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite', display:'inline-block' }} />Signing in...</span>
                : 'Sign In to Dashboard →'}
            </button>
          </form>

          <div style={{ display:'flex', alignItems:'center', gap:12, margin:'24px 0' }}>
            <div style={{ flex:1, height:1, background:'var(--border)' }} />
            <span style={{ fontSize:12, color:'var(--text4)', fontWeight:500 }}>OR</span>
            <div style={{ flex:1, height:1, background:'var(--border)' }} />
          </div>

          <p style={{ textAlign:'center', fontSize:14, color:'var(--text3)', marginBottom:12 }}>
            New to AnytimeDoctor?{' '}
            <Link to="/register" style={{ color:'var(--g700)', fontWeight:700 }}>Create account →</Link>
          </p>
          <p style={{ textAlign:'center', fontSize:13, color:'var(--text3)' }}>
            Medical staff?{' '}
            <Link to="/doctor/login" style={{ color:'var(--g600)', fontWeight:600 }}>Doctor Portal →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}