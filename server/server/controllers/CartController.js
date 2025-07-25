const Cart = require('../models/Cart');

// Lấy giỏ hàng của user
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ user: userId });
    res.json(cart || { user: userId, items: [] });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy giỏ hàng', error: err.message });
  }
};

// Cập nhật/thêm giỏ hàng
exports.updateCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items } = req.body;
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items });
    } else {
      cart.items = items;
    }
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi cập nhật giỏ hàng', error: err.message });
  }
};

// Xóa giỏ hàng
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    await Cart.findOneAndDelete({ user: userId });
    res.json({ message: 'Đã xóa giỏ hàng' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi xóa giỏ hàng', error: err.message });
  }
};
