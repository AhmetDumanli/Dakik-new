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

  if (loading) return (
    <div className="page">
      <div className="profile-card">
        <div className="profile-banner" />
        <div className="profile-body" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
          <p className="sub">Yukleniyor...</p>
        </div>
      </div>
    </div>
  );

  if (!profile) return (
    <div className="page">
      <div className="profile-card">
        <div className="profile-banner" />
        <div className="profile-body" style={{ textAlign: "center", padding: "2rem 1.5rem" }}>
          {error && <p className="error">{error}</p>}
          <button onClick={loadProfile} className="btn-primary" style={{ marginTop: "1rem" }}>Tekrar Dene</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page">
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      {!editing ? (
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

            <button onClick={() => setEditing(true)} className="btn-primary profile-edit-btn">
              Profili Duzenle
            </button>
          </div>
        </div>
      ) : (
        <div className="profile-card">
          <div className="profile-banner" />
          <div className="profile-avatar-wrapper">
            {form.profilePhotoUrl ? (
              <img src={form.profilePhotoUrl} alt="Onizleme" className="profile-avatar" />
            ) : (
              <div className="profile-avatar profile-avatar-placeholder">
                {form.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
          </div>
          <form onSubmit={handleSubmit} className="profile-body">
            <h3 className="profile-edit-title">Profili Duzenle</h3>

            <div className="profile-form-group">
              <label>Ad</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="profile-form-group">
              <label>Hakkinda</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={3}
                placeholder="Kendiniz hakkinda bir seyler yazin..."
              />
            </div>

            <div className="profile-form-group">
              <label>Profil Foto URL</label>
              <input
                type="url"
                value={form.profilePhotoUrl}
                onChange={(e) => setForm({ ...form, profilePhotoUrl: e.target.value })}
                placeholder="https://example.com/photo.jpg"
              />
            </div>

            <div className="profile-form-group">
              <label className="profile-toggle-label">
                <span>Herkese Acik Profil</span>
                <div className={`profile-toggle ${form.isPublic ? "active" : ""}`}
                  onClick={() => setForm({ ...form, isPublic: !form.isPublic })}>
                  <div className="profile-toggle-knob" />
                </div>
              </label>
            </div>

            <div className="profile-form-actions">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
              <button type="button" className="btn-secondary" onClick={() => { setEditing(false); setError(""); }}>
                Iptal
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
