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

// parse response aman
async function parseJSON(res) {
  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("❌ Response bukan JSON:", text);
    throw new Error("Response server tidak valid");
  }
}

/* =========================
   POST
========================= */

function post(action, data = {}, token = "") {

  if (!action) {
    return Promise.resolve({
      status: "error",
      message: "Action kosong"
    });
  }

  // build URL
  let url = `${API_URL}?action=${encodeURIComponent(action)}`;

  if (token) {
    url += `&token=${encodeURIComponent(token)}`;
  }

  // form body (AMAN untuk GAS)
  const formData = new URLSearchParams();

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

  let url = `${API_URL}?action=${encodeURIComponent(action)}`;

  // optional params
  for (let key in params) {
    if (params[key] !== undefined && params[key] !== null) {
      url += `&${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`;
    }
  }

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

// logout global
function logout(){
  localStorage.removeItem("token");
  window.location = "login.html";
}
