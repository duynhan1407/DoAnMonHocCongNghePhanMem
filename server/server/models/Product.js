const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProductSchema = new Schema({
  productCode: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Tên sản phẩm là bắt buộc']
  },
  category: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    required: [true, 'Thương hiệu là bắt buộc']
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String
  },
  rating: {
    type: Number,
    default: 0
  },
  images: [{
    type: String,
    required: [true, 'Hình ảnh sản phẩm là bắt buộc']
  }],
  discount: {
    type: Number,
    default: 0
  },
  quantity: {
    type: Number,
    required: [true, 'Số lượng là bắt buộc'],
    default: 0
  },
  features: [{
    type: String
  }],
  colors: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['Available', 'Out of Stock', 'Discontinued'],
    default: 'Available'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', ProductSchema);
