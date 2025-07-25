const express = require('express');
const  router = express.Router();
const PaymentController = require('../controllers/PaymentController');

router.post('/create-vnpay-url', PaymentController.createVNPayUrl);
router.post('/create-vnpay-qr', PaymentController.createVNPayQRCode);
router.get('/vnpay_return', PaymentController.vnpayReturn);
router.get('/vnpay_ipn', PaymentController.vnpayIpn);

module.exports = router;
