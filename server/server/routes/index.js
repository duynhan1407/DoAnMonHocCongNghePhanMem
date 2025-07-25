const UserRouter = require('./UserRoutes');
const ProductRouter = require('./ProductRoutes');
const OrderRouter = require('./OrderRoutes');
const uploadRoutes = require('./uploadRoute');
const PaymentRoutes = require('./PaymentRoutes');
const BrandRoutes = require('./BrandRoutes');

const routes = (app) => {
    app.use('/api/user', UserRouter);
    app.use('/api/product', ProductRouter);
    app.use('/api/order', OrderRouter);
    app.use('/api/upload', uploadRoutes);
    app.use('/api/payment', PaymentRoutes);
    app.use('/api/brand', BrandRoutes);
};

module.exports = routes;