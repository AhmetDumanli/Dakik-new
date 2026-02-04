const BASE = "http://localhost:8080";

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  const token = getToken();
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function parseError(res) {
  if (res.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
    return "Oturum suresi doldu. Lutfen tekrar giris yapin.";
  }
  const text = await res.text();
  try {
    const json = JSON.parse(text);
    return json.message || json.error || text;
  } catch {
    return text;
  }
}

// Auth endpoints (no token needed)
export async function registerUser(data) {
  const res = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function loginUser(data) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

// Protected endpoints
export async function getAllUsers() {
  const res = await fetch(`${BASE}/users`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function getUserById(id) {
  const res = await fetch(`${BASE}/users/${id}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function createEvent(data) {
  const res = await fetch(`${BASE}/events`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ startTime: data.startTime, endTime: data.endTime }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function getEventsByUser(userId) {
  const res = await fetch(`${BASE}/events/user/${userId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function getMyEvents() {
  const res = await fetch(`${BASE}/events/my`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function createAppointment(eventId) {
  const res = await fetch(`${BASE}/appointments`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ eventId }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function getMyAppointments() {
  const res = await fetch(`${BASE}/appointments/my`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function cancelAppointment(id) {
  const res = await fetch(`${BASE}/appointments/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}
