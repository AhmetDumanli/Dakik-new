import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate(isAuthenticated ? "/events" : "/login")}
        style={{ cursor: "pointer" }}>
        Dakik
      </div>
      {isAuthenticated && (
        <>
          <div className="navbar-links">
            <NavLink to="/events">Etkinlikler</NavLink>
            <NavLink to="/appointments">Randevular</NavLink>
            <NavLink to="/friends">Arkadaslar</NavLink>
            <NavLink to="/profile">Profil</NavLink>
          </div>
          <div className="navbar-user">
            <div className="navbar-avatar">
              {user.name?.charAt(0)?.toUpperCase()}
            </div>
            <span>{user.name}</span>
            <button onClick={handleLogout} className="navbar-logout">Cikis</button>
          </div>
        </>
      )}
    </nav>
  );
}
