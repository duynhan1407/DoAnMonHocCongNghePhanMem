import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// baseGet accepts optional axios config (params, headers, etc.)
export const baseGet = (url, config = {}) => axiosInstance.get(url, config).then(res => res.data);

// basePost accepts data and optional config or token string for backward compatibility
export const basePost = (url, data, configOrToken = {}) => {
  let config = {};
  if (typeof configOrToken === 'string') {
    config.headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${configOrToken}` };
  } else {
    config = configOrToken || {};
  }
  return axiosInstance.post(url, data, config).then(res => res.data);
};

export const basePut = (url, data, config = {}) => axiosInstance.put(url, data, config).then(res => res.data);
export const baseDelete = (url, config = {}) => axiosInstance.delete(url, config).then(res => res.data);
