const API_URL = "https://script.google.com/macros/s/AKfycbzO5GWjtifcNZy2sRJDDZNKVPOb_mN6D7YMf-oigonnbUwO9BROyHXWu3NYXbb33YoU/exec";

/* =========================
   HELPER
========================= */

function fetchWithTimeout(resource, options = {}, timeout = 15000) {
  return Promise.race([
    fetch(resource, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), timeout)
    )
  ]);
}

async function parseJSON(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    console.error("Response bukan JSON:", text);
    return { status: "error", message: "Response tidak valid" };
  }
}

function buildQuery(params = {}) {
  return Object.keys(params)
    .filter(k => params[k] !== undefined && params[k] !== null && params[k] !== "")
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join("&");
}

/* =========================
   CORE REQUEST
========================= */

async function request(url, options = {}) {
  try {
    const res = await fetchWithTimeout(url, options);

    if (!res.ok) throw new Error("HTTP " + res.status);

    const data = await parseJSON(res);

    if (data.status === "unauthorized") {
      alert("Session habis, login ulang");
      logout();
      return;
    }

    return data;

  } catch (err) {
    console.error("REQUEST ERROR:", err);
    return { status: "error", message: err.message || "Koneksi gagal" };
  }
}

/* =========================
   POST (KOMPATIBEL GAS)
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
   GET (FIX TOKEN)
========================= */

function get(action, params = {}, token = "") {

  let query = { action, ...params };

  // 🔥 FIX: token WAJIB ikut
  if (token) query.token = token;

  const url = `${API_URL}?${buildQuery(query)}`;

  return request(url);
}

/* =========================
   AUTH
========================= */

function getToken(){
  return localStorage.getItem("token") || "";
}

function setToken(token){
  localStorage.setItem("token", token);
}

function logout(){
  localStorage.clear();
  window.location = "login.html";
}
