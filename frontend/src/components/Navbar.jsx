import { NavLink } from "react-router-dom";

export default function Navbar({ activeUser, onClearUser }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">Dakik</div>
      <div className="navbar-links">
        <NavLink to="/users">Kullanıcılar</NavLink>
        <NavLink to="/events">Etkinlikler</NavLink>
        <NavLink to="/appointments">Randevular</NavLink>
      </div>
      {activeUser && (
        <div className="navbar-user">
          <span>👤 {activeUser.name}</span>
          <button onClick={onClearUser} className="btn-small">Çıkış</button>
        </div>
      )}
    </nav>
  );
}
