import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { appointmentAPI } from '../api/api';
import Navbar from '../components/navbar';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [cancelling, setCancelling] = useState(null);

  const load = () => {
    setLoading(true);
    appointmentAPI.myAppointments()
      .then(res => setAppointments(res.data.appointments))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async id => {
    if (!window.confirm('Cancel this appointment?')) return;
    setCancelling(id);
    try {
      await appointmentAPI.cancel(id);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Could not cancel.');
    } finally { setCancelling(null); }
  };

  const statusBadge = s => <span className={`badge badge-${s?.toLowerCase()}`}>{s}</span>;
  const sevBadge    = s => <span className={`badge badge-${s?.toLowerCase()}`}>{s}</span>;

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="page-hero">
        <div className="container">
          <h1 className="fade-up">My Appointments</h1>
          <p className="fade-up-2">Track and manage all your appointments</p>
        </div>
      </div>

      <div className="container section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <div className="section-title">All Appointments</div>
            <div className="section-sub">{appointments.length} total</div>
          </div>
          <Link to="/chat" className="btn btn-primary">+ New Consultation</Link>
        </div>

        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : appointments.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
            <h3>No appointments yet</h3>
            <p>Check your symptoms to book your first appointment</p>
            <Link to="/chat" className="btn btn-primary" style={{ marginTop: 16 }}>Check Symptoms</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {appointments.map(a => (
              <div key={a.id} className="card fade-up">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--green-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                      👨‍⚕️
                    </div>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 3 }}>
                        {a.doctor?.full_name || 'Doctor'}
                      </h3>
                      <div style={{ fontSize: 13, color: 'var(--green-700)', marginBottom: 6 }}>
                        {a.doctor?.specialization}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--gray-500)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                        <span>📅 {a.date}</span>
                        <span>🕐 {a.time_slot}</span>
                        <span>🏥 {a.doctor?.hospital}</span>
                      </div>
                      {a.symptoms && (
                        <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 6, background: 'var(--gray-50)', padding: '4px 10px', borderRadius: 6, display: 'inline-block' }}>
                          Symptoms: {a.symptoms}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {statusBadge(a.status)}
                      {sevBadge(a.severity)}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>#{a.id}</div>
                    {a.status !== 'CANCELLED' && a.status !== 'COMPLETED' && (
                      <button className="btn btn-danger btn-sm"
                        onClick={() => handleCancel(a.id)}
                        disabled={cancelling === a.id}>
                        {cancelling === a.id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}