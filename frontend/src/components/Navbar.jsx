import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { searchUsers } from "../api";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const timerRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearchChange(e) {
    const val = e.target.value;
    setQuery(val);

    if (timerRef.current) clearTimeout(timerRef.current);

    if (val.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    timerRef.current = setTimeout(async () => {
      try {
        const data = await searchUsers(val.trim());
        const filtered = data.filter((u) => u.id !== user?.id);
        setResults(filtered);
        setShowDropdown(filtered.length > 0);
      } catch {
        setResults([]);
        setShowDropdown(false);
      }
    }, 300);
  }

  function handleSelectUser(userId) {
    setQuery("");
    setResults([]);
    setShowDropdown(false);
    navigate(`/user/${userId}`);
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">Dakik</div>
      {isAuthenticated && (
        <>
          <div className="navbar-links">
            <NavLink to="/events">Etkinlikler</NavLink>
            <NavLink to="/appointments">Randevular</NavLink>
            <NavLink to="/friends">Arkadaslar</NavLink>
            <NavLink to="/profile">Profil</NavLink>
          </div>
          <div className="navbar-search" ref={dropdownRef}>
            <input
              type="text"
              placeholder="Kullanici ara..."
              value={query}
              onChange={handleSearchChange}
              className="navbar-search-input"
            />
            {showDropdown && (
              <div className="navbar-search-dropdown">
                {results.map((u) => (
                  <div
                    key={u.id}
                    className="navbar-search-item"
                    onClick={() => handleSelectUser(u.id)}
                  >
                    <div className="navbar-search-avatar">
                      {u.profilePhotoUrl ? (
                        <img src={u.profilePhotoUrl} alt="" />
                      ) : (
                        <span>{u.name?.charAt(0)?.toUpperCase()}</span>
                      )}
                    </div>
                    <div className="navbar-search-info">
                      <strong>{u.name}</strong>
                      <span>{u.email}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="navbar-user">
            <span>{user.name}</span>
            <button onClick={handleLogout} className="btn-small">Cikis</button>
          </div>
        </>
      )}
    </nav>
  );
}
