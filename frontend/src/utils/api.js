const API_BASE = import.meta.env.VITE_API_BASE_URL;

// const API_BASE=`http://localhost:5000/api/v1`

/**
 * Makes an authenticated API request.
 * Automatically injects the JWT token from localStorage.
 */
const api = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    }
  };

  const res = await fetch(`${API_BASE}${endpoint}`, config);

  let data;
  try {
    data = await res.json();
  } catch {
    data = { message: 'Server returned an invalid response' };
  }

  // If token is expired or invalid, clear auth state
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Dispatch custom event so AuthContext can react
    window.dispatchEvent(new Event('auth:logout'));
  }

  if (!res.ok) {
    const error = new Error(data?.message || 'API request failed');
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
};

// Convenience methods
api.get = (endpoint) => api(endpoint, { method: 'GET' });

api.post = (endpoint, body) =>
  api(endpoint, {
    method: 'POST',
    body: JSON.stringify(body)
  });

api.put = (endpoint, body) =>
  api(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body)
  });

api.delete = (endpoint) => api(endpoint, { method: 'DELETE' });

export default api;
