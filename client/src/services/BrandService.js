import { baseGet, basePost, basePut, baseDelete } from './baseService';

export const getAllBrands = () => baseGet('/brand/getAll');
export const createBrand = (data) => basePost('/brand/create', data);
export const updateBrand = (id, data) => basePut(`/brand/update/${id}`, data);
export const deleteBrand = (id) => baseDelete(`/brand/delete/${id}`);
