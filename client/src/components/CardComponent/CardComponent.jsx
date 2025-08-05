
import React from 'react';
import { Card, Tag } from 'antd';

const CardComponent = ({
  name,
  brand,
  price,
  discount,
  image,
  colors,
  status,
  children
}) => {
  const fullImageUrl = image && (image.startsWith('http://') || image.startsWith('https://'))
    ? image
    : image ? `${process.env.REACT_APP_API_URL}${image}` : '/default-product.jpg';

  return (
    <Card
      hoverable
      style={{
        width: 260,
        border: '1px solid #e0e7ff',
        borderRadius: 16,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '0 2px 12px #e0e7ff',
        margin: '0 auto',
        background: '#f8fafc',
      }}
      bodyStyle={{ padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      cover={
        <img
          alt={name}
          src={fullImageUrl}
          onError={e => { e.target.onerror = null; e.target.src = '/default-product.jpg'; }}
          style={{ height: 170, objectFit: 'cover', borderBottom: '1px solid #e0e7ff', borderRadius: '16px 16px 0 0' }}
        />
      }
    >
      <div style={{ fontWeight: 700, fontSize: 18, textAlign: 'center', margin: '8px 0 4px 0', color: '#2563eb' }}>
        {name} {brand && `(${brand})`}
      </div>
      <div style={{ margin: '8px 0' }}>
        <span style={{ fontSize: 18, color: '#00bfae', fontWeight: 700 }}>
          {price === undefined || price === null || price === ''
            ? 'N/A'
            : (typeof price === 'number'
                ? `${price.toLocaleString('vi-VN')} ₫`
                : price)}
        </span>
        {discount && <span style={{ marginLeft: 8, color: '#ff9800' }}>-{discount}%</span>}
      </div>
      {Array.isArray(colors) && colors.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          {colors.map((color, idx) => <Tag color="blue" key={idx}>{color}</Tag>)}
        </div>
      )}
      {status && <Tag color={status === 'Available' ? 'green' : 'red'}>{status === 'Available' ? 'Còn hàng' : 'Hết hàng'}</Tag>}
      {children && <div style={{ width: '100%', marginTop: 8 }}>{children}</div>}
    </Card>
  );
};

export default CardComponent;
