const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: String, required: false },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  color: { type: String, required: false }, // màu sản phẩm
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', reviewSchema);
