import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authcontext';
import { appointmentAPI, authAPI } from '../api/api';
import Navbar from '../components/navbar';

const tips = [
  'Drink at least 8 glasses of water daily.',
  'Walk for 30 minutes every day to maintain heart health.',
  'Sleep 7–8 hours for better immunity and focus.',
  'Eat more fruits and vegetables — aim for 5 portions daily.',
  'Avoid skipping breakfast — it keeps your energy stable.',
  'Regular health checkups can catch issues before they worsen.',
  'Limit screen time before bed for better sleep quality.',
];

const ACTIONS = [
  {
    to: '/chat',
    emoji: '🩺',
    title: 'Check Symptoms',
    desc: 'Describe how you feel and get instant guidance',
    accent: '#1D9E75',
    bg: 'rgba(29,158,117,0.12)',
    border: 'rgba(29,158,117,0.35)',
  },
  {
    to: '/doctors',
    emoji: '👨‍⚕️',
    title: 'Find Doctors',
    desc: 'Browse specialists and book appointments',
    accent: '#D85A30',
    bg: 'rgba(216,90,48,0.12)',
    border: 'rgba(216,90,48,0.35)',
  },
  {
    to: '/appointments',
    emoji: '📅',
    title: 'My Appointments',
    desc: 'View and manage your bookings',
    accent: '#BA7517',
    bg: 'rgba(186,117,23,0.12)',
    border: 'rgba(186,117,23,0.35)',
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [profile,      setProfile]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const tip     = tips[new Date().getDay() % tips.length];
  const initials = user?.full_name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) || 'U';

  useEffect(() => {
    Promise.all([
      appointmentAPI.myAppointments(),
      authAPI.profile(),
    ]).then(([apptRes, profRes]) => {
      setAppointments(apptRes.data.appointments.slice(0, 3));
      setProfile(profRes.data.user);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const isProfileComplete = profile?.age && profile?.blood_group && profile?.weight;

  const statusBadge = s => <span className={`badge badge-${s?.toLowerCase()}`}>{s}</span>;
  const sevBadge    = s => <span className={`badge badge-${s?.toLowerCase()}`}>{s}</span>;

  return (
    <div className="page-wrapper page-enter">
      <Navbar />

      {/* Hero */}
      <div className="page-hero">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
            <div className="slide-left">
              <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 8, fontWeight: 500 }}>
                {getGreeting()} · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, marginBottom: 6 }}>
                Welcome back, {user?.full_name?.split(' ')[0]} 👋
              </h1>
              <p style={{ opacity: 0.75 }}>How are you feeling today?</p>
            </div>
            <div className="slide-right">
              <Link to="/profile" style={{ textDecoration: 'none' }}>
                <div className="avatar-placeholder" style={{ width: 64, height: 64, fontSize: 22 }}>
                  {profile?.photo_url
                    ? <img src={profile.photo_url} alt="" className="avatar" style={{ width: 64, height: 64 }} />
                    : initials}
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>

        {/* Profile incomplete warning */}
        {!loading && !isProfileComplete && (
          <div className="alert alert-warning slide-left" style={{ marginBottom: 28 }}>
            📋 Your health profile is incomplete.
            <Link to="/profile" style={{ marginLeft: 10, fontWeight: 700, color: 'var(--amber)' }}>
              Complete it now →
            </Link>
          </div>
        )}

        {/* Health stats */}
        {profile?.age && (
          <div className="grid-4 slide-left" style={{ marginBottom: 32 }}>
            {[
              { icon: '🎂', label: 'Age',         value: `${profile.age} yrs`,         color: 'var(--g600)' },
              { icon: '⚖️', label: 'Weight',      value: profile.weight ? `${profile.weight} kg` : '—', color: 'var(--amber)' },
              { icon: '🩸', label: 'Blood Group', value: profile.blood_group || '—',   color: 'var(--red)' },
              { icon: '📊', label: 'BMI',         value: profile.bmi || '—',           color: profile.bmi_category === 'Normal' ? 'var(--g600)' : 'var(--amber)' },
            ].map((s, i) => (
              <div key={i} className="stat-card page-enter" style={{ animationDelay: `${i*0.06}s` }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
                <div className="stat-value" style={{ color: s.color, fontSize: 20 }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Quick actions */}
        <div style={{ marginBottom: 10 }}>
          <div className="section-title">Quick Actions</div>
          <div className="section-sub">What would you like to do today?</div>
        </div>

        <div className="grid-3 slide-left" style={{ marginBottom: 36 }}>
          {ACTIONS.map((a, i) => (
            <Link key={i} to={a.to} style={{ textDecoration: 'none' }}>
              <div
                className="page-enter"
                style={{
                  background: 'var(--bg2)',
                  border: `1.5px solid ${a.border}`,
                  borderTop: `3px solid ${a.accent}`,
                  borderRadius: 'var(--r)',
                  padding: 24,
                  cursor: 'pointer',
                  transition: 'var(--t)',
                  animationDelay: `${i * 0.07}s`,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0,
                }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                  e.currentTarget.style.borderColor = a.accent;
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = a.border;
                  e.currentTarget.style.borderTopColor = a.accent;
                }}
              >
                {/* Icon box */}
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: a.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, marginBottom: 16,
                  border: `1px solid ${a.border}`,
                }}>
                  {a.emoji}
                </div>

                <h3 style={{
                  fontSize: 16, fontWeight: 700,
                  color: 'var(--text)',   /* ← key fix: uses theme variable not hardcoded */
                  marginBottom: 8,
                }}>
                  {a.title}
                </h3>
                <p style={{
                  fontSize: 13,
                  color: 'var(--text3)', /* ← muted text, visible in both modes */
                  lineHeight: 1.55,
                }}>
                  {a.desc}
                </p>

                <div style={{
                  marginTop: 'auto', paddingTop: 16,
                  fontSize: 13, fontWeight: 600,
                  color: a.accent,
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  Open <span style={{ transition: 'transform 0.2s' }}>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Daily tip */}
        <div className="slide-right" style={{ marginBottom: 36 }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--g900), var(--g700))',
            borderRadius: 'var(--r)',
            padding: '20px 24px',
            display: 'flex', gap: 16, alignItems: 'flex-start',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, flexShrink: 0,
            }}>💡</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                Daily Health Tip
              </div>
              <p style={{ fontSize: 15, color: '#fff', lineHeight: 1.6 }}>{tip}</p>
            </div>
          </div>
        </div>

        {/* Recent appointments */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div className="section-title">Recent Appointments</div>
            <div className="section-sub">Your latest bookings</div>
          </div>
          <Link to="/appointments" className="btn btn-outline btn-sm">View All</Link>
        </div>

        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : appointments.length === 0 ? (
          <div style={{
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: 'var(--r)', textAlign: 'center', padding: '48px 20px',
          }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>📋</div>
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6, color: 'var(--text)' }}>
              No appointments yet
            </div>
            <p style={{ color: 'var(--text3)', fontSize: 14, marginBottom: 20 }}>
              Check your symptoms to get started
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/chat')}>
              Check Symptoms →
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {appointments.map((a, i) => (
              <div key={a.id} className="page-enter" style={{
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: 'var(--r)', padding: '16px 20px',
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', flexWrap: 'wrap', gap: 12,
                animationDelay: `${i*0.07}s`,
                transition: 'var(--t)',
              }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div className="avatar-placeholder" style={{ width: 44, height: 44, fontSize: 16 }}>
                    {a.doctor?.full_name?.split(' ').map(n=>n[0]).join('').slice(0,2) || '👨‍⚕️'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>
                      {a.doctor?.full_name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
                      {a.doctor?.specialization} · {a.date} at {a.time_slot}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {statusBadge(a.status)}
                  {sevBadge(a.severity)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}