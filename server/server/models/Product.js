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
    required: true
  },
  category: {
    type: String,
    required: true
  },
  brand: {
    type: String
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
    type: String
  }],
  discount: {
    type: Number,
    default: 0
  },
  quantity: {
    type: Number,
    default: 0
  },
  features: [{
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
