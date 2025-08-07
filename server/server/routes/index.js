const UserRouter = require('./UserRoutes');
const ProductRouter = require('./ProductRoutes');
const OrderRouter = require('./OrderRoutes');
const uploadRoutes = require('./uploadRoute');
const BrandRoutes = require('./BrandRoutes');
const paymentRoutes = require('./paymentRoutes');

const routes = (app) => {
    app.use('/api/user', UserRouter);
    app.use('/api/product', ProductRouter);
    app.use('/api/order', OrderRouter);
    // app.use('/api/upload', uploadRoutes); // Không còn dùng upload qua backend
    app.use('/api/payment', paymentRoutes);
    app.use('/api/brand', BrandRoutes);
};

module.exports = routes;