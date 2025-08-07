import { baseGet, basePost, basePut, baseDelete } from './baseService';

export const getAllBrands = () => baseGet('/api/brand/getAll');
export const createBrand = (data) => basePost('/api/brand/create', data);
export const updateBrand = (id, data) => basePut(`/api/brand/update/${id}`, data);
export const deleteBrand = (id) => baseDelete(`/api/brand/delete/${id}`);
