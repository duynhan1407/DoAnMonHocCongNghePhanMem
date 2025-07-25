const cron = require('node-cron');
const Order = require('../models/Order');
const User = require('../models/User');
const { sendOrderReminderEmail } = require('./mailService');

// Cronjob gửi email nhắc nhở đơn hàng sắp giao (ví dụ: đơn hàng dự kiến giao ngày mai)
cron.schedule('0 8 * * *', async () => {
  // Chạy lúc 8h sáng mỗi ngày
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const nextDay = new Date(tomorrow);
  nextDay.setDate(nextDay.getDate() + 1);

  // Lấy các đơn hàng dự kiến giao ngày mai (giả sử có trường deliveryDate)
  const orders = await Order.find({
    deliveryDate: {
      $gte: tomorrow,
      $lt: nextDay
    },
    status: { $in: ['Shipping', 'Pending'] }
  }).populate('user').populate('orderItems.productId');

  for (const order of orders) {
    const user = order.user;
    if (user?.email) {
      await sendOrderReminderEmail(user.email, {
        name: user.name,
        orderId: order._id,
        deliveryDate: order.deliveryDate ? order.deliveryDate.toLocaleDateString() : '',
        total: order.totalPrice?.toLocaleString('vi-VN') || '',
        items: order.orderItems.map(item => `${item.productId?.name || ''} x${item.quantity || 1}`).join(', ')
      });
    }
  }
  console.log(`[CRON] Đã gửi email nhắc nhở giao hàng cho ${orders.length} đơn hàng.`);
});
