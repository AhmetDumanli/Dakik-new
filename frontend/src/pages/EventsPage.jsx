import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { createEvent, getEventsByUser, getPublicEvents, createAppointment, getUserByName } from "../api";

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ startTime: "", endTime: "", isPublic: true });
  const [searchName, setSearchName] = useState("");
  const [activeTab, setActiveTab] = useState("public");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadPublicEvents = async () => {
    try {
      const data = await getPublicEvents();
      setEvents(data);
    } catch {
      setEvents([]);
    }
  };

  const loadUserEvents = async (userId) => {
    try {
      const data = await getEventsByUser(userId);
      setEvents(data);
    } catch (err) {
      setError(err.message);
      setEvents([]);
    }
  };

  useEffect(() => {
    loadPublicEvents();
  }, []);

  useEffect(() => {
    if (activeTab === "public") {
      loadPublicEvents();
    } else if (activeTab === "my" && user) {
      loadUserEvents(user.id);
    }
  }, [activeTab, user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createEvent({
        startTime: form.startTime,
        endTime: form.endTime,
        isPublic: form.isPublic,
      });
      setForm({ startTime: "", endTime: "", isPublic: true });
      if (activeTab === "my") loadUserEvents(user.id);
      else loadPublicEvents();
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
      if (activeTab === "public") loadPublicEvents();
      else if (activeTab === "my") loadUserEvents(user.id);
      else if (searchName) handleSearch();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSearch = async () => {
    if (searchName) {
      setError("");
      try {
        const foundUser = await getUserByName(searchName);
        setActiveTab("search");
        loadUserEvents(foundUser.id);
      } catch (err) {
        setError(err.message);
      }
    }
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
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
          <input
            type="checkbox"
            checked={form.isPublic}
            onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
          />
          Public Etkinlik
        </label>
        <button type="submit" className="btn-primary">Olustur</button>
      </form>

      <div className="form-card">
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          <button
            className={activeTab === "public" ? "btn-primary" : "btn-small"}
            onClick={() => setActiveTab("public")}
          >
            Public Etkinlikler
          </button>
          <button
            className={activeTab === "my" ? "btn-primary" : "btn-small"}
            onClick={() => setActiveTab("my")}
          >
            Etkinliklerim
          </button>
        </div>
        <div className="inline-form">
          <input
            placeholder="Kullanici Adi"
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
          <button className="btn-primary" onClick={handleSearch}>Ara</button>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <div className="list">
        {events.length === 0 && <p className="empty">Etkinlik bulunamadi.</p>}
        {events.map((ev) => (
          <div key={ev.id} className="list-item">
            <div>
              <strong>Event #{ev.id}</strong>
              <span className="sub">
                {new Date(ev.startTime).toLocaleString("tr-TR")} — {new Date(ev.endTime).toLocaleString("tr-TR")}
              </span>
              {!ev.public && <span className="badge" style={{ marginLeft: "0.5rem" }}>Private</span>}
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
