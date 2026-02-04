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
    <div className="page">
      <div className="form-card" style={{ maxWidth: 400, margin: "4rem auto" }}>
        <h2 style={{ marginBottom: "1.2rem", textAlign: "center" }}>
          {isRegister ? "Kayit Ol" : "Giris Yap"}
        </h2>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <label>Ad</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </>
          )}
          <label>E-posta</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <label>Sifre</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: "0.5rem" }}>
            {isRegister ? "Kayit Ol" : "Giris Yap"}
          </button>
        </form>

        {error && <p className="error" style={{ marginTop: "0.8rem" }}>{error}</p>}

        <p style={{ marginTop: "1rem", textAlign: "center", fontSize: "0.85rem", color: "#666" }}>
          {isRegister ? "Zaten hesabiniz var mi?" : "Hesabiniz yok mu?"}{" "}
          <span
            style={{ color: "#4fc3f7", cursor: "pointer", fontWeight: 600 }}
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
  );
}
