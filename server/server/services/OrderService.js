// Tăng số lượng sản phẩm (restock)
const restockProduct = async (req, res) => {
  try {
    const { productId, quantity, color } = req.body;
    if (!productId || typeof quantity !== 'number' || quantity <= 0) {
      return res.status(400).json({ status: 'ERR', message: 'productId và quantity > 0 là bắt buộc' });
    }
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ status: 'ERR', message: 'Product not found' });
    }
    // Nếu có màu, cập nhật số lượng cho màu đó
    if (color && Array.isArray(product.colors)) {
      const colorIdx = product.colors.findIndex(c => c.color === color);
      if (colorIdx !== -1) {
        if (typeof product.colors[colorIdx].quantity !== 'number') {
          product.colors[colorIdx].quantity = 0;
        }
        product.colors[colorIdx].quantity += quantity;
      }
    }
    product.quantity = (product.quantity || 0) + quantity;
    await product.save();
    return res.status(200).json({
      status: 'OK',
      message: 'Đã tăng số lượng sản phẩm thành công',
      data: product,
    });
  } catch (error) {
    return res.status(400).json({ status: 'ERR', message: error.message });
  }
};
// Xuất kho sản phẩm (giảm số lượng)
const exportProduct = async (req, res) => {
  try {
    const { productId, quantity, color } = req.body;
    if (!productId || typeof quantity !== 'number' || quantity <= 0) {
      return res.status(400).json({ status: 'ERR', message: 'productId và quantity > 0 là bắt buộc' });
    }
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ status: 'ERR', message: 'Product not found' });
    }
    if ((product.quantity || 0) < quantity) {
      return res.status(400).json({ status: 'ERR', message: 'Số lượng trong kho không đủ để xuất' });
    }
    // Nếu có màu, cập nhật số lượng cho màu đó
    if (color && Array.isArray(product.colors)) {
      const colorIdx = product.colors.findIndex(c => c.color === color);
      if (colorIdx !== -1) {
        if (typeof product.colors[colorIdx].quantity !== 'number') {
          product.colors[colorIdx].quantity = 0;
        }
        if (product.colors[colorIdx].quantity < quantity) {
          return res.status(400).json({ status: 'ERR', message: 'Số lượng màu không đủ để xuất' });
        }
        product.colors[colorIdx].quantity -= quantity;
      }
    }
    product.quantity = (product.quantity || 0) - quantity;
    await product.save();
    // Cập nhật lại tổng số lượng sản phẩm của thương hiệu
    let brandDoc = null;
    if (product.brand) {
      brandDoc = await Brand.findOne({ name: product.brand });
      if (brandDoc) {
        const totalQty = await Product.aggregate([
          { $match: { brand: product.brand } },
          { $group: { _id: null, total: { $sum: "$quantity" } } }
        ]);
        brandDoc.quantity = totalQty[0]?.total || 0;
        await brandDoc.save();
      }
    }
        return res.status(200).json({
            status: 'OK',
            message: 'Đã xuất kho sản phẩm thành công',
            data: {
                product,
                brand: brandDoc
            },
        });
  } catch (error) {
    return res.status(400).json({ status: 'ERR', message: error.message });
  }
};
// Lấy thống kê đơn hàng
const getOrderStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const match = {};
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    // Tổng doanh thu
    const totalRevenueAgg = await Order.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    // Tổng số đơn hàng
    const totalOrders = await Order.countDocuments(match);

    // Tổng số sản phẩm đã bán
    const soldProductsAgg = await Order.aggregate([
      { $match: match },
      { $unwind: "$orderItems" },
      { $group: { _id: null, total: { $sum: "$orderItems.quantity" } } }
    ]);
    const soldProducts = soldProductsAgg[0]?.total || 0;

    // Thống kê theo ngày
    const dailyStats = await Order.aggregate([
      { $match: match },
      { $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        orderCount: { $sum: 1 },
        revenue: { $sum: "$totalPrice" },
        soldProducts: { $sum: { $sum: "$orderItems.quantity" } }
      } },
      { $sort: { _id: 1 } }
    ]);
    const dailyStatsFormatted = dailyStats.map(stat => ({
      date: stat._id,
      orderCount: stat.orderCount,
      revenue: stat.revenue,
      soldProducts: stat.soldProducts
    }));

    return res.status(200).json({
      totalRevenue,
      totalOrders,
      soldProducts,
      dailyStats: dailyStatsFormatted
    });
  } catch (error) {
    return res.status(500).json({ status: 'ERR', message: error.message });
  }
};
const Order = require('../models/Order');
const Product = require('../models/Product');
const Brand = require('../models/Brand');

// Tính tổng giá trị đơn hàng
const calculateOrderTotal = async (orderItems) => {
  if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
    throw new Error('orderItems must be a non-empty array');
  }
  let total = 0;
  for (const item of orderItems) {
    const product = await Product.findById(item.productId);
    if (!product) throw new Error(`Product ID ${item.productId} not found`);
    let price = product.price;
    let discount = product.discount || 0;
    // Nếu có màu, lấy giá và discount từ màu đó
    if (item.color && Array.isArray(product.colors)) {
      const colorObj = product.colors.find(c => c.color === item.color);
      if (colorObj) {
        price = typeof colorObj.price === 'number' ? colorObj.price : price;
        discount = typeof colorObj.discount === 'number' ? colorObj.discount : discount;
      }
    }
    // Đảm bảo price là số hợp lệ
    if (typeof price !== 'number' || isNaN(price)) price = 0;
    if (typeof discount !== 'number' || isNaN(discount)) discount = 0;
    const finalPrice = price * (1 - discount / 100);
    total += finalPrice * (item.quantity || 1);
  }
  return total;
};

// Tạo đơn hàng mới
const createOrder = async (req, res) => {
  try {
    const { orderItems, user, phone, shippingAddress, email, notes, status, name } = req.body;
    if (!phone || !shippingAddress) {
      return res.status(400).json({ status: 'ERR', message: 'phone and shippingAddress are required' });
    }
        const totalPrice = await calculateOrderTotal(orderItems);
        const order = new Order({
            orderItems,
            user,
            phone,
            shippingAddress,
            email,
            notes,
            totalPrice,
            status: (status || 'pending').toLowerCase(),
            isPaid: false,
            name
        });
        const savedOrder = await order.save();

        // Trừ số lượng sản phẩm trong kho ngay khi tạo đơn hàng
        if (Array.isArray(orderItems)) {
          for (const item of orderItems) {
            const product = await Product.findById(item.productId);
            if (product) {
              if (item.color && Array.isArray(product.colors)) {
                const colorIdx = product.colors.findIndex(c => c.color === item.color);
                if (colorIdx !== -1) {
                  if (typeof product.colors[colorIdx].quantity !== 'number') {
                    product.colors[colorIdx].quantity = 0;
                  }
                  product.colors[colorIdx].quantity = Math.max(0, (product.colors[colorIdx].quantity || 0) - (item.quantity || 1));
                  await product.save();
                  continue;
                }
              }
              // Nếu không có màu, trừ số lượng tổng
              product.quantity = Math.max(0, (product.quantity || 0) - (item.quantity || 1));
              await product.save();
            }
          }
        }

    return res.status(201).json({
      status: 'OK',
      message: 'Order created successfully',
      data: savedOrder,
    });
  } catch (error) {
    return res.status(400).json({ status: 'ERR', message: error.message });
  }
};

// Lấy chi tiết đơn hàng
const getOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id)
      .populate('orderItems.productId', 'name price discount images')
      .populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ status: 'ERR', message: 'Order not found' });
    }
    return res.status(200).json({
      status: 'OK',
      message: 'Order details retrieved successfully',
      data: order,
    });
  } catch (error) {
    return res.status(500).json({ status: 'ERR', message: error.message });
  }
};

// Lấy tất cả đơn hàng
const getAllOrders = async (req, res) => {
  try {
    const { limit = 10, page = 0, sort, filter } = req.query;
    const query = {};
    if (filter) {
      const [field, value] = filter.split(':');
      query[field] = { $regex: value, $options: 'i' };
    }
    const sortQuery = sort
      ? { [sort.split(':')[1]]: sort.split(':')[0] === 'asc' ? 1 : -1 }
      : {};
    const totalOrders = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .skip(page * limit)
      .limit(Number(limit))
      .sort(sortQuery)
      .populate('user', 'name email')
      .populate('orderItems.productId', 'name price discount images');
    return res.status(200).json({
      status: 'OK',
      message: 'Orders retrieved successfully',
      data: orders,
      total: totalOrders,
      pageCurrent: parseInt(page) + 1,
      totalPage: Math.ceil(totalOrders / limit),
    });
  } catch (error) {
    return res.status(500).json({ status: 'ERR', message: error.message });
  }
};

// Cập nhật đơn hàng
const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderItems, status } = req.body;
    const totalPrice = orderItems ? await calculateOrderTotal(orderItems) : undefined;
    let updateData = { ...req.body };
    if (totalPrice) updateData.totalPrice = totalPrice;
    // Nếu trạng thái chuyển sang 'delivered', cập nhật isPaid và paidAt
    if (updateData.status && updateData.status.toLowerCase() === 'delivered') {
      updateData.isPaid = true;
      updateData.paidAt = new Date();
    }
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
      .populate('user', 'name email')
      .populate('orderItems.productId', 'name price discount images');
    if (!updatedOrder) {
      return res.status(404).json({ status: 'ERR', message: 'Order not found' });
    }
    return res.status(200).json({
      status: 'OK',
      message: 'Order updated successfully',
      data: updatedOrder,
    });
  } catch (error) {
    return res.status(400).json({ status: 'ERR', message: error.message });
  }
};

// Xóa đơn hàng
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedOrder = await Order.findByIdAndDelete(id);
    if (!deletedOrder) {
      return res.status(404).json({ status: 'ERR', message: 'Order not found' });
    }
    return res.status(200).json({
      status: 'OK',
      message: 'Order deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({ status: 'ERR', message: error.message });
  }
};

// Thanh toán đơn hàng
const payOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod } = req.body;
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ status: 'ERR', message: 'Order not found' });
    }
    if (order.isPaid) {
      return res.status(400).json({ status: 'ERR', message: 'Order is already paid' });
    }
    // Trừ số lượng sản phẩm trong kho khi thanh toán thành công
    if (Array.isArray(order.orderItems)) {
      for (const item of order.orderItems) {
        const product = await Product.findById(item.productId);
        if (product) {
          product.quantity = Math.max(0, (product.quantity || 0) - (item.quantity || 1));
          await product.save();
        }
      }
    }
    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentMethod = paymentMethod;
    const updatedOrder = await order.save();
    return res.status(200).json({
      status: 'OK',
      message: 'Payment successful',
      data: updatedOrder,
    });
  } catch (error) {
    return res.status(400).json({ status: 'ERR', message: error.message });
  }
};

// Lấy thông tin kho hàng (số lượng sản phẩm và số lượng theo thương hiệu)
const getStockInfo = async (req, res) => {
  try {
    // Lấy tất cả sản phẩm
    const products = await Product.find({}, 'name quantity brand');
    // Lấy tất cả thương hiệu và tổng số lượng sản phẩm của từng thương hiệu
    const brands = await Brand.find({}, 'name quantity');
    return res.status(200).json({
      status: 'OK',
      message: 'Lấy thông tin kho thành công',
      products,
      brands
    });
  } catch (error) {
    return res.status(400).json({ status: 'ERR', message: error.message });
  }
};

module.exports = {
  createOrder,
  getOrderDetail,
  getAllOrders,
  updateOrder,
  deleteOrder,
  payOrder,
  getOrderStats,
  restockProduct,
  exportProduct,
  getStockInfo,
};
