import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { appointmentAPI } from '../api/api';
import Navbar from '../components/navbar';

const SPECIALIZATIONS = [
  'All','General Physician','Cardiologist','Neurologist','Dermatologist',
  'Gastroenterologist','Psychiatrist','Orthopedist','Pulmonologist',
  'ENT Specialist','Endocrinologist',
];

const SORT_OPTIONS = [
  { value: 'rating',     label: 'Top Rated' },
  { value: 'fee_asc',    label: 'Fee: Low to High' },
  { value: 'fee_desc',   label: 'Fee: High to Low' },
  { value: 'experience', label: 'Most Experienced' },
];

function StarRating({ rating }) {
  return (
    <span className="stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ opacity: i <= Math.round(rating) ? 1 : 0.25 }}>★</span>
      ))}
      <span style={{ fontSize: 12, color: 'var(--text3)', marginLeft: 4, fontFamily: 'var(--font-body)' }}>
        {rating}
      </span>
    </span>
  );
}

export default function DoctorsPage() {
  const [doctors,  setDoctors]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);
  const [slots,    setSlots]    = useState([]);
  const [date,     setDate]     = useState(getTomorrow());
  const [slot,     setSlot]     = useState('');
  const [booking,  setBooking]  = useState(false);
  const [success,  setSuccess]  = useState('');
  const [error,    setError]    = useState('');

  // Filters
  const [search,   setSearch]   = useState('');
  const [specFilter, setSpec]   = useState('All');
  const [sortBy,   setSortBy]   = useState('rating');
  const [maxFee,   setMaxFee]   = useState(1000);
  const [minExp,   setMinExp]   = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const spec = searchParams.get('specialization') || '';
    if (spec) setSpec(spec);
    setLoading(true);
    appointmentAPI.getDoctors('')
      .then(res => setDoctors(res.data.doctors))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = [...doctors];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(d =>
        d.full_name.toLowerCase().includes(q) ||
        d.specialization.toLowerCase().includes(q) ||
        d.hospital.toLowerCase().includes(q) ||
        d.location.toLowerCase().includes(q)
      );
    }

    if (specFilter !== 'All') {
      list = list.filter(d => d.specialization === specFilter);
    }

    list = list.filter(d => d.fee <= maxFee && d.experience >= minExp);

    switch (sortBy) {
      case 'rating':     list.sort((a,b) => b.rating - a.rating); break;
      case 'fee_asc':    list.sort((a,b) => a.fee - b.fee); break;
      case 'fee_desc':   list.sort((a,b) => b.fee - a.fee); break;
      case 'experience': list.sort((a,b) => b.experience - a.experience); break;
    }
    return list;
  }, [doctors, search, specFilter, sortBy, maxFee, minExp]);

  const loadSlots = async doctor => {
    setSelected(doctor); setSlot(''); setSuccess(''); setError('');
    try {
      const res = await appointmentAPI.getSlots(doctor.id, date);
      setSlots(res.data.available);
    } catch { setSlots([]); }
  };

  const handleDateChange = async newDate => {
    setDate(newDate); setSlot('');
    if (selected) {
      try {
        const res = await appointmentAPI.getSlots(selected.id, newDate);
        setSlots(res.data.available);
      } catch { setSlots([]); }
    }
  };

  const handleBook = async () => {
    if (!slot) return;
    setBooking(true); setError('');
    try {
      await appointmentAPI.book({ doctor_id: selected.id, date, time_slot: slot, severity: 'LOW' });
      setSuccess(`✓ Appointment confirmed with ${selected.full_name} on ${date} at ${slot}`);
      setSlot('');
    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed.');
    } finally { setBooking(false); }
  };

  return (
    <div className="page-wrapper page-enter">
      <Navbar />

      <div className="page-hero">
        <div className="container">
          <h1 className="slide-left">Find Your Doctor</h1>
          <p className="slide-left d1">
            {filtered.length} specialist{filtered.length !== 1 ? 's' : ''} available
            {specFilter !== 'All' ? ` · ${specFilter}` : ''}
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 28, paddingBottom: 48 }}>

        {/* Search + Filter bar */}
        <div className="slide-left" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="search-bar" style={{ flex: 1, minWidth: 260 }}>
              <span style={{ fontSize: 16, color: 'var(--text3)' }}>🔍</span>
              <input placeholder="Search by name, specialization, hospital, location..."
                value={search} onChange={e => setSearch(e.target.value)} />
              {search && (
                <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 16 }}>✕</button>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <select className="form-input form-select" value={sortBy} onChange={e => setSortBy(e.target.value)}
                style={{ width: 'auto', padding: '10px 36px 10px 14px', fontSize: 13 }}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <button className={`btn btn-ghost btn-sm ${showFilters ? 'btn-outline' : ''}`}
                onClick={() => setShowFilters(f => !f)}>
                ⚙ Filters {showFilters ? '▲' : '▼'}
              </button>
            </div>
          </div>

          {/* Advanced filters */}
          {showFilters && (
            <div className="card scale-in" style={{ marginTop: 14, padding: 20 }}>
              <div className="grid-3" style={{ gap: 20 }}>
                <div>
                  <div className="form-label">Max Fee: ₹{maxFee}</div>
                  <input type="range" min="200" max="1000" step="50" value={maxFee}
                    onChange={e => setMaxFee(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--g600)' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
                    <span>₹200</span><span>₹1000</span>
                  </div>
                </div>
                <div>
                  <div className="form-label">Min Experience: {minExp}+ years</div>
                  <input type="range" min="0" max="20" step="1" value={minExp}
                    onChange={e => setMinExp(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--g600)' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
                    <span>0 yrs</span><span>20 yrs</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setMaxFee(1000); setMinExp(0); setSearch(''); setSpec('All'); setSortBy('rating'); }}>
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Specialization pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
            {SPECIALIZATIONS.map(s => (
              <button key={s} className={`filter-chip ${specFilter === s ? 'active' : ''}`}
                onClick={() => setSpec(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 400px' : '1fr', gap: 24, alignItems: 'start' }}>

          {/* Doctor grid */}
          <div>
            {loading ? (
              <div className="spinner-wrap"><div className="spinner" /></div>
            ) : filtered.length === 0 ? (
              <div className="empty-state fade-in">
                <div style={{ fontSize: 52, marginBottom: 14 }}>🔍</div>
                <h3>No doctors found</h3>
                <p>Try adjusting your search or filters</p>
                <button className="btn btn-outline" style={{ marginTop: 16 }}
                  onClick={() => { setSearch(''); setSpec('All'); setMaxFee(1000); setMinExp(0); }}>
                  Clear Filters
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {filtered.map((d, i) => (
                  <div key={d.id} className={`doctor-card page-enter ${selected?.id === d.id ? 'selected' : ''}`}
                    style={{ animationDelay: `${i * 0.04}s` }}
                    onClick={() => loadSlots(d)}>
                    <div style={{ display: 'flex', gap: 16 }}>
                      {/* Avatar */}
                      <div className="avatar-placeholder" style={{ width: 60, height: 60, fontSize: 22, flexShrink: 0 }}>
                        {d.full_name.split(' ').map(n=>n[0]).join('').slice(0,2)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                          <div>
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{d.full_name}</h3>
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--g600)' }}>{d.specialization}</span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--g700)', fontFamily: 'var(--font-display)' }}>₹{d.fee}</div>
                            <StarRating rating={d.rating} />
                          </div>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text3)', display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 8 }}>
                          <span>🎓 {d.qualification}</span>
                          <span>🕐 {d.experience} yrs experience</span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text3)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                          <span>🏥 {d.hospital}</span>
                          <span>📍 {d.location}</span>
                        </div>
                        <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {d.available_days?.slice(0,5).map(day => (
                            <span key={day} style={{ padding: '2px 8px', borderRadius: 4, background: 'var(--g50)', color: 'var(--g800)', fontSize: 11, fontWeight: 600 }}>
                              {day}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    {selected?.id === d.id && (
                      <div style={{ marginTop: 12, padding: '8px 12px', background: 'var(--g50)', borderRadius: 8, fontSize: 13, color: 'var(--g800)', fontWeight: 500 }}>
                        ✓ Selected — choose a slot on the right
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Booking panel */}
          {selected && (
            <div className="card scale-in" style={{ position: 'sticky', top: 80, border: '2px solid var(--g400)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 }}>Book Appointment</div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text)' }}>{selected.full_name}</h3>
                  <div style={{ fontSize: 13, color: 'var(--g600)', fontWeight: 600 }}>{selected.specialization}</div>
                </div>
                <button className="btn btn-ghost btn-icon" onClick={() => setSelected(null)}>✕</button>
              </div>

              {success && <div className="alert alert-success" style={{ fontSize: 13 }}>{success}</div>}
              {error   && <div className="alert alert-error"  style={{ fontSize: 13 }}>{error}</div>}

              <div className="form-group">
                <label className="form-label">Select Date</label>
                <input className="form-input" type="date" value={date} min={getTomorrow()}
                  onChange={e => handleDateChange(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Available Time Slots</label>
                {slots.length === 0 ? (
                  <div style={{ fontSize: 13, color: 'var(--text3)', padding: '12px 0' }}>
                    No slots available for this date
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {slots.map(s => (
                      <button key={s} onClick={() => setSlot(s)}
                        style={{
                          padding: '8px 14px', borderRadius: 8, cursor: 'pointer',
                          border: `1.5px solid ${slot === s ? 'var(--g600)' : 'var(--border2)'}`,
                          background: slot === s ? 'var(--g50)' : 'var(--bg)',
                          color: slot === s ? 'var(--g800)' : 'var(--text2)',
                          fontSize: 13, fontWeight: slot === s ? 700 : 400,
                          transition: 'var(--t)',
                        }}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Fee breakdown */}
              <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text3)', marginBottom: 6 }}>
                  <span>Consultation fee</span><span>₹{selected.fee}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text3)', marginBottom: 8 }}>
                  <span>Platform fee</span><span>₹0</span>
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--text)' }}>
                  <span>Total</span><span>₹{selected.fee}</span>
                </div>
              </div>

              <button className="btn btn-primary btn-full btn-lg" onClick={handleBook} disabled={!slot || booking}>
                {booking ? '⏳ Booking...' : `Confirm Appointment`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getTomorrow() {
  const d = new Date(); d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}