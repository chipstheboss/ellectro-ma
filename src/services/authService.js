const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const AUTH_TOKEN_KEY = 'ellectro-ma-admin-token';
export const AUTH_USER_KEY = 'ellectro-ma-admin-user';

const parseResponse = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed.');
  }

  return data;
};

export const loginAdmin = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  return parseResponse(response);
};
