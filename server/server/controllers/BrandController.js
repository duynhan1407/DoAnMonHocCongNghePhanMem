const Brand = require('../models/Brand');

// Tạo thương hiệu mới
exports.createBrand = async (req, res) => {
  try {
    const brand = new Brand(req.body);
    await brand.save();
    res.status(201).json({ status: 'OK', message: 'Tạo thương hiệu thành công', data: brand });
  } catch (error) {
    res.status(500).json({ status: 'ERR', message: error.message });
  }
};

// Lấy tất cả thương hiệu
exports.getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.find();
    res.status(200).json({ status: 'OK', data: brands });
  } catch (error) {
    res.status(500).json({ status: 'ERR', message: error.message });
  }
};

// Xóa thương hiệu
exports.deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);
    if (!brand) return res.status(404).json({ status: 'ERR', message: 'Không tìm thấy thương hiệu' });
    res.status(200).json({ status: 'OK', message: 'Đã xóa thương hiệu' });
  } catch (error) {
    res.status(500).json({ status: 'ERR', message: error.message });
  }
};

// Cập nhật thương hiệu
exports.updateBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!brand) return res.status(404).json({ status: 'ERR', message: 'Không tìm thấy thương hiệu' });
    res.status(200).json({ status: 'OK', message: 'Cập nhật thành công', data: brand });
  } catch (error) {
    res.status(500).json({ status: 'ERR', message: error.message });
  }
};
