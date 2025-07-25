const mongoose = require('mongoose');
const { Schema } = mongoose;

const BrandSchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
    quantity: { type: Number, default: 0 }, // tổng số lượng sản phẩm của brand
  }, { timestamps: true });

module.exports = mongoose.model('Brand', BrandSchema);
