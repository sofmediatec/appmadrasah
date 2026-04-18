const API_URL = "https://script.google.com/macros/s/AKfycbxUexWANnqC_zPN2-08j1iOGqokmFnRo14DqwjBp5AA0tq30Nu5uaPUAODvVkH7fEbfPg/exec";

/* =========================
   HELPER
========================= */

// timeout biar tidak hang
function fetchWithTimeout(resource, options = {}, timeout = 15000) {
  return Promise.race([
    fetch(resource, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), timeout)
    )
  ]);
}

// parse JSON aman
async function parseJSON(res) {
  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("❌ Response bukan JSON:", text);
    throw new Error("Response server tidak valid");
  }
}

// helper query builder
function buildQuery(params = {}) {
  return Object.keys(params)
    .filter(k => params[k] !== undefined && params[k] !== null && params[k] !== "")
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join("&");
}

/* =========================
   POST (SUPER STABLE)
========================= */

function post(action, data = {}, token = "") {

  if (!action) {
    return Promise.resolve({
      status: "error",
      message: "Action kosong"
    });
  }

  // 👉 kirim action & token di URL (fallback)
  let url = `${API_URL}?action=${encodeURIComponent(action)}`;
  if (token) url += `&token=${encodeURIComponent(token)}`;

  // 👉 kirim juga di BODY (biar 100% kebaca GAS)
  const formData = new URLSearchParams();

  formData.append("action", action);
  if (token) formData.append("token", token);

  for (let key in data) {
    if (data[key] !== undefined && data[key] !== null) {
      formData.append(key, data[key]);
    }
  }

  return fetchWithTimeout(url, {
    method: "POST",
    body: formData
  })
  .then(async res => {
    if (!res.ok) {
      throw new Error("HTTP Error " + res.status);
    }
    return await parseJSON(res);
  })
  .catch(err => {
    console.error("❌ POST ERROR:", err);

    return {
      status: "error",
      message: err.message || "Gagal koneksi ke server"
    };
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

  const query = buildQuery({ action, ...params });
  const url = `${API_URL}?${query}`;

  return fetchWithTimeout(url)
  .then(async res => {
    if (!res.ok) {
      throw new Error("HTTP Error " + res.status);
    }
    return await parseJSON(res);
  })
  .catch(err => {
    console.error("❌ GET ERROR:", err);

    return {
      status: "error",
      message: err.message || "Gagal koneksi ke server"
    };
  });
}

/* =========================
   AUTH HELPER
========================= */

// ambil token aman
function getToken(){
  return localStorage.getItem("token") || "";
}

// set token
function setToken(token){
  localStorage.setItem("token", token);
}

// cek login
function isLoggedIn(){
  return !!getToken();
}

// logout global
function logout(){
  localStorage.removeItem("token");
  window.location = "login.html";
}

/* =========================
   DEBUG (OPSIONAL)
========================= */

function debugLog(label, data){
  console.log("🔎", label, data);
}
