import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { symptomAPI, authAPI } from '../api/api';
import Navbar from '../components/navbar';

const QUICK_SYMPTOMS = [
  { label:'Fever & Cold', text:'I have fever, runny nose and body aches since 2 days' },
  { label:'Chest Pain',   text:'I have chest pain and difficulty breathing' },
  { label:'Headache',     text:'I have severe headache and dizziness' },
  { label:'Stomach',      text:'I have stomach pain, nausea and vomiting' },
  { label:'Skin Rash',    text:'I have skin rash and itching on arms and legs' },
  { label:'Joint Pain',   text:'I have knee pain and joint stiffness' },
  { label:'Eye Problem',  text:'I have eye redness, watery eyes and blurred vision' },
  { label:'Anxiety',      text:'I have anxiety, insomnia and panic attacks' },
];

const BODY_PARTS = [
  { part:'Head',    icon:'🧠', symptoms:'headache, dizziness, migraine' },
  { part:'Chest',   icon:'❤️',  symptoms:'chest pain, shortness of breath' },
  { part:'Stomach', icon:'🫃', symptoms:'stomach pain, nausea, vomiting' },
  { part:'Skin',    icon:'🖐️', symptoms:'rash, itching, acne' },
  { part:'Eyes',    icon:'👁️', symptoms:'eye pain, blurred vision' },
  { part:'Joints',  icon:'🦴', symptoms:'joint pain, stiffness, swelling' },
  { part:'Throat',  icon:'🗣️', symptoms:'sore throat, cough, hoarseness' },
  { part:'Mental',  icon:'🧘', symptoms:'anxiety, depression, insomnia' },
];

const STEPS = ['symptoms','details','result'];

function StepIndicator({ current }) {
  const labels = ['Describe Symptoms','Add Details','View Results'];
  return (
    <div style={{ display:'flex', alignItems:'center', gap:0, marginBottom:28 }}>
      {labels.map((l,i) => (
        <React.Fragment key={i}>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
            <div style={{ width:32, height:32, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700,
              background: i <= current ? 'var(--g600)' : 'var(--bg3)',
              color: i <= current ? '#fff' : 'var(--text4)',
              border: i === current ? '3px solid var(--g400)' : '3px solid transparent',
              transition:'all 0.3s' }}>
              {i < current ? '✓' : i+1}
            </div>
            <span style={{ fontSize:11, fontWeight: i===current?700:400, color: i<=current?'var(--g700)':'var(--text4)', whiteSpace:'nowrap' }}>{l}</span>
          </div>
          {i < 2 && <div style={{ flex:1, height:2, background: i < current ? 'var(--g600)' : 'var(--border)', margin:'0 8px', marginBottom:18, transition:'background 0.3s' }}/>}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function ChatPage() {
  const [step,       setStep]      = useState(0);
  const [input,      setInput]     = useState('');
  const [age,        setAge]       = useState('');
  const [duration,   setDuration]  = useState('');
  const [result,     setResult]    = useState(null);
  const [history,    setHistory]   = useState([]);
  const [loading,    setLoading]   = useState(false);
  const [error,      setError]     = useState('');
  const [charCount,  setCharCount] = useState(0);
  const [activeTab,  setActiveTab] = useState('checker');
  const textRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await authAPI.profile();
      if (res.data) {
        // load symptom history via api
        const h = await fetch('http://localhost:5000/api/symptoms/history', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(r => r.json());
        if (h.history) setHistory(h.history);
      }
    } catch {}
  };

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setError(''); setLoading(true); setResult(null);
    try {
      const res = await symptomAPI.analyze({ symptoms: input, age: age || undefined, duration: duration || undefined });
      setResult(res.data);
      setStep(2);
      loadHistory();
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed. Please try again.');
    } finally { setLoading(false); }
  };

  const handleQuick = text => { setInput(text); setCharCount(text.length); textRef.current?.focus(); };
  const handleBodyPart = s => { setInput(prev => prev ? `${prev}, ${s}` : s); setCharCount(input.length + s.length + 2); textRef.current?.focus(); };
  const reset = () => { setStep(0); setInput(''); setAge(''); setDuration(''); setResult(null); setError(''); setCharCount(0); };

  const sColor = l => ({ LOW:'var(--g600)', MEDIUM:'var(--amber)', HIGH:'var(--red)' }[l] || 'var(--text3)');
  const sBg    = l => ({ LOW:'var(--g50)', MEDIUM:'var(--amber-lt)', HIGH:'var(--red-lt)' }[l] || 'var(--bg3)');

  return (
    <div className="page-wrapper page-enter">
      <Navbar />

      <div className="page-hero">
        <div className="container">
          <h1 className="slide-left">AI Symptom Checker</h1>
          <p className="slide-left d1">Describe your symptoms and get instant medical guidance powered by our intelligent analysis engine</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop:28, paddingBottom:48, maxWidth:900 }}>

        {/* Tab switcher */}
        <div style={{ display:'flex', gap:8, marginBottom:24 }}>
          {[{id:'checker',label:'Symptom Checker',icon:'🩺'},{id:'history',label:'My History',icon:'📋'}].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={activeTab===t.id ? 'filter-chip active' : 'filter-chip'}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'history' && (
          <div className="page-enter">
            <div className="section-title" style={{ marginBottom:4 }}>Your Symptom History</div>
            <div className="section-sub">Recent symptom checks</div>
            {history.length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon">📋</div><h3>No history yet</h3><p>Your symptom checks will appear here</p></div>
            ) : history.map((h, i) => (
              <div key={h.id} className="card page-enter" style={{ marginBottom:12, padding:18, animationDelay:`${i*0.05}s` }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:10 }}>
                  <div>
                    <div style={{ fontWeight:600, color:'var(--text)', marginBottom:4 }}>{h.raw_input?.slice(0,80)}{h.raw_input?.length>80?'...':''}</div>
                    <div style={{ fontSize:12, color:'var(--text3)' }}>
                      {h.created_at} · Recommended: <strong style={{ color:'var(--g700)' }}>{h.recommended_doc}</strong>
                    </div>
                  </div>
                  <span style={{ padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:700, background:sBg(h.severity_level), color:sColor(h.severity_level) }}>
                    {h.severity_level} · {h.severity_score}pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'checker' && (
          <>
            <StepIndicator current={step} />

            {/* STEP 0: Describe symptoms */}
            {step === 0 && (
              <div className="page-enter">
                <div className="card" style={{ marginBottom:20 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
                    <div>
                      <h2 style={{ fontFamily:'var(--font-display)', fontSize:20, color:'var(--text)', marginBottom:4 }}>How are you feeling?</h2>
                      <p style={{ fontSize:13, color:'var(--text3)' }}>Describe all your symptoms in your own words</p>
                    </div>
                    <span style={{ fontSize:12, color: charCount>900?'var(--red)':'var(--text4)' }}>{charCount}/1000</span>
                  </div>

                  {error && <div className="alert alert-error">{error}</div>}

                  <textarea
                    ref={textRef}
                    style={{ width:'100%', minHeight:130, padding:'14px 16px', border:'1.5px solid var(--border2)', borderRadius:'var(--r-sm)', fontSize:15, color:'var(--text)', background:'var(--bg)', resize:'vertical', outline:'none', fontFamily:'var(--font-body)', transition:'var(--t)', lineHeight:1.6 }}
                    placeholder="e.g. I have been having high fever since yesterday, along with a severe headache and body aches. I also feel very tired..."
                    value={input}
                    onChange={e => { setInput(e.target.value); setCharCount(e.target.value.length); }}
                    onFocus={e => e.target.style.borderColor='var(--g600)'}
                    onBlur={e  => e.target.style.borderColor='var(--border2)'}
                    maxLength={1000}
                  />

                  {/* Body part selector */}
                  <div style={{ marginTop:16 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:0.6, marginBottom:10 }}>Quick Add by Body Part</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                      {BODY_PARTS.map(b => (
                        <button key={b.part} onClick={() => handleBodyPart(b.symptoms)}
                          style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:8, border:'1.5px solid var(--border2)', background:'var(--bg)', color:'var(--text2)', fontSize:12, fontWeight:500, cursor:'pointer', transition:'var(--t)' }}
                          onMouseOver={e=>{ e.currentTarget.style.borderColor='var(--g600)'; e.currentTarget.style.background='var(--g50)'; }}
                          onMouseOut={e=>{ e.currentTarget.style.borderColor='var(--border2)'; e.currentTarget.style.background='var(--bg)'; }}>
                          <span style={{ fontSize:14 }}>{b.icon}</span> {b.part}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display:'flex', justifyContent:'flex-end', marginTop:16 }}>
                    <button className="btn btn-primary btn-lg" onClick={() => { if(!input.trim()){setError('Please describe your symptoms first');return;} setStep(1); setError(''); }}
                      disabled={!input.trim()} style={{ minWidth:160 }}>
                      Next: Add Details →
                    </button>
                  </div>
                </div>

                {/* Quick symptom chips */}
                <div className="card" style={{ padding:20 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'var(--text)', marginBottom:14 }}>Common Symptom Presets</div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
                    {QUICK_SYMPTOMS.map((s, i) => (
                      <button key={i} onClick={() => handleQuick(s.text)}
                        className="page-enter"
                        style={{ animationDelay:`${i*0.04}s`, padding:'12px', borderRadius:'var(--r-sm)', border:'1.5px solid var(--border)', background:'var(--bg2)', cursor:'pointer', textAlign:'left', transition:'var(--t)' }}
                        onMouseOver={e=>{ e.currentTarget.style.borderColor='var(--g500,#5DCAA5)'; e.currentTarget.style.transform='translateY(-2px)'; }}
                        onMouseOut={e=>{ e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='translateY(0)'; }}>
                        <div style={{ fontSize:13, fontWeight:600, color:'var(--g700)', marginBottom:4 }}>{s.label}</div>
                        <div style={{ fontSize:11, color:'var(--text3)', lineHeight:1.4 }}>{s.text.slice(0,50)}...</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1: Add details */}
            {step === 1 && (
              <div className="page-enter">
                <div className="card" style={{ marginBottom:20 }}>
                  <h2 style={{ fontFamily:'var(--font-display)', fontSize:20, color:'var(--text)', marginBottom:6 }}>A Few More Details</h2>
                  <p style={{ fontSize:13, color:'var(--text3)', marginBottom:24 }}>This helps us give you more accurate guidance</p>

                  {/* Symptom preview */}
                  <div style={{ background:'var(--bg3)', borderRadius:'var(--r-sm)', padding:'12px 16px', marginBottom:24, fontSize:14, color:'var(--text2)', borderLeft:'3px solid var(--g600)' }}>
                    <strong style={{ color:'var(--g700)' }}>Your symptoms:</strong> {input.slice(0,120)}{input.length>120?'...':''}
                    <button onClick={() => setStep(0)} style={{ marginLeft:10, background:'none', border:'none', color:'var(--g600)', cursor:'pointer', fontSize:12, fontWeight:600 }}>Edit →</button>
                  </div>

                  <div className="grid-2" style={{ gap:20, marginBottom:24 }}>
                    <div className="form-group">
                      <label className="form-label">Your Age <span style={{ color:'var(--text4)', fontWeight:400 }}>(optional)</span></label>
                      <input className="form-input" type="number" placeholder="e.g. 28" min="1" max="120"
                        value={age} onChange={e => setAge(e.target.value)} />
                      <div style={{ fontSize:11, color:'var(--text3)', marginTop:4 }}>Age helps adjust severity for children and elderly</div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">How long have you had these symptoms? <span style={{ color:'var(--text4)', fontWeight:400 }}>(optional)</span></label>
                      <select className="form-input form-select" value={duration} onChange={e => setDuration(e.target.value)}>
                        <option value="">Select duration</option>
                        <option value="today">Started today</option>
                        <option value="1-2 days">1–2 days</option>
                        <option value="3-5 days">3–5 days</option>
                        <option value="1 week">About a week</option>
                        <option value="2 weeks">2 weeks</option>
                        <option value="1 month">About a month</option>
                        <option value="months">Several months</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
                    <button className="btn btn-ghost btn-lg" onClick={() => setStep(0)}>← Back</button>
                    <button className="btn btn-primary btn-lg" onClick={handleAnalyze} disabled={loading} style={{ minWidth:180 }}>
                      {loading
                        ? <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite', display:'inline-block' }}/>
                            Analysing...
                          </span>
                        : '🔍 Analyse Symptoms'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Results */}
            {step === 2 && result && (
              <div className="page-enter">

                {/* Severity card */}
                <div className="card scale-in" style={{ marginBottom:20, borderLeft:`5px solid ${sColor(result.severity?.level)}`, background: result.severity?.level==='HIGH' ? 'var(--red-lt)' : result.severity?.level==='MEDIUM' ? 'var(--amber-lt)' : 'var(--bg2)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
                    <div>
                      <div style={{ fontSize:11, fontWeight:700, color:sColor(result.severity?.level), textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>
                        {result.severity?.level==='HIGH' ? '🚨 Urgent' : result.severity?.level==='MEDIUM' ? '⚠️ Moderate' : '✅ Low'} Severity
                      </div>
                      <div style={{ fontFamily:'var(--font-display)', fontSize:32, fontWeight:700, color:sColor(result.severity?.level), lineHeight:1, marginBottom:8 }}>
                        {result.severity?.level}
                      </div>
                      <p style={{ fontSize:14, color:'var(--text2)', lineHeight:1.6 }}>{result.severity?.label}</p>
                      {result.severity?.reason && <p style={{ fontSize:12, color:sColor(result.severity?.level), marginTop:6, fontWeight:600 }}>⚠ {result.severity.reason}</p>}
                    </div>
                    <div style={{ textAlign:'center', background:'rgba(255,255,255,0.5)', borderRadius:14, padding:'16px 20px' }}>
                      <div style={{ fontSize:11, color:'var(--text3)', marginBottom:4, fontWeight:600, textTransform:'uppercase' }}>Score</div>
                      <div style={{ fontSize:40, fontWeight:800, color:sColor(result.severity?.level), fontFamily:'var(--font-display)', lineHeight:1 }}>
                        {result.severity?.score}
                      </div>
                      <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>out of max</div>
                    </div>
                  </div>
                </div>

                {/* Warnings */}
                {result.warnings?.length > 0 && result.warnings.map((w,i) => (
                  <div key={i} className="alert alert-warning scale-in" style={{ marginBottom:12 }}>⚠ {w}</div>
                ))}

                {/* No symptoms found */}
                {result.symptom_count === 0 && (
                  <div className="alert alert-info scale-in" style={{ marginBottom:20 }}>
                    <div>
                      <strong>No recognised symptoms detected.</strong>
                      <div style={{ marginTop:4, fontSize:13 }}>{result.message}</div>
                      {result.tip && <div style={{ marginTop:6, fontSize:12, color:'var(--blue)' }}>💡 {result.tip}</div>}
                    </div>
                  </div>
                )}

                {/* Detected symptoms */}
                {result.symptom_count > 0 && (
                  <div className="card scale-in" style={{ marginBottom:20 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                      <div style={{ fontWeight:700, fontSize:15, color:'var(--text)' }}>Detected Symptoms ({result.symptom_count})</div>
                      <div style={{ fontSize:12, color:'var(--text3)' }}>Score shown per symptom</div>
                    </div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                      {Object.entries(result.matched_symptoms).map(([sym, score]) => {
                        const w = Number(score);
                        const c = w>=8?'var(--red)':w>=5?'var(--amber)':'var(--g600)';
                        const bg= w>=8?'var(--red-lt)':w>=5?'var(--amber-lt)':'var(--g50)';
                        return (
                          <span key={sym} style={{ padding:'6px 14px', borderRadius:20, background:bg, color:c, fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:6 }}>
                            {sym}
                            <span style={{ fontSize:11, opacity:0.8, background:'rgba(0,0,0,0.08)', borderRadius:10, padding:'1px 6px' }}>{score}</span>
                          </span>
                        );
                      })}
                    </div>
                    {/* Score legend */}
                    <div style={{ marginTop:14, display:'flex', gap:16, fontSize:11, color:'var(--text3)' }}>
                      <span><span style={{ color:'var(--g600)', fontWeight:700 }}>●</span> Low (1–4)</span>
                      <span><span style={{ color:'var(--amber)', fontWeight:700 }}>●</span> Medium (5–7)</span>
                      <span><span style={{ color:'var(--red)', fontWeight:700 }}>●</span> High (8–10)</span>
                    </div>
                  </div>
                )}

                {/* Doctor recommendation */}
                {result.symptom_count > 0 && (
                  <div className="card scale-in" style={{ marginBottom:20 }}>
                    <div style={{ fontWeight:700, fontSize:15, color:'var(--text)', marginBottom:16 }}>Recommended Specialist</div>
                    <div style={{ display:'flex', gap:16, alignItems:'center', marginBottom:20, padding:16, background:'var(--g50)', borderRadius:'var(--r-sm)', border:'1px solid var(--g100)' }}>
                      <div style={{ width:56, height:56, borderRadius:'50%', background:'linear-gradient(135deg,var(--g700),var(--g400))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>👨‍⚕️</div>
                      <div>
                        <div style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:700, color:'var(--g800)', marginBottom:4 }}>{result.recommended?.primary}</div>
                        {result.recommended?.all?.length > 1 && (
                          <div style={{ fontSize:13, color:'var(--text3)' }}>
                            Also consider: {result.recommended.all.slice(1).join(', ')}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Reasoning */}
                    {result.recommended?.reasoning?.length > 0 && (
                      <div style={{ marginBottom:16 }}>
                        <div style={{ fontSize:12, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:0.5, marginBottom:8 }}>Why this specialist:</div>
                        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                          {result.recommended.reasoning.slice(0,4).map((r,i) => (
                            <div key={i} style={{ fontSize:12, color:'var(--text2)', padding:'4px 10px', background:'var(--bg3)', borderRadius:6, display:'flex', alignItems:'center', gap:6 }}>
                              <span style={{ color:'var(--g600)', fontWeight:700 }}>→</span> {r}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                      <button className="btn btn-primary btn-lg" onClick={() => navigate(`/doctors?specialization=${result.recommended?.primary}`)}>
                        Book Appointment →
                      </button>
                      <button className="btn btn-outline btn-lg" onClick={reset}>
                        Check Again
                      </button>
                    </div>
                  </div>
                )}

                {/* Emergency alert */}
                {result.severity?.level === 'HIGH' && (
                  <div style={{ background:'var(--red)', borderRadius:'var(--r)', padding:'20px 24px', color:'#fff', marginBottom:20 }} className="scale-in">
                    <div style={{ fontWeight:700, fontSize:16, marginBottom:8 }}>🚨 Immediate Action Required</div>
                    <p style={{ fontSize:14, lineHeight:1.6, opacity:0.9 }}>
                      Your symptoms indicate a potentially serious condition. Please go to the nearest emergency department or call emergency services immediately. Do not delay seeking care.
                    </p>
                  </div>
                )}

                {/* ML info */}
                {result.ml_stats && (
                  <div style={{ fontSize:11, color:'var(--text4)', textAlign:'center', padding:'12px 0', borderTop:'1px solid var(--border)' }}>
                    🤖 Analysis by Adaptive Rule Engine v{result.ml_stats.model_version} · Learned from {result.ml_stats.total_cases_learned} cases · {result.ml_stats.symptoms_tracked} symptoms tracked
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}