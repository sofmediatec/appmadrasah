const API_URL = "https://script.google.com/macros/s/AKfycbxUexWANnqC_zPN2-08j1iOGqokmFnRo14DqwjBp5AA0tq30Nu5uaPUAODvVkH7fEbfPg/exec";

/* ========= HELPER ========= */
function post(action, data, token=""){
  return fetch(`${API_URL}?action=${action}&token=${token}`, {
    method: "POST",
    body: JSON.stringify(data)
  }).then(res => res.json());
}

function get(action){
  return fetch(`${API_URL}?action=${action}`)
    .then(res => res.json());
}
