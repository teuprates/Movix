(() => {
  const request = async (path, options = {}) => {
    const response = await fetch(`/api${path}`, { headers: { 'Content-Type': 'application/json', ...options.headers }, credentials: 'same-origin', ...options });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw Object.assign(new Error(data.error || 'Falha na solicitação.'), { status: response.status, data });
    return data;
  };
  window.MovixAPI = { get: (path) => request(path), post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }), put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }), patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }) };
})();
