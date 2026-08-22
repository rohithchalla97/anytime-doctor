import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiBaseUrl, doctorAPI } from '../api/api';

const DAYS  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const SLOTS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'];
const GENDERS = ['Male','Female','Other'];
const CONSULT_TYPES = ['In-Person','Online','Both'];
const LANGS = ['English','Hindi','Gujarati','Marathi','Tamil','Telugu','Bengali','Punjabi'];

const VIEWS = [
  { id:'overview',     label:'Overview',      icon:'D' },
  { id:'patients',     label:'Patients',      icon:'P' },
  { id:'prescribe',    label:'Prescription',  icon:'Rx' },
  { id:'availability', label:'Schedule',      icon:'S' },
  { id:'profile',      label:'My Profile',    icon:'Me' },
];

export default function DoctorDashboard() {
  const [view, setView]               = useState('overview');
  const [doctor, setDoctor]           = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [selected, setSelected]       = useState(null);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [msg, setMsg]                 = useState({ type:'', text:'' });
  const [filter, setFilter]           = useState('ALL');
  const [dark, setDark]               = useState(() => localStorage.getItem('doctorTheme')==='dark');
  const [rx, setRx]                   = useState({ diagnosis:'', advice:'', follow_up_date:'' });
  const [meds, setMeds]               = useState([{ name:'', dosage:'', duration:'', instructions:'' }]);
  const [selDays, setSelDays]         = useState([]);
  const [selSlots, setSelSlots]       = useState([]);
  const [pf, setPf]                   = useState({});
  const [editProfile, setEditProfile] = useState(false);
  const [selLangs, setSelLangs]       = useState([]);

  const navigate = useNavigate();
  const token    = localStorage.getItem('doctorToken');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('doctorTheme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    if (!token) { navigate('/doctor/login'); return; }
    loadAll();
  }, []);

  const api = (url, opts={}) => doctorAPI.call(url, opts);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [p, a] = await Promise.all([api('/profile'), api('/patients')]);
      if (p.doctor) {
        setDoctor(p.doctor); setPf(p.doctor);
        setSelLangs(p.doctor.languages || []);
        setSelDays(p.doctor.available_days || []);
        setSelSlots(p.doctor.slots || []);
      }
      setAppointments(a.appointments || []);
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  const showMsg = (type, text) => { setMsg({type,text}); setTimeout(()=>setMsg({type:'',text:''}), 4000); };

  const handlePrescribe = async () => {
    if (!selected || !rx.diagnosis) return;
    setSaving(true);
    const res = await api('/prescribe', { method:'POST', body:JSON.stringify({ appointment_id:selected.id, ...rx, medicines:meds }) });
    setSaving(false);
    if (res.error) showMsg('error', res.error);
    else { showMsg('success', 'Prescription saved and PDF generated!'); loadAll(); setView('patients'); setSelected(null); }
  };

  const handleAvailability = async () => {
    setSaving(true);
    const res = await api('/availability', { method:'PUT', body:JSON.stringify({ available_days:selDays, slots:selSlots }) });
    setSaving(false);
    res.error ? showMsg('error', res.error) : showMsg('success', 'Schedule saved!');
  };

  const handleProfileSave = async () => {
    setSaving(true);
    const res = await api('/profile/update', { method:'PUT', body:JSON.stringify({ ...pf, languages: selLangs.join(',') }) });
    setSaving(false);
    if (res.error) showMsg('error', res.error);
    else { setDoctor(res.doctor); setPf(res.doctor); setSelLangs(res.doctor.languages||[]); showMsg('success', 'Profile updated!'); setEditProfile(false); }
  };

  const startRx = appt => { setSelected(appt); setRx({diagnosis:'',advice:'',follow_up_date:''}); setMeds([{name:'',dosage:'',duration:'',instructions:''}]); setView('prescribe'); };

  const today     = new Date().toISOString().split('T')[0];
  const todayA    = appointments.filter(a => a.date === today);
  const upcoming  = appointments.filter(a => a.date > today && a.status !== 'CANCELLED');
  const completed = appointments.filter(a => a.status === 'COMPLETED');
  const pending   = appointments.filter(a => ['PENDING','CONFIRMED'].includes(a.status));
  const filteredA = filter==='ALL' ? appointments : filter==='TODAY' ? todayA : appointments.filter(a=>a.status===filter);
  const sColor    = s => ({HIGH:'var(--red)',MEDIUM:'var(--amber)',LOW:'var(--g600)'}[s]||'var(--text3)');
  const initials  = doctor?.full_name?.split(' ').filter(n=>n!=='Dr.').map(n=>n[0]).join('').slice(0,2)||'DR';

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', flexDirection:'column', gap:14 }}>
      <div style={{ width:44, height:44, border:'3px solid var(--border)', borderTopColor:'var(--g600)', borderRadius:'50%', animation:'spin 0.7s linear infinite' }}/>
      <div style={{ color:'var(--text3)', fontSize:14 }}>Loading portal...</div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', flexDirection:'column', fontFamily:'var(--font-body)' }}>
      <nav style={{ background:'var(--bg2)', borderBottom:'1px solid var(--border)', padding:'0 24px', height:64, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:300, boxShadow:'var(--shadow-sm)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:36, height:36, borderRadius:9, background:'linear-gradient(135deg,var(--g800),var(--g600))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🏥</div>
          <div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:700, color:'var(--g700)' }}>Doctor Portal</div>
            <div style={{ fontSize:11, color:'var(--text3)' }}>AnytimeDoctor</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {todayA.length>0 && <div style={{ background:'var(--amber-lt)', padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:600, color:'var(--amber)' }}>📅 {todayA.length} today</div>}
          <button onClick={()=>setDark(d=>!d)} title="Toggle dark mode"
            style={{ width:44, height:24, borderRadius:12, border:'none', cursor:'pointer', background:dark?'var(--g600)':'var(--border2)', position:'relative', transition:'all 0.3s', padding:0, flexShrink:0 }}>
            <span style={{ position:'absolute', top:3, left:dark?23:3, width:18, height:18, borderRadius:'50%', background:'#fff', transition:'left 0.3s', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9 }}>{dark?'🌙':'☀️'}</span>
          </button>
          <button className="btn btn-ghost btn-sm" onClick={()=>window.open(`${apiBaseUrl}/doctor/export`,'_blank')}>📊 Export</button>
          {doctor && (
            <button onClick={()=>setView('profile')} style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 10px', background:'var(--bg3)', borderRadius:10, border:'1px solid var(--border)', cursor:'pointer', transition:'var(--t)' }}>
              <div style={{ width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,var(--g700),var(--g400))', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontFamily:'var(--font-display)', fontSize:11 }}>
                {doctor.photo_url?<img src={doctor.photo_url} alt="" style={{ width:30, height:30, borderRadius:'50%', objectFit:'cover' }}/>:initials}
              </div>
              <div>
                <div style={{ fontSize:12, fontWeight:600, color:'var(--text)' }}>{doctor.full_name}</div>
                <div style={{ fontSize:10, color:'var(--text3)' }}>{doctor.specialization}</div>
              </div>
            </button>
          )}
          <button className="btn btn-outline btn-sm" onClick={()=>{localStorage.removeItem('doctorToken');navigate('/doctor/login');}}>Logout</button>
        </div>
      </nav>

      <div style={{ display:'flex', flex:1 }}>
        <aside style={{ width:210, background:'var(--bg2)', borderRight:'1px solid var(--border)', padding:'14px 0', flexShrink:0, display:'flex', flexDirection:'column' }}>
          <div style={{ padding:'0 12px 14px', borderBottom:'1px solid var(--border)' }}>
            {VIEWS.map(v=>(
              <button key={v.id} onClick={()=>setView(v.id)}
                style={{ width:'100%', padding:'10px 12px', border:'none', borderRadius:8, margin:'2px 0', background:view===v.id?'var(--g50)':'transparent', color:view===v.id?'var(--g700)':'var(--text2)', textAlign:'left', fontSize:14, fontWeight:view===v.id?700:400, cursor:'pointer', display:'flex', alignItems:'center', gap:10, borderLeft:view===v.id?'3px solid var(--g600)':'3px solid transparent', transition:'var(--t)', fontFamily:'var(--font-body)' }}>
                <span style={{ fontSize:12, fontWeight:700, width:24, textAlign:'center', color:view===v.id?'var(--g700)':'var(--text4)' }}>{v.icon}</span>{v.label}
              </button>
            ))}
          </div>
          <div style={{ padding:'14px 12px', flex:1 }}>
            {[{l:'Today',v:todayA.length,c:'var(--g600)'},{l:'Pending',v:pending.length,c:'var(--amber)'},{l:'Done',v:completed.length,c:'var(--blue)'},{l:'Total',v:appointments.length,c:'var(--text2)'}].map(s=>(
              <div key={s.l} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8, padding:'6px 8px', borderRadius:6, background:'var(--bg3)' }}>
                <span style={{ fontSize:12, color:'var(--text3)' }}>{s.l}</span>
                <span style={{ fontSize:17, fontWeight:700, color:s.c, fontFamily:'var(--font-display)' }}>{s.v}</span>
              </div>
            ))}
          </div>
          {doctor && (
            <div style={{ padding:'0 12px 12px' }}>
              <div style={{ padding:10, background:'var(--g50)', borderRadius:8, border:'1px solid var(--g100)', fontSize:12, color:'var(--text2)', lineHeight:1.9 }}>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--g700)', marginBottom:6, textTransform:'uppercase', letterSpacing:0.5 }}>Quick Info</div>
                <div>🏥 {doctor.hospital?.split(',')[0]}</div>
                <div>💰 ₹{doctor.fee}/consult</div>
                {doctor.consultation_type && <div>💬 {doctor.consultation_type}</div>}
              </div>
            </div>
          )}
        </aside>

        <main style={{ flex:1, padding:24, overflow:'auto' }}>
          {msg.text && <div className={`alert alert-${msg.type==='error'?'error':'success'} scale-in`} style={{ marginBottom:16 }}>{msg.text}</div>}

          {view==='overview' && (
            <div className="page-enter">
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:13, color:'var(--text3)', marginBottom:3 }}>{new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}</div>
                <div className="section-title">Good {getGreeting()}, {doctor?.full_name?.split(' ').slice(0,2).join(' ')} 👋</div>
                <div className="section-sub">Your practice overview</div>
              </div>
              <div className="grid-4" style={{ marginBottom:24 }}>
                {[{icon:'👥',l:'Total',v:appointments.length,c:'var(--g600)',d:0},{icon:'📅',l:'Today',v:todayA.length,c:'var(--amber)',d:0.06},{icon:'✅',l:'Completed',v:completed.length,c:'var(--blue)',d:0.12},{icon:'⏳',l:'Pending',v:pending.length,c:'var(--coral)',d:0.18}].map(s=>(
                  <div key={s.l} className="stat-card page-enter" style={{ display:'flex', gap:12, alignItems:'center', animationDelay:`${s.d}s` }}>
                    <div style={{ width:46, height:46, borderRadius:12, background:`${s.c}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0, border:`1px solid ${s.c}30` }}>{s.icon}</div>
                    <div>
                      <div style={{ fontSize:26, fontWeight:700, color:s.c, fontFamily:'var(--font-display)', lineHeight:1 }}>{s.v}</div>
                      <div style={{ fontSize:10, color:'var(--text3)', fontWeight:600, textTransform:'uppercase', letterSpacing:0.5, marginTop:2 }}>{s.l}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:20 }}>
                <div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                    <div><div className="section-title" style={{ fontSize:17 }}>Today's Schedule</div><div className="section-sub" style={{ marginBottom:0 }}>{todayA.length} patients</div></div>
                    <button className="btn btn-outline btn-sm" onClick={()=>setView('patients')}>View All →</button>
                  </div>
                  {todayA.length===0 ? (
                    <div className="card" style={{ textAlign:'center', padding:40, color:'var(--text3)' }}><div style={{ fontSize:36, marginBottom:10 }}>📋</div><div style={{ fontWeight:600, color:'var(--text2)' }}>No patients today</div></div>
                  ) : todayA.map((a,i)=>(
                    <div key={a.id} className="card page-enter" style={{ padding:14, marginBottom:10, animationDelay:`${i*0.05}s`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                        <div style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,var(--g700),var(--g400))', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontFamily:'var(--font-display)', fontSize:13, flexShrink:0 }}>
                          {a.patient?.full_name?.split(' ').map(n=>n[0]).join('').slice(0,2)||'P'}
                        </div>
                        <div>
                          <div style={{ fontWeight:600, color:'var(--text)', fontSize:14 }}>{a.patient?.full_name}</div>
                          <div style={{ fontSize:11, color:'var(--text3)' }}>🕐 {a.time_slot} · {a.patient?.age||''}yrs · {a.patient?.blood_group||'N/A'}</div>
                          {a.symptoms&&<div style={{ fontSize:11, color:'var(--text4)', marginTop:1 }}>"{a.symptoms.slice(0,45)}{a.symptoms.length>45?'...':''}"</div>}
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:6 }}>
                        <span className={`badge badge-${a.status?.toLowerCase()}`}>{a.status}</span>
                        {a.status!=='COMPLETED'&&a.status!=='CANCELLED'&&<button className="btn btn-primary btn-sm" onClick={()=>startRx(a)}>Prescribe</button>}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  {doctor && (
                    <div className="card" style={{ background:'linear-gradient(135deg,var(--g900),var(--g700))', border:'none', padding:18 }}>
                      <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:14 }}>
                        <div style={{ width:48, height:48, borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontFamily:'var(--font-display)', fontSize:16, flexShrink:0 }}>
                          {doctor.photo_url?<img src={doctor.photo_url} alt="" style={{ width:48, height:48, borderRadius:'50%', objectFit:'cover' }}/>:initials}
                        </div>
                        <div>
                          <div style={{ fontFamily:'var(--font-display)', fontSize:15, fontWeight:700, color:'#fff' }}>{doctor.full_name}</div>
                          <div style={{ fontSize:11, color:'rgba(255,255,255,0.7)' }}>{doctor.specialization}</div>
                          {doctor.reg_number&&<div style={{ fontSize:10, color:'rgba(255,255,255,0.5)' }}>Reg: {doctor.reg_number}</div>}
                        </div>
                      </div>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                        {[{v:`₹${doctor.fee}`,l:'Fee'},{v:`⭐${doctor.rating}`,l:'Rating'},{v:`${doctor.experience}y`,l:'Exp'}].map(s=>(
                          <div key={s.l} style={{ background:'rgba(255,255,255,0.12)', borderRadius:7, padding:'7px', textAlign:'center' }}>
                            <div style={{ fontSize:14, fontWeight:700, color:'#fff' }}>{s.v}</div>
                            <div style={{ fontSize:9, color:'rgba(255,255,255,0.6)', marginTop:1 }}>{s.l}</div>
                          </div>
                        ))}
                      </div>
                      <button className="btn btn-sm btn-full" onClick={()=>setView('profile')} style={{ marginTop:10, background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.2)', color:'#fff', fontSize:11 }}>View Full Profile →</button>
                    </div>
                  )}
                  <div className="card" style={{ padding:16 }}>
                    <div style={{ fontWeight:700, fontSize:13, color:'var(--text)', marginBottom:10 }}>Upcoming ({upcoming.length})</div>
                    {upcoming.slice(0,4).length===0 ? <div style={{ fontSize:12, color:'var(--text3)', textAlign:'center', padding:'8px 0' }}>None scheduled</div>
                    : upcoming.slice(0,4).map(a=>(
                      <div key={a.id} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid var(--border)', alignItems:'center' }}>
                        <div><div style={{ fontSize:12, fontWeight:600, color:'var(--text)' }}>{a.patient?.full_name}</div><div style={{ fontSize:10, color:'var(--text3)' }}>{a.date} · {a.time_slot}</div></div>
                        <span style={{ fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:10, background:`${sColor(a.severity)}18`, color:sColor(a.severity) }}>{a.severity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {view==='patients' && (
            <div className="page-enter">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
                <div><div className="section-title">All Patients</div><div className="section-sub">{filteredA.length} of {appointments.length}</div></div>
                <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                  {['ALL','TODAY','CONFIRMED','COMPLETED','CANCELLED'].map(f=>(
                    <button key={f} onClick={()=>setFilter(f)} className={filter===f?'filter-chip active':'filter-chip'} style={{ fontSize:11 }}>{f}</button>
                  ))}
                </div>
              </div>
              {filteredA.length===0 ? <div className="empty-state"><div className="empty-state-icon">👥</div><h3>No patients found</h3></div>
              : filteredA.map((a,i)=>(
                <div key={a.id} className="card page-enter" style={{ padding:18, marginBottom:10, animationDelay:`${i*0.04}s` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
                    <div style={{ display:'flex', gap:12 }}>
                      <div style={{ width:48, height:48, borderRadius:'50%', background:'linear-gradient(135deg,var(--g700),var(--g400))', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontFamily:'var(--font-display)', fontSize:15, flexShrink:0 }}>
                        {a.patient?.full_name?.split(' ').map(n=>n[0]).join('').slice(0,2)||'P'}
                      </div>
                      <div>
                        <div style={{ fontWeight:700, fontSize:15, color:'var(--text)', marginBottom:2 }}>{a.patient?.full_name||'Patient'}</div>
                        <div style={{ fontSize:11, color:'var(--text3)', display:'flex', gap:12, flexWrap:'wrap' }}>
                          <span>📅 {a.date} · {a.time_slot}</span>
                          {a.patient?.age&&<span>🎂 {a.patient.age}y</span>}
                          {a.patient?.gender&&<span>{a.patient.gender}</span>}
                          {a.patient?.blood_group&&<span>🩸 {a.patient.blood_group}</span>}
                          {a.patient?.weight&&<span>⚖️ {a.patient.weight}kg</span>}
                        </div>
                        {a.symptoms&&<div style={{ marginTop:6, fontSize:12, color:'var(--text2)', background:'var(--bg3)', padding:'4px 10px', borderRadius:6, display:'inline-block' }}>"{a.symptoms}"</div>}
                        {a.patient?.allergies&&<div style={{ fontSize:11, color:'var(--red)', fontWeight:600, marginTop:4 }}>⚠ Allergies: {a.patient.allergies}</div>}
                        {a.patient?.chronic_conditions&&<div style={{ fontSize:11, color:'var(--amber)', fontWeight:600 }}>Chronic: {a.patient.chronic_conditions}</div>}
                      </div>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:7, alignItems:'flex-end' }}>
                      <div style={{ display:'flex', gap:5 }}>
                        <span className={`badge badge-${a.status?.toLowerCase()}`}>{a.status}</span>
                        <span style={{ padding:'3px 9px', borderRadius:20, fontSize:10, fontWeight:700, background:`${sColor(a.severity)}18`, color:sColor(a.severity) }}>{a.severity}</span>
                      </div>
                      {a.status!=='COMPLETED'&&a.status!=='CANCELLED'&&<button className="btn btn-primary btn-sm" onClick={()=>startRx(a)}>💊 Prescribe</button>}
                      {a.status==='COMPLETED'&&<a href={`${apiBaseUrl}/doctor/prescription/${a.id}/download`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">📄 PDF</a>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {view==='prescribe' && (
            <div className="page-enter">
              <button className="btn btn-ghost btn-sm" onClick={()=>setView('patients')} style={{ marginBottom:14 }}>← Back</button>
              {!selected ? <div className="alert alert-warning">Select a patient from the Patients tab first.</div> : (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 290px', gap:20 }}>
                  <div>
                    <div className="section-title" style={{ marginBottom:4 }}>Write Prescription</div>
                    <div style={{ fontSize:13, color:'var(--text3)', marginBottom:16 }}>For: <strong style={{ color:'var(--text)' }}>{selected.patient?.full_name}</strong> · {selected.date} {selected.time_slot}</div>
                    <div className="card" style={{ marginBottom:16, background:'var(--g50)', border:'1px solid var(--g100)', padding:14 }}>
                      <div style={{ fontSize:10, fontWeight:700, color:'var(--g700)', textTransform:'uppercase', letterSpacing:0.5, marginBottom:8 }}>Patient Info</div>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
                        {[{l:'Name',v:selected.patient?.full_name},{l:'Age',v:selected.patient?.age?`${selected.patient.age}y`:'—'},{l:'Blood',v:selected.patient?.blood_group||'—'},{l:'BMI',v:selected.patient?.bmi||'—'}].map(({l,v})=>(
                          <div key={l}><div style={{ fontSize:9, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:0.3 }}>{l}</div><div style={{ fontSize:13, fontWeight:600, color:'var(--text)', marginTop:1 }}>{v}</div></div>
                        ))}
                      </div>
                      {selected.patient?.allergies&&<div style={{ marginTop:8, fontSize:11, color:'var(--red)', fontWeight:600 }}>⚠ Allergies: {selected.patient.allergies}</div>}
                    </div>
                    <div className="form-group"><label className="form-label">Diagnosis *</label><textarea className="form-input" rows={3} placeholder="Primary diagnosis..." value={rx.diagnosis} onChange={e=>setRx({...rx,diagnosis:e.target.value})} /></div>
                    <div style={{ marginBottom:16 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}><label className="form-label" style={{ marginBottom:0 }}>Medicines (Rx)</label><button className="btn btn-outline btn-sm" onClick={()=>setMeds([...meds,{name:'',dosage:'',duration:'',instructions:''}])}>+ Add</button></div>
                      {meds.map((m,i)=>(
                        <div key={i} className="card" style={{ padding:12, marginBottom:8, border:'1px solid var(--border)' }}>
                          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}><span style={{ fontSize:11, fontWeight:700, color:'var(--text3)' }}>Medicine {i+1}</span>{meds.length>1&&<button onClick={()=>setMeds(meds.filter((_,idx)=>idx!==i))} style={{ background:'none', border:'none', color:'var(--red)', cursor:'pointer', fontSize:12, fontWeight:700 }}>✕</button>}</div>
                          <div className="grid-2" style={{ gap:8 }}>
                            <div className="form-group" style={{ marginBottom:6 }}><label className="form-label">Name</label><input className="form-input" placeholder="Paracetamol 500mg" value={m.name} onChange={e=>setMeds(meds.map((x,idx)=>idx===i?{...x,name:e.target.value}:x))} /></div>
                            <div className="form-group" style={{ marginBottom:6 }}><label className="form-label">Dosage</label><input className="form-input" placeholder="1 tab TDS" value={m.dosage} onChange={e=>setMeds(meds.map((x,idx)=>idx===i?{...x,dosage:e.target.value}:x))} /></div>
                            <div className="form-group" style={{ marginBottom:0 }}><label className="form-label">Duration</label><input className="form-input" placeholder="5 days" value={m.duration} onChange={e=>setMeds(meds.map((x,idx)=>idx===i?{...x,duration:e.target.value}:x))} /></div>
                            <div className="form-group" style={{ marginBottom:0 }}><label className="form-label">Instructions</label><input className="form-input" placeholder="After meals" value={m.instructions} onChange={e=>setMeds(meds.map((x,idx)=>idx===i?{...x,instructions:e.target.value}:x))} /></div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="form-group"><label className="form-label">Advice</label><textarea className="form-input" rows={2} placeholder="Rest, diet, lifestyle..." value={rx.advice} onChange={e=>setRx({...rx,advice:e.target.value})} /></div>
                    <div className="form-group"><label className="form-label">Follow-up Date</label><input className="form-input" type="date" value={rx.follow_up_date} onChange={e=>setRx({...rx,follow_up_date:e.target.value})} /></div>
                    <button className="btn btn-primary btn-lg btn-full" onClick={handlePrescribe} disabled={saving||!rx.diagnosis}>{saving?'⏳ Saving...':'💊 Save & Generate PDF →'}</button>
                  </div>
                  <div className="card" style={{ position:'sticky', top:80, background:'var(--bg3)', border:'2px dashed var(--border2)', padding:14, fontSize:11, lineHeight:1.9 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:0.6, marginBottom:10 }}>PDF Preview</div>
                    <div style={{ fontFamily:'var(--font-display)', fontSize:14, color:'var(--g700)', fontWeight:700 }}>AnytimeDoctor</div>
                    <div style={{ color:'var(--text3)', fontSize:9, marginBottom:8 }}>Digital Prescription</div>
                    <div><strong>Dr.</strong> {doctor?.full_name}</div>
                    <div style={{ color:'var(--text3)', fontSize:10 }}>{doctor?.specialization} · {doctor?.reg_number}</div>
                    <hr className="divider" />
                    <div><strong>Patient:</strong> {selected.patient?.full_name}</div>
                    <div><strong>Date:</strong> {selected.date}</div>
                    <hr className="divider" />
                    <div style={{ fontWeight:600 }}>Diagnosis:</div>
                    <div style={{ fontSize:10, color:'var(--text)' }}>{rx.diagnosis||'—'}</div>
                    <hr className="divider" />
                    <div style={{ fontWeight:600, marginBottom:3 }}>Medicines:</div>
                    {meds.filter(m=>m.name).map((m,i)=><div key={i} style={{ fontSize:10, padding:'2px 6px', background:'var(--bg2)', borderRadius:4, marginBottom:2 }}>{i+1}. {m.name} · {m.dosage} · {m.duration}</div>)}
                    {rx.advice&&<><hr className="divider" /><div style={{ fontSize:10 }}><strong>Advice:</strong> {rx.advice}</div></>}
                    {rx.follow_up_date&&<><hr className="divider" /><div style={{ color:'var(--amber)', fontWeight:600, fontSize:10 }}>Follow-up: {rx.follow_up_date}</div></>}
                    <hr className="divider" />
                    <div style={{ textAlign:'right', fontSize:9, color:'var(--text4)' }}>— {doctor?.full_name}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {view==='availability' && (
            <div className="page-enter">
              <div className="section-title" style={{ marginBottom:4 }}>My Schedule</div>
              <div className="section-sub">Set working days and consultation time slots</div>
              <div className="grid-2" style={{ gap:18, marginBottom:18 }}>
                <div className="card">
                  <div style={{ fontWeight:700, fontSize:14, color:'var(--text)', marginBottom:12 }}>📅 Working Days ({selDays.length})</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                    {DAYS.map(d=>(
                      <button key={d} onClick={()=>setSelDays(p=>p.includes(d)?p.filter(x=>x!==d):[...p,d])}
                        style={{ padding:'9px 16px', borderRadius:8, border:`1.5px solid ${selDays.includes(d)?'var(--g600)':'var(--border2)'}`, background:selDays.includes(d)?'var(--g50)':'var(--bg)', color:selDays.includes(d)?'var(--g700)':'var(--text2)', fontSize:13, fontWeight:selDays.includes(d)?700:400, cursor:'pointer', transition:'var(--t)' }}>{d}</button>
                    ))}
                  </div>
                </div>
                <div className="card">
                  <div style={{ fontWeight:700, fontSize:14, color:'var(--text)', marginBottom:12 }}>🕐 Time Slots ({selSlots.length})</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                    {SLOTS.map(s=>(
                      <button key={s} onClick={()=>setSelSlots(p=>p.includes(s)?p.filter(x=>x!==s):[...p,s])}
                        style={{ padding:'7px 12px', borderRadius:8, border:`1.5px solid ${selSlots.includes(s)?'var(--g600)':'var(--border2)'}`, background:selSlots.includes(s)?'var(--g50)':'var(--bg)', color:selSlots.includes(s)?'var(--g700)':'var(--text2)', fontSize:12, fontWeight:selSlots.includes(s)?700:400, cursor:'pointer', transition:'var(--t)', minWidth:64 }}>{s}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="card" style={{ marginBottom:18, background:'var(--g50)', border:'1px solid var(--g100)', padding:16 }}>
                <div style={{ fontWeight:600, color:'var(--g800)', marginBottom:6 }}>Summary</div>
                <div style={{ fontSize:13, color:'var(--text2)' }}>Days: <strong>{selDays.join(', ')||'None'}</strong></div>
                <div style={{ fontSize:13, color:'var(--text2)', marginTop:4 }}>Slots: <strong>{selSlots.join(', ')||'None'}</strong></div>
                <div style={{ fontSize:12, color:'var(--text3)', marginTop:6 }}>Weekly capacity: <strong style={{ color:'var(--g700)' }}>{selDays.length*selSlots.length} appointments</strong></div>
              </div>
              <button className="btn btn-primary btn-lg" onClick={handleAvailability} disabled={saving}>{saving?'⏳ Saving...':'✓ Save Schedule'}</button>
            </div>
          )}

          {view==='profile' && (
            <div className="page-enter">
              <div style={{ background:'linear-gradient(135deg,var(--g900),var(--g700))', borderRadius:'var(--r-lg)', padding:28, marginBottom:22, position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:'-30px', right:'-30px', width:160, height:160, borderRadius:'50%', background:'rgba(255,255,255,0.05)' }}/>
                <div style={{ display:'flex', gap:18, alignItems:'center', position:'relative', zIndex:1 }}>
                  <div style={{ width:72, height:72, borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontFamily:'var(--font-display)', fontSize:24, border:'3px solid rgba(255,255,255,0.3)', flexShrink:0 }}>
                    {doctor?.photo_url?<img src={doctor.photo_url} alt="" style={{ width:72, height:72, borderRadius:'50%', objectFit:'cover' }}/>:initials}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:700, color:'#fff', marginBottom:3 }}>{doctor?.full_name}</div>
                    <div style={{ color:'rgba(255,255,255,0.75)', fontSize:13, marginBottom:10 }}>{doctor?.specialization} · {doctor?.qualification}</div>
                    <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                      {[{v:`${doctor?.experience}y`,l:'Exp'},{v:`₹${doctor?.fee}`,l:'Fee'},{v:`⭐${doctor?.rating}`,l:'Rating'},{v:doctor?.consultation_type,l:'Type'}].filter(s=>s.v).map(s=>(
                        <div key={s.l} style={{ background:'rgba(255,255,255,0.12)', borderRadius:7, padding:'5px 10px' }}>
                          <div style={{ fontSize:12, fontWeight:700, color:'#fff' }}>{s.v}</div>
                          <div style={{ fontSize:9, color:'rgba(255,255,255,0.6)' }}>{s.l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    {!editProfile
                      ? <button className="btn btn-sm" onClick={()=>setEditProfile(true)} style={{ background:'rgba(255,255,255,0.2)', border:'1px solid rgba(255,255,255,0.3)', color:'#fff' }}>✏ Edit</button>
                      : <div style={{ display:'flex', gap:8 }}>
                          <button className="btn btn-sm" onClick={()=>{setEditProfile(false);setPf(doctor);setSelLangs(doctor?.languages||[]);}} style={{ background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.2)', color:'#fff' }}>Cancel</button>
                          <button className="btn btn-sm" onClick={handleProfileSave} disabled={saving} style={{ background:'rgba(255,255,255,0.9)', color:'var(--g800)', fontWeight:700 }}>{saving?'Saving...':'Save'}</button>
                        </div>
                    }
                  </div>
                </div>
              </div>

              {editProfile ? (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
                  <div className="card">
                    <div style={{ fontWeight:700, fontSize:14, color:'var(--text)', marginBottom:14, paddingBottom:8, borderBottom:'1px solid var(--border)' }}>Personal Information</div>
                    <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={pf.full_name||''} onChange={e=>setPf({...pf,full_name:e.target.value})} /></div>
                    <div className="grid-2">
                      <div className="form-group"><label className="form-label">Age</label><input className="form-input" type="number" value={pf.age||''} onChange={e=>setPf({...pf,age:e.target.value})} /></div>
                      <div className="form-group"><label className="form-label">Gender</label>
                        <select className="form-input form-select" value={pf.gender||''} onChange={e=>setPf({...pf,gender:e.target.value})}>
                          <option value="">Select</option>{GENDERS.map(g=><option key={g}>{g}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="form-group"><label className="form-label">Mobile</label><input className="form-input" value={pf.mobile||''} onChange={e=>setPf({...pf,mobile:e.target.value})} /></div>
                    <div className="form-group"><label className="form-label">Photo URL</label><input className="form-input" placeholder="https://..." value={pf.photo_url||''} onChange={e=>setPf({...pf,photo_url:e.target.value})} /></div>
                  </div>
                  <div className="card">
                    <div style={{ fontWeight:700, fontSize:14, color:'var(--text)', marginBottom:14, paddingBottom:8, borderBottom:'1px solid var(--border)' }}>Professional Details</div>
                    <div className="form-group"><label className="form-label">Specialization</label><input className="form-input" value={pf.specialization||''} onChange={e=>setPf({...pf,specialization:e.target.value})} /></div>
                    <div className="form-group"><label className="form-label">Qualification</label><input className="form-input" value={pf.qualification||''} onChange={e=>setPf({...pf,qualification:e.target.value})} /></div>
                    <div className="grid-2">
                      <div className="form-group"><label className="form-label">Reg. Number</label><input className="form-input" value={pf.reg_number||''} onChange={e=>setPf({...pf,reg_number:e.target.value})} /></div>
                      <div className="form-group"><label className="form-label">Fee (₹)</label><input className="form-input" type="number" value={pf.fee||''} onChange={e=>setPf({...pf,fee:e.target.value})} /></div>
                    </div>
                    <div className="form-group"><label className="form-label">Hospital</label><input className="form-input" value={pf.hospital||''} onChange={e=>setPf({...pf,hospital:e.target.value})} /></div>
                    <div className="form-group"><label className="form-label">Location</label><input className="form-input" value={pf.location||''} onChange={e=>setPf({...pf,location:e.target.value})} /></div>
                    <div className="form-group"><label className="form-label">Consultation Type</label>
                      <select className="form-input form-select" value={pf.consultation_type||''} onChange={e=>setPf({...pf,consultation_type:e.target.value})}>
                        {CONSULT_TYPES.map(c=><option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="card">
                    <div style={{ fontWeight:700, fontSize:14, color:'var(--text)', marginBottom:14, paddingBottom:8, borderBottom:'1px solid var(--border)' }}>Bio & Languages</div>
                    <div className="form-group"><label className="form-label">Professional Bio</label><textarea className="form-input" rows={4} placeholder="Brief professional summary..." value={pf.bio||''} onChange={e=>setPf({...pf,bio:e.target.value})} /></div>
                    <div className="form-group">
                      <label className="form-label">Languages Spoken</label>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginTop:4 }}>
                        {LANGS.map(l=>(
                          <button key={l} type="button" onClick={()=>setSelLangs(p=>p.includes(l)?p.filter(x=>x!==l):[...p,l])}
                            style={{ padding:'4px 11px', borderRadius:20, border:`1.5px solid ${selLangs.includes(l)?'var(--g600)':'var(--border2)'}`, background:selLangs.includes(l)?'var(--g50)':'var(--bg)', color:selLangs.includes(l)?'var(--g700)':'var(--text3)', fontSize:12, fontWeight:selLangs.includes(l)?700:400, cursor:'pointer', transition:'var(--t)' }}>{l}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="card">
                    <div style={{ fontWeight:700, fontSize:14, color:'var(--text)', marginBottom:14, paddingBottom:8, borderBottom:'1px solid var(--border)' }}>Achievements</div>
                    <div className="form-group"><label className="form-label">Awards & Recognitions</label><textarea className="form-input" rows={3} placeholder="Awards, certifications..." value={pf.awards||''} onChange={e=>setPf({...pf,awards:e.target.value})} /></div>
                    <div className="form-group"><label className="form-label">Publications & Research</label><textarea className="form-input" rows={3} placeholder="Published papers, research..." value={pf.publications||''} onChange={e=>setPf({...pf,publications:e.target.value})} /></div>
                    <div className="form-group"><label className="form-label">Signature (for PDF)</label><input className="form-input" placeholder="Dr. Name, MBBS, MD" value={pf.signature_text||''} onChange={e=>setPf({...pf,signature_text:e.target.value})} /></div>
                  </div>
                </div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
                  <div className="card">
                    <div style={{ fontWeight:700, fontSize:14, color:'var(--text)', marginBottom:12, paddingBottom:8, borderBottom:'1px solid var(--border)' }}>Personal Information</div>
                    {[{l:'Full Name',v:doctor?.full_name},{l:'Age',v:doctor?.age?`${doctor.age} years`:null},{l:'Gender',v:doctor?.gender},{l:'Mobile',v:doctor?.mobile},{l:'Email',v:doctor?.email},{l:'Member Since',v:doctor?.created_at}].map(({l,v})=>(
                      <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border)', alignItems:'center' }}>
                        <span style={{ fontSize:11, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:0.3 }}>{l}</span>
                        <span style={{ fontSize:13, color:v?'var(--text)':'var(--text4)', fontStyle:v?'normal':'italic', textAlign:'right', maxWidth:200 }}>{v||'Not provided'}</span>
                      </div>
                    ))}
                  </div>
                  <div className="card">
                    <div style={{ fontWeight:700, fontSize:14, color:'var(--text)', marginBottom:12, paddingBottom:8, borderBottom:'1px solid var(--border)' }}>Professional Details</div>
                    {[{l:'Specialization',v:doctor?.specialization},{l:'Qualification',v:doctor?.qualification},{l:'Reg. Number',v:doctor?.reg_number},{l:'Experience',v:doctor?.experience?`${doctor.experience} years`:null},{l:'Hospital',v:doctor?.hospital},{l:'Location',v:doctor?.location},{l:'Consultation',v:doctor?.consultation_type}].map(({l,v})=>(
                      <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border)', alignItems:'center' }}>
                        <span style={{ fontSize:11, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:0.3 }}>{l}</span>
                        <span style={{ fontSize:13, color:v?'var(--text)':'var(--text4)', fontStyle:v?'normal':'italic', textAlign:'right', maxWidth:200 }}>{v||'Not provided'}</span>
                      </div>
                    ))}
                  </div>
                  {doctor?.bio&&<div className="card" style={{ gridColumn:'1/-1' }}><div style={{ fontWeight:700, fontSize:14, color:'var(--text)', marginBottom:8 }}>Professional Bio</div><p style={{ fontSize:14, color:'var(--text2)', lineHeight:1.7 }}>{doctor.bio}</p></div>}
                  {(doctor?.languages?.length>0||doctor?.awards||doctor?.publications)&&(
                    <div className="card" style={{ gridColumn:'1/-1' }}>
                      <div style={{ fontWeight:700, fontSize:14, color:'var(--text)', marginBottom:14 }}>Skills & Achievements</div>
                      {doctor?.languages?.length>0&&<div style={{ marginBottom:14 }}><div style={{ fontSize:10, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:0.5, marginBottom:7 }}>Languages</div><div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>{doctor.languages.map(l=><span key={l} className="tag">{l}</span>)}</div></div>}
                      {doctor?.awards&&<><div style={{ fontSize:10, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:0.5, marginBottom:4 }}>Awards</div><p style={{ fontSize:13, color:'var(--text2)', marginBottom:12 }}>{doctor.awards}</p></>}
                      {doctor?.publications&&<><div style={{ fontSize:10, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:0.5, marginBottom:4 }}>Publications</div><p style={{ fontSize:13, color:'var(--text2)' }}>{doctor.publications}</p></>}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h<12) return 'Morning'; if (h<17) return 'Afternoon'; return 'Evening';
}