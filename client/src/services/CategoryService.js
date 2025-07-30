import axios from 'axios';

const API_URL = '/api/categories';

export const getAllCategories = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const createCategory = async (name) => {
  const res = await axios.post(API_URL, { name });
  return res.data;
};

export const updateCategory = async (id, name) => {
  const res = await axios.put(`${API_URL}/${id}`, { name });
  return res.data;
};

export const deleteCategory = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};
