import { useState, useEffect } from "react";
import { getAppointmentsByUser, cancelAppointment } from "../api";

export default function AppointmentsPage({ activeUser }) {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");

  const load = async () => {
    if (!activeUser) return;
    try {
      const data = await getAppointmentsByUser(activeUser.id);
      setAppointments(data);
    } catch {
      setAppointments([]);
    }
  };

  useEffect(() => {
    load();
  }, [activeUser]);

  const handleCancel = async (appt) => {
    setError("");
    try {
      await cancelAppointment(appt.id, appt.bookedBy);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!activeUser) {
    return (
      <div className="page">
        <h2>Randevular</h2>
        <p className="warning">Randevuları görmek için bir kullanıcı seçin.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h2>{activeUser.name} — Randevular</h2>
      {error && <p className="error">{error}</p>}

      <div className="list">
        {appointments.length === 0 && <p className="empty">Randevu bulunamadı.</p>}
        {appointments.map((a) => (
          <div key={a.id} className="list-item">
            <div>
              <strong>Randevu #{a.id}</strong>
              <span className="sub">Event #{a.eventId}</span>
              <span className={`badge ${a.status === "BOOKED" ? "badge-green" : a.status === "CANCELLED" ? "badge-red" : ""}`}>
                {a.status}
              </span>
            </div>
            {a.status === "BOOKED" && (
              <button className="btn-cancel" onClick={() => handleCancel(a)}>İptal Et</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
