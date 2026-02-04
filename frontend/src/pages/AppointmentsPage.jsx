import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getMyAppointments, cancelAppointment } from "../api";

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");

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
    try {
      await cancelAppointment(appt.id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page">
      <h2>{user.name} — Randevular</h2>
      {error && <p className="error">{error}</p>}

      <div className="list">
        {appointments.length === 0 && <p className="empty">Randevu bulunamadi.</p>}
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
              <button className="btn-cancel" onClick={() => handleCancel(a)}>Iptal Et</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
