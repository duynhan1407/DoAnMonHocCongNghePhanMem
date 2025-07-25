const Product = require('../models/Product');

// Tạo sản phẩm mới
const createProduct = async (newProduct) => {
    try {
        const { productCode, name, category, brand, price, description, rating, status, discount, images, features } = newProduct;

        // Kiểm tra xem sản phẩm đã tồn tại chưa
        const existingProduct = await Product.findOne({ productCode });
        if (existingProduct) {
            return {
                status: 'ERR',
                message: 'A product with this code already exists',
            };
        }

        // Tạo sản phẩm mới
        const createdProduct = await Product.create({
            productCode,
            name,
            category,
            brand,
            price,
            description,
            rating: rating || 0,
            status: status || 'Available',
            discount: discount || 0,
            images: images || [],
            features: features || []
        });

        return {
            status: 'OK',
            message: 'Product created successfully',
            data: createdProduct,
        };
    } catch (error) {
        console.error('Error creating product:', error);
        return {
            status: 'ERR',
            message: 'Error creating product',
            error: error.message,
        };
    }
};

// Cập nhật thông tin sản phẩm
const updateProduct = async (id, data) => {
    try {
        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
            return {
                status: 'ERR',
                message: 'Product not found',
            };
        }
        const updatedProduct = await Product.findByIdAndUpdate(id, data, { new: true });
        return {
            status: 'OK',
            message: 'Product updated successfully',
            data: updatedProduct,
        };
    } catch (error) {
        console.error('Error updating product:', error);
        return {
            status: 'ERR',
            message: 'Error updating product',
            error: error.message,
        };
    }
};

// Lấy chi tiết sản phẩm theo ID
const getProductById = async (id) => {
    try {
        const product = await Product.findById(id);
        if (!product) {
            return {
                status: 'ERR',
                message: 'Product not found',
            };
        }
        return {
            status: 'OK',
            message: 'Product details retrieved successfully',
            data: product,
        };
    } catch (error) {
        console.error('Error retrieving product details:', error);
        return {
            status: 'ERR',
            message: 'Error retrieving product details',
            error: error.message,
        };
    }
};

// Xóa sản phẩm theo ID
const deleteProduct = async (id) => {
    try {
        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
            return {
                status: 'ERR',
                message: 'Product not found',
            };
        }
        await Product.findByIdAndDelete(id);
        return {
            status: 'OK',
            message: 'Product deleted successfully',
        };
    } catch (error) {
        console.error('Error deleting product:', error);
        return {
            status: 'ERR',
            message: 'Error deleting product',
            error: error.message,
        };
    }
};

// Lấy danh sách tất cả sản phẩm (có hỗ trợ lọc, phân trang và sắp xếp)
const getAllProducts = async ({ limit = 10, page = 1, sortBy = 'createdAt', order = 'asc', filter = {} }) => {
    try {
        const query = {};
        if (filter) {
            Object.entries(filter).forEach(([key, value]) => {
                query[key] = { $regex: value, $options: 'i' };
            });
        }
        const totalProducts = await Product.countDocuments(query);
        const sort = {};
        sort[sortBy] = order === 'asc' ? 1 : -1;
        const products = await Product.find(query)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(Number(limit));
        return {
            status: 'OK',
            message: 'Products retrieved successfully',
            data: products,
            pagination: {
                total: totalProducts,
                currentPage: Number(page),
                totalPages: Math.ceil(totalProducts / limit),
            },
        };
    } catch (error) {
        console.error('Error retrieving products:', error);
        return {
            status: 'ERR',
            message: 'Error retrieving products',
            error: error.message,
        };
    }
};

module.exports = {
    createProduct,
    updateProduct,
    getProductById,
    deleteProduct,
    getAllProducts,
};
