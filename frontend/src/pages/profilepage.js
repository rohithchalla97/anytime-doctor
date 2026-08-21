import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/authcontext';
import { authAPI } from '../api/api';
import Navbar from '../components/navbar';

const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];
const GENDERS      = ['Male','Female','Other','Prefer not to say'];

export default function ProfilePage() {
  const { user, login, token } = useAuth();
  const [profile,  setProfile]  = useState(null);
  const [editing,  setEditing]  = useState(false);
  const [form,     setForm]     = useState({});
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [success,  setSuccess]  = useState('');
  const [error,    setError]    = useState('');

  useEffect(() => {
    authAPI.profile()
      .then(res => {
        setProfile(res.data.user);
        setForm(res.data.user);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true); setError(''); setSuccess('');
    try {
      const res = await authAPI.updateProfile(form);
      setProfile(res.data.user);
      setForm(res.data.user);
      login(res.data.user, token);
      setSuccess('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed.');
    } finally { setSaving(false); }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const bmiColor = cat => ({
    'Underweight': 'var(--blue)', 'Normal': 'var(--g600)',
    'Overweight': 'var(--amber)', 'Obese': 'var(--red)'
  }[cat] || 'var(--gray500)');

  const initials = profile?.full_name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) || 'U';

  if (loading) return (
    <div className="page-wrapper">
      <Navbar />
      <div className="spinner-wrap"><div className="spinner" /></div>
    </div>
  );

  return (
    <div className="page-wrapper page-enter">
      <Navbar />

      {/* Hero with profile card overlapping */}
      <div className="page-hero" style={{ paddingBottom: 80 }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div className="avatar-placeholder" style={{ width: 80, height: 80, fontSize: 28, flexShrink: 0 }}>
              {profile?.photo_url
                ? <img src={profile.photo_url} alt="" className="avatar" style={{ width: 80, height: 80 }} />
                : initials}
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
                {profile?.full_name}
              </h1>
              <p style={{ opacity: 0.75, fontSize: 14 }}>
                {profile?.email || profile?.mobile} · Member since {profile?.created_at?.split('-')[0]}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: -44, paddingBottom: 48 }}>

        {/* Health stats bar */}
        <div className="grid-4 slide-in-left" style={{ marginBottom: 28 }}>
          {[
            { label: 'Age', value: profile?.age ? `${profile.age} yrs` : '—', icon: '🎂', color: 'var(--g600)' },
            { label: 'Weight', value: profile?.weight ? `${profile.weight} kg` : '—', icon: '⚖️', color: 'var(--amber)' },
            { label: 'Height', value: profile?.height ? `${profile.height} cm` : '—', icon: '📏', color: 'var(--blue)' },
            { label: 'Blood Group', value: profile?.blood_group || '—', icon: '🩸', color: 'var(--red)' },
          ].map((s, i) => (
            <div key={i} className="stat-card" style={{ animationDelay: `${i*0.06}s` }}>
              <div style={{ fontSize: 26, marginBottom: 8 }}>{s.icon}</div>
              <div className="stat-value" style={{ color: s.color, fontSize: 22 }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* BMI card */}
        {profile?.bmi && (
          <div className="card slide-in-right" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray500)', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>Body Mass Index</div>
              <div style={{ fontSize: 42, fontWeight: 700, fontFamily: 'var(--font-display)', color: bmiColor(profile.bmi_category), lineHeight: 1 }}>
                {profile.bmi}
              </div>
              <div style={{ fontSize: 14, color: bmiColor(profile.bmi_category), fontWeight: 600, marginTop: 4 }}>
                {profile.bmi_category}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--gray500)', marginBottom: 6, fontWeight: 600 }}>
                <span>Underweight</span><span>Normal</span><span>Overweight</span><span>Obese</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{
                  width: `${Math.min((profile.bmi / 40) * 100, 100)}%`,
                  background: bmiColor(profile.bmi_category)
                }} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--gray500)', marginTop: 6 }}>
                Healthy range: 18.5 – 24.9
              </div>
            </div>
          </div>
        )}

        {/* Profile details */}
        <div className="card page-enter" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <div className="section-title" style={{ marginBottom: 2 }}>Personal Information</div>
              <div style={{ fontSize: 13, color: 'var(--gray500)' }}>Your health profile details</div>
            </div>
            {!editing
              ? <button className="btn btn-primary btn-sm" onClick={() => setEditing(true)}>Edit Profile</button>
              : <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(false); setForm(profile); }}>Cancel</button>
                  <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
            }
          </div>

          {success && <div className="alert alert-success">✓ {success}</div>}
          {error   && <div className="alert alert-error">✕ {error}</div>}

          {editing ? (
            <div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={form.full_name || ''} onChange={e => set('full_name', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile</label>
                  <input className="form-input" value={form.mobile || ''} onChange={e => set('mobile', e.target.value)} />
                </div>
              </div>
              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input className="form-input" type="number" min="1" max="120" value={form.age || ''} onChange={e => set('age', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-input form-select" value={form.gender || ''} onChange={e => set('gender', e.target.value)}>
                    <option value="">Select</option>
                    {GENDERS.map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <select className="form-input form-select" value={form.blood_group || ''} onChange={e => set('blood_group', e.target.value)}>
                    <option value="">Select</option>
                    {BLOOD_GROUPS.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Weight (kg)</label>
                  <input className="form-input" type="number" step="0.1" value={form.weight || ''} onChange={e => set('weight', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Height (cm)</label>
                  <input className="form-input" type="number" step="0.1" value={form.height || ''} onChange={e => set('height', e.target.value)} />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Allergies</label>
                  <input className="form-input" placeholder="e.g. Penicillin, Pollen" value={form.allergies || ''} onChange={e => set('allergies', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Chronic Conditions</label>
                  <input className="form-input" placeholder="e.g. Diabetes, Hypertension" value={form.chronic_conditions || ''} onChange={e => set('chronic_conditions', e.target.value)} />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Emergency Contact</label>
                  <input className="form-input" placeholder="Mobile number" value={form.emergency_contact || ''} onChange={e => set('emergency_contact', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input className="form-input" placeholder="City, State" value={form.address || ''} onChange={e => set('address', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Profile Photo URL</label>
                <input className="form-input" placeholder="https://..." value={form.photo_url || ''} onChange={e => set('photo_url', e.target.value)} />
              </div>
            </div>
          ) : (
            <div>
              <div className="grid-2">
                {[
                  { label: 'Full Name',   value: profile?.full_name },
                  { label: 'Email',       value: profile?.email },
                  { label: 'Mobile',      value: profile?.mobile },
                  { label: 'Gender',      value: profile?.gender },
                  { label: 'Age',         value: profile?.age ? `${profile.age} years` : null },
                  { label: 'Blood Group', value: profile?.blood_group },
                  { label: 'Weight',      value: profile?.weight ? `${profile.weight} kg` : null },
                  { label: 'Height',      value: profile?.height ? `${profile.height} cm` : null },
                  { label: 'Address',     value: profile?.address },
                  { label: 'Emergency Contact', value: profile?.emergency_contact },
                ].map(({ label, value }) => (
                  <div key={label} style={{ padding: '14px 0', borderBottom: '1px solid var(--gray100)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray500)', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 15, color: value ? 'var(--gray900)' : 'var(--gray300)', fontStyle: value ? 'normal' : 'italic' }}>
                      {value || 'Not provided'}
                    </div>
                  </div>
                ))}
              </div>
              {profile?.allergies && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray500)', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>Allergies</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {profile.allergies.split(',').map(a => <span key={a} className="tag" style={{ background: 'var(--red-lt)', color: 'var(--red)' }}>{a.trim()}</span>)}
                  </div>
                </div>
              )}
              {profile?.chronic_conditions && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray500)', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>Chronic Conditions</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {profile.chronic_conditions.split(',').map(c => <span key={c} className="tag" style={{ background: 'var(--amber-lt)', color: 'var(--amber)' }}>{c.trim()}</span>)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {!profile?.age && !editing && (
          <div className="alert alert-info">
            ℹ️ Complete your profile to get better health recommendations.
            <button className="btn btn-primary btn-sm" style={{ marginLeft: 12 }} onClick={() => setEditing(true)}>
              Complete Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}