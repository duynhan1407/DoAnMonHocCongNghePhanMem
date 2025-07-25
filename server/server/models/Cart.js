const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      name: String,
      category: String,
      price: Number,
      image: String,
      productCode: String,
      discount: Number,
      quantity: { type: Number, default: 1 }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Cart', CartSchema);
