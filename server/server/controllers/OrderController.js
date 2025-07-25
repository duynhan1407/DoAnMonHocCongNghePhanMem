const OrderService = require('../services/OrderService');

// Tạo đơn hàng mới
exports.createOrder = OrderService.createOrder;
// Lấy chi tiết đơn hàng
exports.getOrderDetail = OrderService.getOrderDetail;
// Lấy tất cả đơn hàng
exports.getAllOrders = OrderService.getAllOrders;
// Cập nhật đơn hàng
exports.updateOrder = OrderService.updateOrder;
// Xóa đơn hàng
exports.deleteOrder = OrderService.deleteOrder;
// Thanh toán đơn hàng
exports.payOrder = OrderService.payOrder;
// Lấy thống kê đơn hàng
exports.getOrderStats = OrderService.getOrderStats;
// Nhập kho sản phẩm
exports.restockProduct = OrderService.restockProduct;
// Lấy thông tin kho hàng
exports.getStockInfo = OrderService.getStockInfo;
// Xuất sản phẩm
exports.exportProduct = OrderService.exportProduct;
