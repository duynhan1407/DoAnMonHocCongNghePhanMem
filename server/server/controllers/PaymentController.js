// IPN: Nhận thông báo kết quả giao dịch từ VNPAY, cập nhật trạng thái vào DB
exports.vnpayIpn = (req, res) => {
    let vnp_Params = req.query;
    const secureHash = vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    // Chỉ lấy các trường vnp_, trừ vnp_SecureHash, vnp_SecureHashType
    const signParams = {};
    Object.keys(vnp_Params).forEach(function(key) {
      if (key.startsWith('vnp_') && key !== 'vnp_SecureHash' && key !== 'vnp_SecureHashType') {
        signParams[key] = vnp_Params[key];
      }
    });
    const sortedParams = sortObject(signParams);
    const signData = Object.keys(sortedParams).map(key => key + '=' + sortedParams[key]).join('&');
    const signed = crypto.createHmac('sha512', process.env.VNP_HASHSECRET).update(signData, 'utf-8').digest('hex');

    // Log chi tiết để debug IPN
    console.log('--- VNPay IPN Callback Debug ---');
    console.log('signData:', signData);
    console.log('signed:', signed);
    console.log('secureHash:', secureHash);
    console.log('vnp_Params:', JSON.stringify(vnp_Params, null, 2));
    console.log('-----------------------------------');

    if (secureHash === signed) {
        // Cập nhật trạng thái booking vào DB
        const Booking = require('../models/Booking');
        const orderId = vnp_Params['vnp_TxnRef'];
        Booking.findOneAndUpdate(
          { orderId: orderId },
          { isPaid: true, paidAt: new Date(), status: 'confirmed', paymentMethod: 'vnpay' },
          { new: true },
          (err, booking) => {
            if (err || !booking) {
              console.error('IPN: Cập nhật trạng thái đơn hàng thất bại:', err);
              return res.status(500).json({ RspCode: '99', Message: 'Cập nhật trạng thái đơn hàng thất bại!' });
            }
            console.log('IPN: Booking updated:', booking);
            res.status(200).json({ RspCode: '00', Message: 'Success' });
          }
        );
    } else {
        console.error('IPN: Chữ ký không hợp lệ!');
        res.status(400).json({ RspCode: '97', Message: 'Invalid signature' });
    }
};
// API tạo mã QR thanh toán VNPay
exports.createVNPayQRCode = async (req, res) => {
    try {
        let ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        if (ipAddr === '::1' || ipAddr === '::ffff:127.0.0.1') ipAddr = '127.0.0.1';
        const tmnCode = process.env.VNP_TMNCODE;
        const secretKey = process.env.VNP_HASHSECRET;
        const vnpUrl = process.env.VNP_URL;
        const returnUrl = process.env.VNP_RETURNURL;
        const date = new Date();
        const createDate = date.toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
        const orderId = date.getTime();
        let amount = Number(req.body.amount);
        if (isNaN(amount) || amount < 1000) amount = 1000;
        amount = amount * 100;
        let vnp_Params = {
            'vnp_Version': '2.1.0',
            'vnp_Command': 'pay',
            'vnp_TmnCode': tmnCode,
            'vnp_Locale': 'vn',
            'vnp_CurrCode': 'VND',
            'vnp_TxnRef': orderId,
            'vnp_OrderInfo': 'Thanh toan dat phong',
            'vnp_OrderType': 'billpayment',
            'vnp_Amount': amount,
            'vnp_ReturnUrl': returnUrl,
            'vnp_IpAddr': ipAddr,
            'vnp_CreateDate': createDate
        };
        // Tạo signData đúng chuẩn VNPay
        const signParams = {};
        Object.keys(vnp_Params).forEach(function(key) {
          if (key.startsWith('vnp_') && key !== 'vnp_SecureHash' && key !== 'vnp_SecureHashType') {
            signParams[key] = vnp_Params[key];
          }
        });
        const sortedParams = sortObject(signParams);
        const signData = Object.keys(sortedParams).map(key => key + '=' + sortedParams[key]).join('&');
        const signed = require('crypto').createHmac("sha512", secretKey).update(signData, 'utf-8').digest("hex");
        vnp_Params['vnp_SecureHash'] = signed;
        // Tạo URL với qs, nhưng signData KHÔNG dùng qs cho ký
        const paymentUrl = vnpUrl + '?' + require('qs').stringify(sortObject(vnp_Params), { encode: true });
        res.json({ paymentUrl });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi tạo mã QR VNPay', error: error.message });
    }
}
const crypto = require('crypto');
const querystring = require('qs');

// Chuẩn hóa hàm sortObject đúng chuẩn VNPay
function sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    for (let key of keys) {
        sorted[key] = obj[key];
    }
    return sorted;
}

exports.createVNPayUrl = (req, res) => {
    let ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (ipAddr === '::1' || ipAddr === '::ffff:127.0.0.1') ipAddr = '127.0.0.1';
    const tmnCode = process.env.VNP_TMNCODE;
    const secretKey = process.env.VNP_HASHSECRET;
    const vnpUrl = process.env.VNP_URL;
    const returnUrl = process.env.VNP_RETURNURL;

    const date = new Date();
    const createDate = date.toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
    // Tạo orderId là chuỗi số duy nhất, tối đa 20 ký tự
    const orderId = Date.now().toString().slice(0, 20);
    let amount = Number(req.body.amount);
    if (isNaN(amount) || amount < 1000) amount = 1000;
    amount = amount * 100;

    let vnp_Params = {
        'vnp_Version': '2.1.0',
        'vnp_Command': 'pay',
        'vnp_TmnCode': tmnCode,
        'vnp_Locale': 'vn',
        'vnp_CurrCode': 'VND',
        'vnp_TxnRef': orderId,
        'vnp_OrderInfo': req.body.orderInfo || 'Thanh toan dat phong',
        'vnp_OrderType': req.body.orderType || 'billpayment',
        'vnp_Amount': amount,
        'vnp_ReturnUrl': returnUrl,
        'vnp_IpAddr': ipAddr,
        'vnp_CreateDate': createDate
    };

    // Chỉ lấy các trường vnp_, trừ vnp_SecureHash, vnp_SecureHashType
    const signParams = {};
    Object.keys(vnp_Params).forEach(function(key) {
      if (key.startsWith('vnp_') && key !== 'vnp_SecureHash' && key !== 'vnp_SecureHashType') {
        signParams[key] = vnp_Params[key];
      }
    });
    const sortedParams = sortObject(signParams);
    // Ghép chuỗi key=value&key2=value2... không encode giá trị
    const signData = Object.keys(sortedParams).map(key => key + '=' + sortedParams[key]).join('&');
    const signed = crypto.createHmac('sha512', secretKey).update(signData, 'utf-8').digest('hex');
    vnp_Params['vnp_SecureHash'] = signed;

    // Log debug
    console.log('vnp_Params:', vnp_Params);
    console.log('signData:', signData);
    console.log('signed:', signed);

    // Tạo URL thanh toán đúng chuẩn encode
    const paymentUrl = vnpUrl + '?' + querystring.stringify(sortObject(vnp_Params), { encode: true });
    console.log('paymentUrl:', paymentUrl);
    res.json({ paymentUrl, orderId });
};

exports.vnpayReturn = (req, res) => {
    let vnp_Params = req.query;
    const secureHash = vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    // Chỉ lấy các trường vnp_, trừ vnp_SecureHash, vnp_SecureHashType
    const signParams = {};
    Object.keys(vnp_Params).forEach(function(key) {
      if (key.startsWith('vnp_') && key !== 'vnp_SecureHash' && key !== 'vnp_SecureHashType') {
        signParams[key] = vnp_Params[key];
      }
    });
    const sortedParams = sortObject(signParams);
    const signData = Object.keys(sortedParams).map(key => key + '=' + sortedParams[key]).join('&');
    const signed = crypto.createHmac('sha512', process.env.VNP_HASHSECRET).update(signData, 'utf-8').digest('hex');

    // Log chi tiết để debug ReturnUrl
    console.log('--- VNPay Return Callback Debug ---');
    console.log('signData:', signData);
    console.log('signed:', signed);
    console.log('secureHash:', secureHash);
    console.log('vnp_Params:', JSON.stringify(vnp_Params, null, 2));
    console.log('-----------------------------------');

    if (secureHash === signed) {
        // Thành công, cập nhật trạng thái booking
        const Booking = require('../models/Booking');
        const orderId = vnp_Params['vnp_TxnRef'];
        Booking.findOneAndUpdate(
          { orderId: orderId },
          { isPaid: true, paidAt: new Date(), status: 'confirmed', paymentMethod: 'vnpay' },
          { new: true },
          (err, booking) => {
            if (err || !booking) {
              console.error('Cập nhật trạng thái đơn hàng thất bại:', err);
              return res.status(500).json({ code: '99', message: 'Cập nhật trạng thái đơn hàng thất bại!' });
            }
            console.log('Booking updated:', booking);
            // Trả về giao diện thông báo đúng chuẩn tài liệu VNPay
            res.json({
              code: '00',
              message: 'Thanh toán thành công!',
              booking,
              status: 'success',
              notify: 'Cảm ơn bạn đã thanh toán. Đơn phòng đã được xác nhận!'
            });
          }
        );
    } else {
        console.error('Chữ ký không hợp lệ!');
        res.status(400).json({ code: '97', message: 'Chữ ký không hợp lệ!', status: 'fail', notify: 'Thanh toán thất bại. Vui lòng thử lại hoặc liên hệ hỗ trợ.' });
    }
};
