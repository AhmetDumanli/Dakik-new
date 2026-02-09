import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserById, updateProfile } from "../api";

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", bio: "", profilePhotoUrl: "", isPublic: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user) loadProfile();
  }, [user]);

  async function loadProfile() {
    setLoading(true);
    setError("");
    try {
      const data = await getUserById(user.id);
      setProfile(data);
      setForm({
        name: data.name || "",
        bio: data.bio || "",
        profilePhotoUrl: data.profilePhotoUrl || "",
        isPublic: data.public !== undefined ? data.public : true,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const updated = await updateProfile(form);
      setProfile(updated);
      setEditing(false);
      setSuccess("Profil guncellendi!");
      login({ token: localStorage.getItem("token"), user: { ...user, name: updated.name } });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="page"><h2>Profilim</h2><p>Yukleniyor...</p></div>;

  if (!profile) return (
    <div className="page">
      <h2>Profilim</h2>
      {error && <p className="error">{error}</p>}
      <button onClick={loadProfile} className="btn-primary">Tekrar Dene</button>
    </div>
  );

  return (
    <div className="page">
      <h2>Profilim</h2>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      {!editing ? (
        <div className="form-card">
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
            {profile.profilePhotoUrl ? (
              <img
                src={profile.profilePhotoUrl}
                alt="Profil"
                style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover" }}
              />
            ) : (
              <div style={{
                width: 80, height: 80, borderRadius: "50%", background: "#ddd",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", color: "#888"
              }}>
                {profile.name?.charAt(0)?.toUpperCase()}
              </div>
            )}
            <div>
              <h3 style={{ margin: 0 }}>{profile.name}</h3>
              <span className="sub">{profile.email}</span>
            </div>
          </div>
          <p><strong>Bio:</strong> {profile.bio || "Henuz bio eklenmedi"}</p>
          <p><strong>Gorunurluk:</strong> {profile.public ? "Public" : "Private"}</p>
          <button onClick={() => setEditing(true)} className="btn-primary">Duzenle</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="form-card">
          <h3>Profili Duzenle</h3>
          <label>Ad</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <label>Bio</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={3}
            style={{ width: "100%", padding: "0.5rem", borderRadius: 6, border: "1px solid #ccc" }}
          />
          <label>Profil Foto URL</label>
          <input
            type="url"
            value={form.profilePhotoUrl}
            onChange={(e) => setForm({ ...form, profilePhotoUrl: e.target.value })}
            placeholder="https://example.com/photo.jpg"
          />
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
            <input
              type="checkbox"
              checked={form.isPublic}
              onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
            />
            Public Profil
          </label>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
            <button type="button" className="btn-small" onClick={() => { setEditing(false); setError(""); }}>
              Iptal
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
