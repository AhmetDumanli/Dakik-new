import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getMyFriends,
  getPendingFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriendship,
  sendFriendRequest,
  getUserByName,
} from "../api";

export default function FriendsPage() {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [pending, setPending] = useState([]);
  const [friendName, setFriendName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [friendsData, pendingData] = await Promise.all([
        getMyFriends(),
        getPendingFriendRequests(),
      ]);
      setFriends(friendsData);
      setPending(pendingData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

<<<<<<< Updated upstream
  async function handleSendRequest(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const foundUser = await getUserByName(friendName);
      await sendFriendRequest(foundUser.id);
      setSuccess("Arkadas istegi gonderildi!");
      setFriendName("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  }

=======
>>>>>>> Stashed changes
  async function handleAccept(id) {
    setError("");
    setSuccess("");
    try {
      await acceptFriendRequest(id);
      setSuccess("Arkadas istegi kabul edildi!");
      loadData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleReject(id) {
    setError("");
    setSuccess("");
    try {
      await rejectFriendRequest(id);
      setSuccess("Arkadas istegi reddedildi.");
      loadData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemove(id) {
    setError("");
    setSuccess("");
    try {
      await removeFriendship(id);
      setSuccess("Arkadas kaldirildi.");
      loadData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  }

  function Avatar({ name, photoUrl, size = 44 }) {
    if (photoUrl) {
      return (
        <img
          src={photoUrl}
          alt=""
          style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }}
        />
      );
    }
    return (
      <div className="friend-avatar-placeholder" style={{ width: size, height: size, fontSize: size * 0.4 }}>
        {name?.charAt(0)?.toUpperCase()}
      </div>
    );
  }

  if (loading) return (
    <div className="page">
      <h2>Arkadaslar</h2>
      <p className="sub">Yukleniyor...</p>
    </div>
  );

  return (
    <div className="page">
      <div className="page-header">
        <h2>Arkadaslar</h2>
        {friends.length > 0 && <span className="badge">{friends.length} arkadas</span>}
      </div>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

<<<<<<< Updated upstream
      <form onSubmit={handleSendRequest} className="form-card friend-add-form">
        <h3>Arkadas Ekle</h3>
        <div className="inline-form">
          <input
            placeholder="Kullanici adi yazin..."
            type="text"
            value={friendName}
            onChange={(e) => setFriendName(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary">Istek Gonder</button>
        </div>
      </form>

=======
>>>>>>> Stashed changes
      {pending.length > 0 && (
        <div className="friend-section">
          <h3 className="section-title">
            Bekleyen Istekler
            <span className="badge badge-red" style={{ marginLeft: "0.5rem" }}>{pending.length}</span>
          </h3>
          <div className="friend-list">
            {pending.map((req) => (
<<<<<<< Updated upstream
              <div key={req.id} className="friend-card friend-card-pending">
                <div className="friend-card-left">
                  <Avatar name={req.requester.name} photoUrl={req.requester.profilePhotoUrl} />
=======
              <div key={req.id} className="list-item">
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }} onClick={() => navigate(`/user/${req.requester.id}`)}>
                  {req.requester.profilePhotoUrl ? (
                    <img
                      src={req.requester.profilePhotoUrl}
                      alt=""
                      style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{
                      width: 40, height: 40, borderRadius: "50%", background: "#ddd",
                      display: "flex", alignItems: "center", justifyContent: "center", color: "#888"
                    }}>
                      {req.requester.name?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
>>>>>>> Stashed changes
                  <div>
                    <strong>{req.requester.name}</strong>
                    <span className="sub">{req.requester.email}</span>
                  </div>
                </div>
                <div className="friend-card-actions">
                  <button className="btn-book" onClick={() => handleAccept(req.id)}>Kabul Et</button>
                  <button className="btn-secondary" onClick={() => handleReject(req.id)}>Reddet</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="friend-section">
        <h3 className="section-title">Arkadaslarim</h3>
        {friends.length === 0 ? (
<<<<<<< Updated upstream
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <p>Henuz arkadasin yok.</p>
            <span className="sub">Yukaridaki alandan arkadas istegi gonderebilirsin.</span>
          </div>
=======
          <p className="empty">Henuz arkadasin yok. Navbar'dan kullanici arayarak arkadas istegi gonderebilirsin.</p>
>>>>>>> Stashed changes
        ) : (
          <div className="friend-list">
            {friends.map((f) => {
              const friend = f.requester.id === user.id ? f.addressee : f.requester;
              return (
<<<<<<< Updated upstream
                <div key={f.id} className="friend-card">
                  <div className="friend-card-left">
                    <Avatar name={friend.name} photoUrl={friend.profilePhotoUrl} />
=======
                <div key={f.id} className="list-item">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }} onClick={() => navigate(`/user/${friend.id}`)}>
                    {friend.profilePhotoUrl ? (
                      <img
                        src={friend.profilePhotoUrl}
                        alt=""
                        style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }}
                      />
                    ) : (
                      <div style={{
                        width: 40, height: 40, borderRadius: "50%", background: "#ddd",
                        display: "flex", alignItems: "center", justifyContent: "center", color: "#888"
                      }}>
                        {friend.name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
>>>>>>> Stashed changes
                    <div>
                      <strong>{friend.name}</strong>
                      <span className="sub">{friend.email}</span>
                    </div>
                  </div>
                  <button className="btn-secondary" onClick={() => handleRemove(f.id)}>Kaldir</button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
