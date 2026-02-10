import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { loginUser, registerUser } from "../api";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const auth = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = isRegister
        ? await registerUser(form)
        : await loginUser({ email: form.email, password: form.password });
      auth.login(response);
      navigate("/events");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-brand">Dakik</h1>
          <p className="login-subtitle">Randevu ve etkinlik yonetimi</p>
        </div>

        <div className="login-body">
          <h2 className="login-title">{isRegister ? "Kayit Ol" : "Giris Yap"}</h2>

          <form onSubmit={handleSubmit}>
            {isRegister && (
              <div className="login-field">
                <label>Ad</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Adinizi girin"
                  required
                />
              </div>
            )}
            <div className="login-field">
              <label>E-posta</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="ornek@email.com"
                required
              />
            </div>
            <div className="login-field">
              <label>Sifre</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Sifrenizi girin"
                required
              />
            </div>
            <button type="submit" className="btn-primary login-btn">
              {isRegister ? "Kayit Ol" : "Giris Yap"}
            </button>
          </form>

          {error && <p className="error">{error}</p>}

          <p className="login-switch">
            {isRegister ? "Zaten hesabiniz var mi?" : "Hesabiniz yok mu?"}{" "}
            <span
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
              }}
            >
              {isRegister ? "Giris Yap" : "Kayit Ol"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
