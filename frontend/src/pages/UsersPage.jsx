import { useState } from "react";
import { createUser } from "../api";

export default function UsersPage({ users, setUsers, activeUser, setActiveUser }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const user = await createUser(form);
      setUsers([...users, user]);
      setForm({ name: "", email: "", password: "" });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page">
      <h2>Kullanıcılar</h2>

      <form onSubmit={handleSubmit} className="form-card">
        <h3>Yeni Kullanıcı</h3>
        <input
          placeholder="Ad"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          placeholder="Şifre"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <button type="submit" className="btn-primary">Oluştur</button>
        {error && <p className="error">{error}</p>}
      </form>

      <div className="list">
        <h3>Kayıtlı Kullanıcılar</h3>
        {users.length === 0 && <p className="empty">Henüz kullanıcı yok.</p>}
        {users.map((u) => (
          <div
            key={u.id}
            className={`list-item ${activeUser?.id === u.id ? "active" : ""}`}
            onClick={() => setActiveUser(u)}
          >
            <div>
              <strong>{u.name}</strong>
              <span className="sub">{u.email}</span>
            </div>
            {activeUser?.id === u.id ? (
              <span className="badge">Seçili</span>
            ) : (
              <button className="btn-small" onClick={() => setActiveUser(u)}>Seç</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
