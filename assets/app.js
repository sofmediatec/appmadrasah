const API_URL = "https://script.google.com/macros/s/AKfycbxUexWANnqC_zPN2-08j1iOGqokmFnRo14DqwjBp5AA0tq30Nu5uaPUAODvVkH7fEbfPg/exec";

/* ========= HELPER ========= */

// timeout fetch (biar tidak hang)
function fetchWithTimeout(resource, options = {}, timeout = 15000) {
  return Promise.race([
    fetch(resource, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), timeout)
    )
  ]);
}

// POST
function post(action, data = {}, token = "") {
  const formData = new URLSearchParams();

  for (let key in data) {
    formData.append(key, data[key]);
  }

  const url = `${API_URL}?action=${action}&token=${token}`;

  return fetchWithTimeout(url, {
    method: "POST",
    body: formData
  })
  .then(async res => {
    const text = await res.text();

    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("Response bukan JSON:", text);
      throw new Error("Response server tidak valid");
    }
  })
  .catch(err => {
    console.error("POST ERROR:", err);
    return {
      status: "error",
      message: err.message || "Gagal koneksi ke server"
    };
  });
}
// GET
function get(action) {
  const url = `${API_URL}?action=${action}`;

  return fetchWithTimeout(url)
  .then(async res => {
    const text = await res.text();

    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("Response bukan JSON:", text);
      throw new Error("Response server tidak valid");
    }
  })
  .catch(err => {
    console.error("GET ERROR:", err);
    return {
      status: "error",
      message: err.message || "Gagal koneksi ke server"
    };
  });
}
