const Category = require('../models/Category');

const CategoryController = {
  async getAll(req, res) {
    try {
      const categories = await Category.find().sort({ name: 1 });
      res.json({ data: categories });
    } catch (err) {
      res.status(500).json({ message: 'Lỗi lấy danh mục', error: err });
    }
  },
  async create(req, res) {
    try {
      const { name } = req.body;
      if (!name) return res.status(400).json({ message: 'Tên danh mục là bắt buộc' });
      const exists = await Category.findOne({ name });
      if (exists) return res.status(400).json({ message: 'Danh mục đã tồn tại' });
      const category = new Category({ name });
      await category.save();
      res.json({ data: category });
    } catch (err) {
      res.status(500).json({ message: 'Lỗi tạo danh mục', error: err });
    }
  },
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const category = await Category.findByIdAndUpdate(id, { name }, { new: true });
      if (!category) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
      res.json({ data: category });
    } catch (err) {
      res.status(500).json({ message: 'Lỗi cập nhật danh mục', error: err });
    }
  },
  async delete(req, res) {
    try {
      const { id } = req.params;
      const category = await Category.findByIdAndDelete(id);
      if (!category) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
      res.json({ data: category });
    } catch (err) {
      res.status(500).json({ message: 'Lỗi xóa danh mục', error: err });
    }
  }
};

module.exports = CategoryController;
