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
  description: {
    type: String
  },


  

  features: [{
    type: String
  }],
  colors: [{
    color: { type: String },
    images: [String],
    price: Number,
    description: String,
    quantity: { type: Number },
    discount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['Available', 'Out of Stock', 'Discontinued'],
      default: 'Available'
    },
    rating: { type: Number, default: 0 }
  }],
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', ProductSchema);
