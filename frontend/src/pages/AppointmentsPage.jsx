import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getMyAppointments, cancelAppointment, getAppointmentRequests, approveAppointment, rejectAppointment } from "../api";

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [requests, setRequests] = useState([]);
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

  const loadRequests = async () => {
    try {
      const data = await getAppointmentRequests();
      setRequests(data);
    } catch {
      setRequests([]);
    }
  };

  useEffect(() => {
    load();
    loadRequests();
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

<<<<<<< Updated upstream
  const booked = appointments.filter((a) => a.status === "BOOKED");
  const cancelled = appointments.filter((a) => a.status === "CANCELLED");

  return (
    <div className="page">
      <div className="page-header">
        <h2>Randevularim</h2>
        {appointments.length > 0 && (
          <span className="badge badge-green">{booked.length} aktif</span>
        )}
=======
  const handleApprove = async (req) => {
    setError("");
    setSuccess("");
    try {
      await approveAppointment(req.id);
      setSuccess("Randevu istegi onaylandi!");
      loadRequests();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReject = async (req) => {
    setError("");
    setSuccess("");
    try {
      await rejectAppointment(req.id);
      setSuccess("Randevu istegi reddedildi.");
      loadRequests();
    } catch (err) {
      setError(err.message);
    }
  };

  const statusBadge = (status) => {
    switch (status) {
      case "BOOKED": return "badge-green";
      case "CANCELLED": return "badge-red";
      case "PENDING": return "badge-yellow";
      case "REJECTED": return "badge-red";
      default: return "";
    }
  };

  const statusText = (status) => {
    switch (status) {
      case "BOOKED": return "Onaylandi";
      case "CANCELLED": return "Iptal";
      case "PENDING": return "Beklemede";
      case "REJECTED": return "Reddedildi";
      case "FAILED": return "Basarisiz";
      default: return status;
    }
  };

  return (
    <div className="page">
      <h2>{user.name} — Randevular</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      {requests.length > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <h3>Gelen Istekler</h3>
          <div className="list">
            {requests.map((r) => (
              <div key={r.id} className="list-item">
                <div>
                  <strong>Istek #{r.id}</strong>
                  <span className="sub">Event #{r.eventId} — Kullanici #{r.bookedBy}</span>
                  <span className="badge badge-yellow">Beklemede</span>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button className="btn-book" onClick={() => handleApprove(r)}>Onayla</button>
                  <button className="btn-cancel" onClick={() => handleReject(r)}>Reddet</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h3>Randevularim</h3>
      <div className="list">
        {appointments.length === 0 && <p className="empty">Randevu bulunamadi.</p>}
        {appointments.map((a) => (
          <div key={a.id} className="list-item">
            <div>
              <strong>Randevu #{a.id}</strong>
              <span className="sub">Event #{a.eventId}</span>
              <span className={`badge ${statusBadge(a.status)}`}>
                {statusText(a.status)}
              </span>
            </div>
            {(a.status === "BOOKED" || a.status === "PENDING") && (
              <button className="btn-cancel" onClick={() => handleCancel(a)}>Iptal Et</button>
            )}
          </div>
        ))}
>>>>>>> Stashed changes
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
