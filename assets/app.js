const API_URL = "https://script.google.com/macros/s/AKfycbxUexWANnqC_zPN2-08j1iOGqokmFnRo14DqwjBp5AA0tq30Nu5uaPUAODvVkH7fEbfPg/exec";

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
   PARSE RESPONSE
========================= */
async function parseJSON(res) {
  const text = await res.text();

  console.log("RAW RESPONSE:", text);

  try {
    return JSON.parse(text);
  } catch (e) {
    return {
      status: "error",
      message: "Server tidak mengembalikan JSON",
      raw: text
    };
  }
}

/* =========================
   CORE REQUEST
========================= */
async function request(url, options = {}) {
  try {
    const res = await fetchWithTimeout(url, options);

    const data = await parseJSON(res);

    if (data.status === "unauthorized") {
      alert("Session habis, silakan login ulang");
      logout();
      return;
    }

    return data;

  } catch (err) {
    console.error("REQUEST ERROR:", err);
    return { status: "error", message: err.message };
  }
}

/* =========================
   POST (FIX TOTAL - JSON MODE)
========================= */
function post(action, data = {}, token = "") {

  const payload = {
    action,
    token,
    ...data
  };

  return request(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}

/* =========================
   GET
========================= */
function get(action, params = {}, token = "") {

  let query = { action, ...params };

  if (token) query.token = token;

  const url = API_URL + "?" + new URLSearchParams(query).toString();

  return request(url, {
    method: "GET"
  });
}

/* =========================
   AUTH
========================= */
function getToken() {
  return localStorage.getItem("token") || "";
}

function setToken(token) {
  localStorage.setItem("token", token);
}

function logout() {
  localStorage.clear();
  window.location = "login.html";
}
