// Central API config — uses env var in production (Vercel), falls back to proxy in dev
const API_BASE = process.env.REACT_APP_API_URL || '';

export default API_BASE;
