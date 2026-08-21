import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authcontext';
import { useTheme } from '../context/themecontext';

export default function Navbar() {
  const { user, logout, isLoggedIn } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const isActive = path => location.pathname === path ? 'nav-link active' : 'nav-link';
  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = user?.full_name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) || 'U';

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <Link to={isLoggedIn ? '/dashboard' : '/'} className="navbar-brand">
        Anytime<span>Doctor</span>
      </Link>

      <div className="navbar-links" style={{ display:'flex', alignItems:'center', gap:4 }}>
        {isLoggedIn && (
          <>
            <Link to="/dashboard"    className={isActive('/dashboard')}>Dashboard</Link>
            <Link to="/chat"         className={isActive('/chat')}>Symptoms</Link>
            <Link to="/doctors"      className={isActive('/doctors')}>Doctors</Link>
            <Link to="/appointments" className={isActive('/appointments')}>Appointments</Link>
            <div style={{ width:1, height:22, background:'var(--border2)', margin:'0 6px' }} />
          </>
        )}

        <button onClick={toggle} title={dark?'Light mode':'Dark mode'}
          style={{ width:44, height:24, borderRadius:12, border:'none', cursor:'pointer',
            background: dark?'var(--g600)':'var(--border2)', position:'relative',
            transition:'all 0.3s', padding:0, flexShrink:0 }}>
          <span style={{ position:'absolute', top:3, left:dark?23:3, width:18, height:18,
            borderRadius:'50%', background:'#fff', transition:'left 0.3s',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:10,
            boxShadow:'0 1px 4px rgba(0,0,0,0.2)' }}>
            {dark?'🌙':'☀️'}
          </span>
        </button>

        {isLoggedIn ? (
          <>
            <Link to="/profile" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:8, marginLeft:8 }}>
              <div className="avatar-placeholder" style={{ width:34, height:34, fontSize:12 }}>
                {user?.photo_url
                  ? <img src={user.photo_url} alt="" className="avatar" style={{ width:34, height:34 }} />
                  : initials}
              </div>
              <span style={{ fontSize:13, fontWeight:600, color:'var(--text2)' }}>
                {user?.full_name?.split(' ')[0]}
              </span>
            </Link>
            <button className="btn btn-outline btn-sm" onClick={handleLogout} style={{ marginLeft:4 }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login"    className={isActive('/login')} style={{ marginLeft:8 }}>Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
}