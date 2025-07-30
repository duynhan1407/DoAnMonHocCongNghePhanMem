const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const dotenv = require('dotenv').config();
const passport = require('./auth/passport');
const DbConnect = require('./config/dataconn');
const routes = require('./routes');
const paymentRoutes = require('./routes/PaymentRoutes');
const cartRoutes = require('./routes/CartRoutes');
const authRoutes = require('./routes/authRoutes');
const orderApi = require('./routes/orderApi');
// Ẩn cảnh báo util._extend bị deprecate
process.on('warning', e => {
  if (!String(e.message).includes('util._extend')) {
    console.warn(e);
  }
});
// ...existing code...
const reviewRoutes = require('./routes/reviewRoutes');
require('./services/reminderCron');

const app = express();
const port = process.env.PORT || 3001;

const categoryRoutes = require('./routes/CategoryRoutes');

// Kết nối database
DbConnect();
// Middleware: Đảm bảo express.json() đứng trước tất cả các route
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json({ limit: '10mb' })); // Tăng giới hạn lên 10mb
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false },
}));

// API cho danh mục sản phẩm
app.use('/api/categories', categoryRoutes);
app.use(passport.initialize());
app.use(passport.session());

// Routes chính
routes(app);

// Route đơn hàng
app.use('/api/orders', orderApi);
// Route thanh toán
app.use('/api/payment', paymentRoutes);

// Route giỏ hàng
app.use('/api/cart', cartRoutes);

// Route OAuth
app.use('/auth', authRoutes);

// Route đánh giá
app.use('/api/review', reviewRoutes);

// Khởi động server
app.listen(port, () => console.log(`Server is running on port ${port}`));
