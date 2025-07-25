import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Modal, Typography } from 'antd';

const { Title } = Typography;

// Hàm sinh payload QR banking chuẩn VietQR (NAPAS)
function generateVietQRPayload({ bankId, account, amount, info }) {
  // Chuẩn EMVCo cho VietQR (NAPAS)
  // Tham khảo: https://github.com/napas-vn/napas-qr-standards
  // Đây là bản rút gọn, chỉ dùng cho chuyển khoản cá nhân
  if (!bankId || !account) return '';
  // Mã ngân hàng 7 ký tự, thêm 0 nếu thiếu
  const bankCode = bankId.padEnd(7, '0');
  // Tạo payload
  let payload =
    '000201' +
    '010212' +
    '38' + (16 + account.length).toString().padStart(2, '0') +
    '0010A000000727' +
    '0113' + bankCode +
    '02' + account.length.toString().padStart(2, '0') + account;
  if (amount) {
    payload += '5303704' + '54' + amount.toString().length.toString().padStart(2, '0') + amount;
  }
  if (info) {
    payload += '58' + info.length.toString().padStart(2, '0') + info;
  }
  payload += '6304'; // CRC placeholder
  // Tính CRC-CCITT (XModem)
  function crc16ccitt(str) {
    let crc = 0xFFFF;
    for (let c of str) {
      crc ^= c.charCodeAt(0) << 8;
      for (let i = 0; i < 8; i++) {
        if ((crc & 0x8000) !== 0) crc = (crc << 1) ^ 0x1021;
        else crc <<= 1;
        crc &= 0xFFFF;
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
  }
  payload += crc16ccitt(payload);
  return payload;
}

// url: payload QR banking hoặc chuỗi thông tin chuyển khoản
const QRCodePayment = ({ visible, onClose, url, amount, info, bankId, account, isVnpay }) => {
  // Nếu có bankId và account thì sinh payload QR banking
  let qrValue = url;
  let qrNote = 'Dùng app ngân hàng hoặc ví điện tử để quét mã QR và thanh toán.';
  if (isVnpay && url) {
    // QR cho link VNPAY (paymentUrl)
    qrValue = url;
    qrNote = (
      <>
        Quét mã bằng app VNPAY hoặc <a href={url} target="_blank" rel="noopener noreferrer">bấm vào đây để thanh toán trên web VNPAY</a>.<br/>
        Sau khi thanh toán, vui lòng xác nhận với quản lý để hoàn tất đơn hàng.
      </>
    );
  } else if (bankId && account) {
    qrValue = generateVietQRPayload({ bankId, account, amount, info });
    qrNote = 'Dùng app ngân hàng hoặc ví điện tử để quét mã QR và thanh toán.';
  }
  return (
    <Modal open={visible} onCancel={onClose} footer={null} title="Quét mã QR để thanh toán" centered>
      <div style={{ textAlign: 'center', padding: 24 }}>
        <QRCodeSVG value={qrValue} size={220} level="H" includeMargin={true} />
        <div style={{ marginTop: 24 }}>
          <Title level={4}>Số tiền: <span style={{ color: '#2b46bd' }}>{amount ? amount.toLocaleString('vi-VN') + ' ₫' : ''}</span></Title>
          {info && <div style={{ marginTop: 8, color: '#888' }}>{info}</div>}
        </div>
        <div style={{ marginTop: 16, color: '#888', fontSize: 15 }}>
          {qrNote}
        </div>
      </div>
    </Modal>
  );
};

export default QRCodePayment;
