const BASE = "http://localhost:8080";

async function parseError(res) {
  const text = await res.text();
  try {
    const json = JSON.parse(text);
    return json.message || json.error || text;
  } catch {
    return text;
  }
}

export async function createUser(data) {
  const res = await fetch(`${BASE}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function getUserById(id) {
  const res = await fetch(`${BASE}/users/${id}`);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function createEvent(data) {
  const res = await fetch(`${BASE}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function getEventsByUser(userId) {
  const res = await fetch(`${BASE}/events/user/${userId}`);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function createAppointment(eventId, bookedBy) {
  const res = await fetch(`${BASE}/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventId, bookedBy }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function getAppointmentsByUser(userId) {
  const res = await fetch(`${BASE}/appointments/user/${userId}`);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function cancelAppointment(id, userId) {
  const res = await fetch(`${BASE}/appointments/${id}/user/${userId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}
