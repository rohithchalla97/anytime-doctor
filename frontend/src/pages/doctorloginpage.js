import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { doctorAPI } from '../api/api';

const DEMO_DOCTORS = [
  { name:'Dr. Rajesh Sharma', spec:'General Physician', email:'rajesh@atd.com', exp:'12 yrs' },
  { name:'Dr. Priya Mehta',   spec:'Cardiologist',      email:'priya@atd.com',  exp:'15 yrs' },
  { name:'Dr. Anil Patel',    spec:'Neurologist',       email:'anil@atd.com',   exp:'10 yrs' },
  { name:'Dr. Sneha Joshi',   spec:'Dermatologist',     email:'sneha@atd.com',  exp:'8 yrs'  },
];

export default function DoctorLoginPage() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const data = await doctorAPI.login(email, password);
      if (data.error) {
        setError(data.error?.includes('password') || data.error?.includes('Invalid')
          ? 'Invalid email or password. Please try again.'
          : data.error || 'Login failed.');
      } else if (data.token) {
        localStorage.setItem('doctorToken', data.token);
        localStorage.setItem('doctorData',  JSON.stringify(data.doctor));
        navigate('/doctor/dashboard');
      }
    } catch {
      setError('Cannot connect to server. Make sure Flask is running on port 5000.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-shell" style={{ minHeight:'100vh', display:'flex', fontFamily:'var(--font-body)' }}>

      {/* Left — form */}
      <div className="auth-panel auth-form-panel" style={{
        width:'50%', background:'var(--bg)',
        display:'flex', flexDirection:'column', justifyContent:'center',
        padding:'60px 56px', overflowY:'auto',
      }}>
        <div className="auth-form-inner slide-left" style={{ maxWidth:400, width:'100%', margin:'0 auto' }}>

          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:40 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:'var(--g50)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, border:'1px solid var(--g100)' }}>🏥</div>
            <div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:17, fontWeight:700, color:'var(--g800)' }}>AnytimeDoctor</div>
              <div style={{ fontSize:11, color:'var(--text3)', fontWeight:500 }}>Medical Staff Portal</div>
            </div>
          </div>

          <h2 style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:700, color:'var(--text)', marginBottom:8 }}>
            Doctor Sign In
          </h2>
          <p style={{ color:'var(--text3)', fontSize:14, marginBottom:28 }}>
            Access your patient cases, write prescriptions and manage your schedule
          </p>

          {error && (
            <div className="alert alert-error">
              <span style={{ fontSize:18 }}>⚠</span>
              <div>
                <div style={{ fontWeight:700, fontSize:13 }}>Authentication Failed</div>
                <div style={{ fontSize:13, marginTop:2 }}>{error}</div>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Doctor Email</label>
              <input className="form-input" type="email" placeholder="doctor@atd.com"
                value={email} onChange={e => setEmail(e.target.value)} required
                style={{ borderColor: error ? 'var(--red)' : '' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
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
              disabled={loading} style={{ marginTop:8 }}>
              {loading
                ? <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite', display:'inline-block' }}/>
                    Signing in...
                  </span>
                : 'Access Portal →'}
            </button>
          </form>

          <hr className="divider" />
          <p style={{ textAlign:'center', fontSize:13, color:'var(--text3)' }}>
            Patient login?{' '}
            <Link to="/login" style={{ color:'var(--g700)', fontWeight:600 }}>Go here →</Link>
          </p>
        </div>
      </div>

      {/* Right — doctor cards */}
      <div className="auth-panel auth-brand-panel" style={{
        width:'50%',
        background:'linear-gradient(145deg, #085041 0%, #0F6E56 40%, #1D9E75 100%)',
        display:'flex', flexDirection:'column', justifyContent:'center',
        padding:'60px 48px', position:'relative', overflow:'hidden',
      }}>
        <div style={{ position:'absolute', top:'-60px', right:'-60px', width:250, height:250, borderRadius:'50%', background:'rgba(255,255,255,0.05)' }} />
        <div style={{ position:'absolute', bottom:'-40px', left:'-40px', width:180, height:180, borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />

        <div style={{ position:'relative', zIndex:1 }} className="slide-right">
          <div style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,0.6)', textTransform:'uppercase', letterSpacing:1.2, marginBottom:10 }}>
            Demo Access
          </div>
          <h3 style={{ fontFamily:'var(--font-display)', fontSize:24, color:'#fff', marginBottom:6, fontWeight:600 }}>
            Quick Login
          </h3>
          <p style={{ color:'rgba(255,255,255,0.7)', fontSize:13, marginBottom:28 }}>
            Click any doctor to auto-fill credentials. Password: <code style={{ background:'rgba(255,255,255,0.15)', padding:'1px 6px', borderRadius:4 }}>doctor123</code>
          </p>

          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {DEMO_DOCTORS.map((d, i) => (
              <button key={i} onClick={() => { setEmail(d.email); setPassword('doctor123'); }}
                className="page-enter"
                style={{
                  animationDelay:`${i*0.07}s`,
                  background:'rgba(255,255,255,0.1)',
                  border:'1px solid rgba(255,255,255,0.15)',
                  borderRadius:12, padding:'14px 16px',
                  cursor:'pointer', textAlign:'left',
                  display:'flex', justifyContent:'space-between', alignItems:'center',
                  transition:'all 0.2s',
                  backdropFilter:'blur(8px)',
                }}
                onMouseOver={e => { e.currentTarget.style.background='rgba(255,255,255,0.18)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.3)'; }}
                onMouseOut={e  => { e.currentTarget.style.background='rgba(255,255,255,0.1)';  e.currentTarget.style.borderColor='rgba(255,255,255,0.15)'; }}>
                <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                  <div style={{ width:40, height:40, borderRadius:10, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-display)', fontWeight:700, color:'#fff', fontSize:14 }}>
                    {d.name.split(' ').filter(n=>n!=='Dr.').map(n=>n[0]).join('').slice(0,2)}
                  </div>
                  <div>
                    <div style={{ fontWeight:600, color:'#fff', fontSize:14 }}>{d.name}</div>
                    <div style={{ fontSize:12, color:'rgba(255,255,255,0.65)', marginTop:1 }}>{d.spec} · {d.exp}</div>
                  </div>
                </div>
                <span style={{ color:'rgba(255,255,255,0.5)', fontSize:18 }}>→</span>
              </button>
            ))}
          </div>

          {/* Portal features */}
          <div style={{ marginTop:32, paddingTop:24, borderTop:'1px solid rgba(255,255,255,0.12)' }}>
            <div style={{ display:'flex', gap:24, flexWrap:'wrap' }}>
              {[
                { icon:'📋', text:'Patient Cases' },
                { icon:'💊', text:'Prescriptions' },
                { icon:'📅', text:'Schedule' },
                { icon:'📊', text:'Analytics' },
              ].map(f => (
                <div key={f.text} style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ fontSize:14 }}>{f.icon}</span>
                  <span style={{ fontSize:12, color:'rgba(255,255,255,0.7)', fontWeight:500 }}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}