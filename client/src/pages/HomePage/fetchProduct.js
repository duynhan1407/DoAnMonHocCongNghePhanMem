import * as ProductService from '../../services/ProductService';

export const fetchProducts = async () => {
  try {
    const res = await ProductService.getAllProducts();
    if (res?.data && Array.isArray(res.data)) {
      return res.data;
    } else {
      throw new Error('No product data or invalid response structure');
    }
  } catch (error) {
    throw error;
  }
};
