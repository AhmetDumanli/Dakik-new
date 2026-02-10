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
  const [showForm, setShowForm] = useState(false);

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
      setShowForm(false);
      setSuccess("Etkinlik olusturuldu!");
      if (activeTab === "my") loadUserEvents(user.id);
      else loadPublicEvents();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBook = async (eventId) => {
    setError("");
    setSuccess("");
    try {
      await createAppointment(eventId);
      setSuccess("Randevu olusturuldu!");
      if (activeTab === "public") loadPublicEvents();
      else if (activeTab === "my") loadUserEvents(user.id);
      else if (searchName) handleSearch();
      setTimeout(() => setSuccess(""), 3000);
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

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return {
      day: d.getDate(),
      month: d.toLocaleString("tr-TR", { month: "short" }).toUpperCase(),
      time: d.toLocaleString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
    };
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>Etkinlikler</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Kapat" : "+ Yeni Etkinlik"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="form-card event-form">
          <h3>Yeni Etkinlik</h3>
          <div className="event-form-row">
            <div className="event-form-field">
              <label>Baslangic</label>
              <input
                type="datetime-local"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                required
              />
            </div>
            <div className="event-form-field">
              <label>Bitis</label>
              <input
                type="datetime-local"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="event-form-footer">
            <label className="profile-toggle-label">
              <span>Herkese Acik</span>
              <div className={`profile-toggle ${form.isPublic ? "active" : ""}`}
                onClick={() => setForm({ ...form, isPublic: !form.isPublic })}>
                <div className="profile-toggle-knob" />
              </div>
            </label>
            <button type="submit" className="btn-primary">Olustur</button>
          </div>
        </form>
      )}

      <div className="tabs-bar">
        <div className="tabs-pills">
          <button
            className={`tab-pill ${activeTab === "public" ? "active" : ""}`}
            onClick={() => setActiveTab("public")}
          >
            Herkese Acik
          </button>
          <button
            className={`tab-pill ${activeTab === "my" ? "active" : ""}`}
            onClick={() => setActiveTab("my")}
          >
            Etkinliklerim
          </button>
        </div>
        <div className="tabs-search">
          <input
            placeholder="Kullanici ara..."
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button className="btn-primary" onClick={handleSearch}>Ara</button>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <div className="event-list">
        {events.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <p>Etkinlik bulunamadi.</p>
          </div>
        )}
        {events.map((ev) => {
          const start = formatDate(ev.startTime);
          const end = formatDate(ev.endTime);
          return (
            <div key={ev.id} className="event-card">
              <div className="event-date-badge">
                <span className="event-date-day">{start.day}</span>
                <span className="event-date-month">{start.month}</span>
              </div>
              <div className="event-card-body">
                <div className="event-card-time">
                  {start.time} — {end.time}
                </div>
                <div className="event-card-meta">
                  Event #{ev.id}
                  {!ev.public && <span className="badge">Gizli</span>}
                </div>
              </div>
              <div className="event-card-action">
                {!ev.available ? (
                  <span className="badge badge-red">Dolu</span>
                ) : user && ev.userId === user.id ? (
                  <span className="badge badge-green">Kendi Etkinligin</span>
                ) : (
                  <button className="btn-book" onClick={() => handleBook(ev.id)}>Randevu Al</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
