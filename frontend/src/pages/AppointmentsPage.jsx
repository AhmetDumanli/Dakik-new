import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getMyAppointments, cancelAppointment } from "../api";

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    try {
      const data = await getMyAppointments();
      setAppointments(data);
    } catch {
      setAppointments([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCancel = async (appt) => {
    setError("");
    setSuccess("");
    try {
      await cancelAppointment(appt.id);
      setSuccess("Randevu iptal edildi.");
      load();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const booked = appointments.filter((a) => a.status === "BOOKED");
  const cancelled = appointments.filter((a) => a.status === "CANCELLED");

  return (
    <div className="page">
      <div className="page-header">
        <h2>Randevularim</h2>
        {appointments.length > 0 && (
          <span className="badge badge-green">{booked.length} aktif</span>
        )}
      </div>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      {appointments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <p>Henuz randevunuz yok.</p>
          <span className="sub">Etkinlikler sayfasindan randevu alabilirsiniz.</span>
        </div>
      ) : (
        <>
          {booked.length > 0 && (
            <div className="appt-section">
              <h3 className="section-title">Aktif Randevular</h3>
              <div className="appt-list">
                {booked.map((a) => (
                  <div key={a.id} className="appt-card">
                    <div className="appt-status-bar status-booked" />
                    <div className="appt-card-body">
                      <div className="appt-card-info">
                        <strong>Randevu #{a.id}</strong>
                        <span className="sub">Event #{a.eventId}</span>
                      </div>
                      <div className="appt-card-actions">
                        <span className="badge badge-green">Aktif</span>
                        <button className="btn-cancel" onClick={() => handleCancel(a)}>Iptal Et</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {cancelled.length > 0 && (
            <div className="appt-section">
              <h3 className="section-title">Iptal Edilen Randevular</h3>
              <div className="appt-list">
                {cancelled.map((a) => (
                  <div key={a.id} className="appt-card appt-card-cancelled">
                    <div className="appt-status-bar status-cancelled" />
                    <div className="appt-card-body">
                      <div className="appt-card-info">
                        <strong>Randevu #{a.id}</strong>
                        <span className="sub">Event #{a.eventId}</span>
                      </div>
                      <span className="badge badge-red">Iptal Edildi</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
