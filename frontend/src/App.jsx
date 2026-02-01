import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import UsersPage from "./pages/UsersPage";
import EventsPage from "./pages/EventsPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import "./App.css";

export default function App() {
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);

  return (
    <BrowserRouter>
      <Navbar activeUser={activeUser} onClearUser={() => setActiveUser(null)} />
      <main>
        <Routes>
          <Route
            path="/users"
            element={
              <UsersPage
                users={users}
                setUsers={setUsers}
                activeUser={activeUser}
                setActiveUser={setActiveUser}
              />
            }
          />
          <Route path="/events" element={<EventsPage activeUser={activeUser} />} />
          <Route path="/appointments" element={<AppointmentsPage activeUser={activeUser} />} />
          <Route path="*" element={<Navigate to="/users" />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
