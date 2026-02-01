import { useState, useEffect } from "react";
import { createEvent, getEventsByUser, createAppointment } from "../api";

export default function EventsPage({ activeUser }) {
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
    if (activeUser) {
      setSearchId(String(activeUser.id));
      loadEvents(activeUser.id);
    } else {
      setEvents([]);
      setSearchId("");
    }
  }, [activeUser]);

  useEffect(() => {
    if (searchId) loadEvents(searchId);
  }, [searchId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    if (!activeUser) {
      setError("Önce bir kullanıcı seçin.");
      return;
    }
    try {
      await createEvent({
        userId: activeUser.id,
        startTime: form.startTime,
        endTime: form.endTime,
      });
      setForm({ startTime: "", endTime: "" });
      loadEvents(activeUser.id);
      setSearchId(String(activeUser.id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBook = async (eventId) => {
    setError("");
    setSuccess("");
    if (!activeUser) {
      setError("Önce bir kullanıcı seçin.");
      return;
    }
    try {
      await createAppointment(eventId, activeUser.id);
      setSuccess(`Randevu oluşturuldu! (Event #${eventId})`);
      if (searchId) loadEvents(searchId);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page">
      <h2>Etkinlikler</h2>

      {activeUser && (
        <form onSubmit={handleCreate} className="form-card">
          <h3>Yeni Etkinlik ({activeUser.name} için)</h3>
          <label>Başlangıç</label>
          <input
            type="datetime-local"
            value={form.startTime}
            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            required
          />
          <label>Bitiş</label>
          <input
            type="datetime-local"
            value={form.endTime}
            onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            required
          />
          <button type="submit" className="btn-primary">Oluştur</button>
        </form>
      )}
      {!activeUser && <p className="warning">Etkinlik oluşturmak için bir kullanıcı seçin.</p>}

      <div className="form-card">
        <h3>Etkinlikleri Listele</h3>
        <div className="inline-form">
          <input
            placeholder="Kullanıcı ID"
            type="number"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />
          <button className="btn-primary" onClick={() => searchId && loadEvents(searchId)}>Ara</button>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <div className="list">
        {events.length === 0 && searchId && <p className="empty">Etkinlik bulunamadı.</p>}
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
            ) : activeUser && ev.userId === activeUser.id ? (
              <span className="badge">Kendi Etkinliğin</span>
            ) : (
              <button className="btn-book" onClick={() => handleBook(ev.id)}>Randevu Al</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
