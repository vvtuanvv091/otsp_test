// Địa chỉ gốc của Backend.
// - Khi chạy local (`npm run dev`): để trống để dùng proxy của Vite (/api, /hubs → localhost:5084).
// - Khi build production (Vercel): đọc từ biến môi trường VITE_API_BASE_URL (ví dụ https://otsp-backend.onrender.com).
const rawOrigin = import.meta.env.PROD ? (import.meta.env.VITE_API_BASE_URL || '') : '';

export const API_ORIGIN = rawOrigin.trim().replace(/\/+$/, '');
export const API_BASE_URL = `${API_ORIGIN}/api`;
export const hubUrl = (path) => `${API_ORIGIN}${path}`;

