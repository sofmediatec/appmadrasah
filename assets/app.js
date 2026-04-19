const API_URL = "https://script.google.com/macros/s/AKfycbwQ2Y4oV1ugLiiCyEi-hcD8gSai7uvw03m_Cu79bTKzNRXIQ9ThW1gVur2NIsrQo0KjhA/exec";

/* =========================
   FETCH WITH TIMEOUT
========================= */
function fetchWithTimeout(resource, options = {}, timeout = 15000) {
  return Promise.race([
    fetch(resource, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), timeout)
    )
  ]);
}

/* =========================
   SAFE JSON PARSER
========================= */
async function parseJSON(res) {
  const text = await res.text();

  console.log("RAW RESPONSE:", text);

  try {
    return JSON.parse(text);
  } catch (e) {
    return {
      status: "error",
      message: "Server tidak mengembalikan JSON valid",
      raw: text
    };
  }
}

/* =========================
   CORE REQUEST ENGINE
========================= */
async function request(url, options = {}) {
  try {
    const res = await fetchWithTimeout(url, options);

    const data = await parseJSON(res);

    // session expired handling
    if (data.status === "unauthorized") {
      alert("Session habis, silakan login ulang");
      logout();
      return null;
    }

    return data;

  } catch (err) {
    console.error("REQUEST ERROR:", err);
    return { status: "error", message: err.message };
  }
}

/* =========================
   POST REQUEST (UNIVERSAL FIX)
========================= */
function post(action, data = {}, token = "") {

  let url = `${API_URL}?action=${encodeURIComponent(action)}`;

  if (token) url += `&token=${encodeURIComponent(token)}`;

  const formData = new URLSearchParams();

  formData.append("action", action);
  if (token) formData.append("token", token);

  for (let key in data) {
    if (data[key] !== undefined && data[key] !== null) {
      formData.append(key, data[key]);
    }
  }

  return request(url, {
    method: "POST",
    body: formData
  });
}

/* =========================
   GET REQUEST (UNIVERSAL FIX)
========================= */
function get(action, params = {}, token = "") {

  const query = {
    action,
    ...params,
    token: token || getToken()
  };

  const url = API_URL + "?" + new URLSearchParams(query).toString();

  return request(url, {
    method: "GET"
  });
}

/* =========================
   CRUD SHORTCUT (NEW - IMPORTANT)
   → biar frontend tidak ribet
========================= */

function apiGet(table) {
  return get("getAll", { table });
}

function apiCreate(table, data) {
  return post("create", { table, ...data });
}

function apiUpdate(table, data) {
  return post("update", { table, ...data });
}

function apiDelete(table, id) {
  return post("delete", { table, id });
}

/* =========================
   AUTH SYSTEM
========================= */
function getToken() {
  return localStorage.getItem("token") || "";
}

function setToken(token) {
  localStorage.setItem("token", token);
}

function setUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    return null;
  }
}

function logout() {
  localStorage.clear();
  window.location = "login.html";
}

/* =========================
   LOGIN HELPER (FIX CONSISTENT)
========================= */
async function login(email, password) {
  const res = await post("login", {
    email,
    password
  });

  if (res && res.status === "success") {
    setToken(res.token);
    setUser(res.user);
  }

  return res;
}

/* =========================
   DEBUG HELPER (OPTIONAL)
========================= */
function debugAPI() {
  console.log("TOKEN:", getToken());
  console.log("USER:", getUser());
}
