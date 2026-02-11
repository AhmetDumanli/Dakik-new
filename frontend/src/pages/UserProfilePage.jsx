import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getUserById,
  checkCanView,
  getEventsByUser,
  sendFriendRequest,
  createAppointment,
} from "../api";

export default function UserProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [canView, setCanView] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    if (user && String(id) === String(user.id)) {
      navigate("/profile", { replace: true });
      return;
    }
    if (user && id) loadProfile();
  }, [id, user]);

  async function loadProfile() {
    setLoading(true);
    setError("");
    try {
      const [profileData, canViewResult] = await Promise.all([
        getUserById(id),
        checkCanView(id, user.id),
      ]);
      setProfile(profileData);
      setCanView(canViewResult);

      if (canViewResult) {
        try {
          const eventsData = await getEventsByUser(id);
          setEvents(eventsData);
        } catch {
          setEvents([]);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendFriendRequest() {
    setError("");
    setSuccess("");
    try {
      await sendFriendRequest(id);
      setSuccess("Arkadas istegi gonderildi!");
      setRequestSent(true);
    } catch (err) {
      if (err.message?.toLowerCase().includes("already")) {
        setRequestSent(true);
        setSuccess("Arkadas istegi zaten gonderilmis.");
      } else {
        setError(err.message);
      }
    }
  }

  async function handleBook(eventId) {
    setError("");
    setSuccess("");
    try {
      await createAppointment(eventId);
      setSuccess("Randevu olusturuldu!");
      const eventsData = await getEventsByUser(id);
      setEvents(eventsData);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return {
      day: d.getDate(),
      month: d.toLocaleString("tr-TR", { month: "short" }).toUpperCase(),
      time: d.toLocaleString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
    };
  }

  if (loading) {
    return (
      <div className="page">
        <div className="profile-card">
          <div className="profile-banner" />
          <div className="profile-body" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
            <p className="sub">Yukleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="page">
        <div className="profile-card">
          <div className="profile-banner" />
          <div className="profile-body" style={{ textAlign: "center", padding: "2rem 1.5rem" }}>
            {error && <p className="error">{error}</p>}
            <button onClick={loadProfile} className="btn-primary" style={{ marginTop: "1rem" }}>
              Tekrar Dene
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <div className="profile-card">
        <div className="profile-banner" />
        <div className="profile-avatar-wrapper">
          {profile.profilePhotoUrl ? (
            <img src={profile.profilePhotoUrl} alt="Profil" className="profile-avatar" />
          ) : (
            <div className="profile-avatar profile-avatar-placeholder">
              {profile.name?.charAt(0)?.toUpperCase()}
            </div>
          )}
        </div>
        <div className="profile-body">
          <h2 className="profile-name">{profile.name}</h2>

          {canView ? (
            <>
              <p className="profile-email">{profile.email}</p>
              <div className="profile-info-grid">
                <div className="profile-info-item">
                  <span className="profile-info-label">Hakkinda</span>
                  <span className="profile-info-value">
                    {profile.bio || "Henuz bio eklenmedi"}
                  </span>
                </div>
                <div className="profile-info-item">
                  <span className="profile-info-label">Gorunurluk</span>
                  <span className={`badge ${profile.public ? "badge-green" : ""}`}>
                    {profile.public ? "Herkese Acik" : "Gizli"}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="profile-restricted">
              <p>Bu kullanicinin profili gizli.</p>
              {!requestSent ? (
                <button className="btn-primary" onClick={handleSendFriendRequest} style={{ marginTop: "1rem" }}>
                  Arkadas Istegi Gonder
                </button>
              ) : (
                <span className="badge" style={{ marginTop: "1rem", display: "inline-block" }}>Beklemede</span>
              )}
            </div>
          )}
        </div>
      </div>

      {canView && events.length > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          <h3 className="section-title">Etkinlikler</h3>
          <div className="event-list">
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
                    {ev.description && (
                      <div className="event-card-desc">{ev.description}</div>
                    )}
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
      )}

      {canView && events.length === 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          <h3 className="section-title">Etkinlikler</h3>
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <p>Bu kullanicinin etkinligi yok.</p>
          </div>
        </div>
      )}
    </div>
  );
}
