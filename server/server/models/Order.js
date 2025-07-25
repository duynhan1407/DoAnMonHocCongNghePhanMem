const mongoose = require('mongoose');
const { Schema } = mongoose;

const OrderItemSchema = new Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  category: { type: String }, // Loại đồng hồ
  image: { type: String },
  quantity: { type: Number, required: true, default: 1 },
  price: { type: Number, required: true }
});

const OrderSchema = new Schema({
  orderItems: [OrderItemSchema],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shippingAddress: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  shippingFee: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true },
  isPaid: { type: Boolean, default: false },
  paidAt: { type: Date },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'delivered'],
    default: 'pending'
  },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
