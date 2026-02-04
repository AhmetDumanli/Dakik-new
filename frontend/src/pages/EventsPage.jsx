import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { createEvent, getEventsByUser, createAppointment } from "../api";

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ startTime: "", endTime: "" });
  const [searchId, setSearchId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadEvents = async (userId) => {
    try {
      const data = await getEventsByUser(userId);
      setEvents(data);
    } catch {
      setEvents([]);
    }
  };

  useEffect(() => {
    if (user) {
      setSearchId(String(user.id));
      loadEvents(user.id);
    }
  }, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createEvent({
        startTime: form.startTime,
        endTime: form.endTime,
      });
      setForm({ startTime: "", endTime: "" });
      loadEvents(user.id);
      setSearchId(String(user.id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBook = async (eventId) => {
    setError("");
    setSuccess("");
    try {
      await createAppointment(eventId);
      setSuccess(`Randevu olusturuldu! (Event #${eventId})`);
      if (searchId) loadEvents(searchId);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSearch = () => {
    if (searchId) loadEvents(searchId);
  };

  return (
    <div className="page">
      <h2>Etkinlikler</h2>

      <form onSubmit={handleCreate} className="form-card">
        <h3>Yeni Etkinlik ({user.name} icin)</h3>
        <label>Baslangic</label>
        <input
          type="datetime-local"
          value={form.startTime}
          onChange={(e) => setForm({ ...form, startTime: e.target.value })}
          required
        />
        <label>Bitis</label>
        <input
          type="datetime-local"
          value={form.endTime}
          onChange={(e) => setForm({ ...form, endTime: e.target.value })}
          required
        />
        <button type="submit" className="btn-primary">Olustur</button>
      </form>

      <div className="form-card">
        <h3>Etkinlikleri Listele</h3>
        <div className="inline-form">
          <input
            placeholder="Kullanici ID"
            type="number"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />
          <button className="btn-primary" onClick={handleSearch}>Ara</button>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <div className="list">
        {events.length === 0 && searchId && <p className="empty">Etkinlik bulunamadi.</p>}
        {events.map((ev) => (
          <div key={ev.id} className="list-item">
            <div>
              <strong>Event #{ev.id}</strong>
              <span className="sub">
                {new Date(ev.startTime).toLocaleString("tr-TR")} — {new Date(ev.endTime).toLocaleString("tr-TR")}
              </span>
            </div>
            {!ev.available ? (
              <span className="badge badge-red">Dolu</span>
            ) : user && ev.userId === user.id ? (
              <span className="badge">Kendi Etkinligin</span>
            ) : (
              <button className="btn-book" onClick={() => handleBook(ev.id)}>Randevu Al</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
