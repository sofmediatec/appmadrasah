const API_URL = "https://script.google.com/macros/s/AKfycbxBStbim9L74DNokYXkrDDiwDp-j9wiEFmuJQ3hHP7w9UPUas-FmvUHPRMdhfgRlwzh/exec";

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
  } catch (e) {
    console.error("❌ Bukan JSON:", text);
    return {
      status: "error",
      message: "Response server tidak valid"
    };
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

    if (!res.ok) {
      throw new Error("HTTP " + res.status);
    }

    const data = await parseJSON(res);

    // 🔥 AUTO HANDLE TOKEN EXPIRED
    if (data.status === "unauthorized") {
      alert("Session habis, silakan login ulang");
      logout();
      return;
    }

    return data;

  } catch (err) {
    console.error("❌ REQUEST ERROR:", err);

    return {
      status: "error",
      message: err.message || "Koneksi gagal"
    };
  }
}

/* =========================
   POST (FIX FINAL)
========================= */

function post(action, data = {}, token = "") {

  if (!action) {
    return Promise.resolve({
      status: "error",
      message: "Action kosong"
    });
  }

  // 🔥 WAJIB: action & token di URL
  let url = `${API_URL}?action=${encodeURIComponent(action)}`;
  if (token) url += `&token=${encodeURIComponent(token)}`;

  // 🔥 Kirim juga di body (double safe)
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
   GET
========================= */

function get(action, params = {}) {

  if (!action) {
    return Promise.resolve({
      status: "error",
      message: "Action kosong"
    });
  }

  const url = `${API_URL}?${buildQuery({ action, ...params })}`;

  return request(url);
}

/* =========================
   AUTH HELPER
========================= */

function getToken(){
  return localStorage.getItem("token") || "";
}

function setToken(token){
  localStorage.setItem("token", token);
}

function isLoggedIn(){
  return !!getToken();
}

function logout(){
  localStorage.clear();
  window.location = "login.html";
}

/* =========================
   DEBUG
========================= */

function debugLog(label, data){
  console.log("🔎", label, data);
}
