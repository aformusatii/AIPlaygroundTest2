import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '/api/v1';

export const http = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API error', error);
    return Promise.reject(error);
  },
);
