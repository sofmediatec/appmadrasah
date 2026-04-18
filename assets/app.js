const API_URL = "ISI_URL_APPS_SCRIPT_KAMU";

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
