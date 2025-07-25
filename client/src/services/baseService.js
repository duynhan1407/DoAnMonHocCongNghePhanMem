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
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const baseGet = (url, params) => axiosInstance.get(url, { params }).then(res => res.data);
export const basePost = (url, data, token) => {
  let config = {};
  if (token) {
    config.headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };
  }
  return axiosInstance.post(url, data, config).then(res => res.data);
};
export const basePut = (url, data) => axiosInstance.put(url, data).then(res => res.data);
export const baseDelete = (url) => axiosInstance.delete(url).then(res => res.data);
