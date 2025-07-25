const Product = require('../models/Product');

// Tạo sản phẩm mới
exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ status: 'OK', message: 'Tạo sản phẩm thành công', data: product });
  } catch (error) {
    res.status(500).json({ status: 'ERR', message: error.message });
  }
};

// Lấy danh sách sản phẩm
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({ status: 'OK', data: products });
  } catch (error) {
    res.status(500).json({ status: 'ERR', message: error.message });
  }
};

// Lấy chi tiết sản phẩm
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ status: 'ERR', message: 'Không tìm thấy sản phẩm' });
    res.status(200).json({ status: 'OK', data: product });
  } catch (error) {
    res.status(500).json({ status: 'ERR', message: error.message });
  }
};

// Cập nhật sản phẩm
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ status: 'ERR', message: 'Không tìm thấy sản phẩm' });
    res.status(200).json({ status: 'OK', message: 'Cập nhật thành công', data: product });
  } catch (error) {
    res.status(500).json({ status: 'ERR', message: error.message });
  }
};

// Xóa sản phẩm
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ status: 'ERR', message: 'Không tìm thấy sản phẩm' });
    res.status(200).json({ status: 'OK', message: 'Đã xóa sản phẩm' });
  } catch (error) {
    res.status(500).json({ status: 'ERR', message: error.message });
  }
};
