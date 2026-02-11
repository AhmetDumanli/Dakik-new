import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getMyFriends,
  getPendingFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriendship,
} from "../api";

export default function FriendsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [pending, setPending] = useState([]);
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
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <div className="page"><p>Yukleniyor...</p></div>;

  return (
    <div className="page">
      <h2>Arkadaslar</h2>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

<<<<<<< Updated upstream
      <form onSubmit={handleSendRequest} className="form-card">
        <h3>Arkadas Istegi Gonder</h3>
        <div className="inline-form">
          <input
            placeholder="Kullanici Adi"
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
        <div className="form-card">
          <h3>Bekleyen Istekler ({pending.length})</h3>
          <div className="list">
            {pending.map((req) => (
<<<<<<< Updated upstream
              <div key={req.id} className="list-item">
                <div>
                  <strong>{req.requester.name}</strong>
                  <span className="sub">{req.requester.email}</span>
=======
              <div key={req.id} className="friend-card friend-card-pending">
                <div className="friend-card-left" onClick={() => navigate(`/user/${req.requester.id}`)} style={{ cursor: "pointer" }}>
                  <Avatar name={req.requester.name} photoUrl={req.requester.profilePhotoUrl} />
                  <div>
                    <strong>{req.requester.name}</strong>
                    <span className="sub">{req.requester.email}</span>
                  </div>
>>>>>>> Stashed changes
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button className="btn-book" onClick={() => handleAccept(req.id)}>Kabul Et</button>
                  <button className="btn-small" onClick={() => handleReject(req.id)}>Reddet</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="form-card">
        <h3>Arkadaslarim ({friends.length})</h3>
        {friends.length === 0 ? (
<<<<<<< Updated upstream
          <p className="empty">Henuz arkadasin yok.</p>
=======
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <p>Henuz arkadasin yok.</p>
            <span className="sub">Navbar'dan kullanici arayarak arkadas istegi gonderebilirsin.</span>
          </div>
>>>>>>> Stashed changes
        ) : (
          <div className="list">
            {friends.map((f) => {
              const friend = f.requester.id === user.id ? f.addressee : f.requester;
              return (
<<<<<<< Updated upstream
                <div key={f.id} className="list-item">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
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
=======
                <div key={f.id} className="friend-card">
                  <div className="friend-card-left" onClick={() => navigate(`/user/${friend.id}`)} style={{ cursor: "pointer" }}>
                    <Avatar name={friend.name} photoUrl={friend.profilePhotoUrl} />
>>>>>>> Stashed changes
                    <div>
                      <strong>{friend.name}</strong>
                      <span className="sub">{friend.email}</span>
                    </div>
                  </div>
                  <button className="btn-small" onClick={() => handleRemove(f.id)}>Kaldir</button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
