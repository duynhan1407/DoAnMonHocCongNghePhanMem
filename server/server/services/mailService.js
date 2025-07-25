const nodemailer = require('nodemailer');

// Hàm gửi email xác nhận booking
async function sendBookingConfirmationEmail(to, bookingInfo) {
  // Tạo transporter với tài khoản Gmail hoặc SMTP provider khác
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Thêm vào .env
      pass: process.env.EMAIL_PASS, // Thêm vào .env
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Xác nhận đặt phòng khách sạn',
    html: `<h3>Xin chào ${bookingInfo.name},</h3>
      <p>Bạn đã đặt phòng thành công!</p>
      <ul>
        <li>Phòng: ${bookingInfo.roomNumber}</li>
        <li>Ngày nhận phòng: ${bookingInfo.checkInDate}</li>
        <li>Ngày trả phòng: ${bookingInfo.checkOutDate}</li>
        <li>Giá: ${bookingInfo.price} đ</li>
      </ul>
      <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>`
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendBookingConfirmationEmail };
