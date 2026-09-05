import axios from 'axios';

let rawBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Automatically append /api if omitted in Vercel environment variables
if (rawBaseURL && !rawBaseURL.endsWith('/api')) {
    rawBaseURL = rawBaseURL.replace(/\/$/, '') + '/api';
}

const api = axios.create({
    baseURL: rawBaseURL
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;