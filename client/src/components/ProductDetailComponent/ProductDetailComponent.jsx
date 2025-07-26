import React from 'react';
const ProductDetailComponent = ({ product }) => {
  if (!product) return <div>Không tìm thấy sản phẩm</div>;
  const images = product.images && product.images.length > 0 ? product.images : [product.image];

  return (
    <div style={{ background: '#fff', minHeight: '100vh', padding: '0 0 40px 0' }}>
      <div style={{
        maxWidth: 1200,
        margin: '32px auto 0 auto',
        display: 'flex',
        flexDirection: 'row',
        gap: 48,
        alignItems: 'flex-start',
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 2px 12px #eee',
        padding: '32px 32px 32px 32px',
      }}>
        {/* Left: Main Image + Gallery */}
        <div style={{ flex: '0 0 400px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img
            src={images[0] || '/assets/images/no-image.png'}
            alt={product.name}
            style={{ width: 340, height: 340, objectFit: 'contain', borderRadius: 14, border: '1px solid #eee', marginBottom: 18, background: '#fff' }}
            onError={e => { e.target.onerror = null; e.target.src = '/assets/images/no-image.png'; }}
          />
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            {images.slice(1, 5).map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Sản phẩm ${product.name} - ${idx+2}`}
                style={{ width: 64, height: 64, objectFit: 'contain', borderRadius: 8, border: '1px solid #eee', background: '#fff', cursor: 'pointer' }}
                onError={e => { e.target.onerror = null; e.target.src = '/assets/images/no-image.png'; }}
              />
            ))}
          </div>
        </div>
        {/* Right: Info Block */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', minWidth: 320 }}>
          {/* Brand + Name + Code */}
          <div style={{ color: '#222', fontWeight: 700, fontSize: 28, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>{product.brand}</div>
          <div style={{ color: '#222', fontWeight: 700, fontSize: 32, marginBottom: 8 }}>{product.name}</div>
          {product.code && <div style={{ color: '#222', fontWeight: 500, fontSize: 20, marginBottom: 8 }}>{product.code}</div>}
          {/* Status + New label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{ background: '#222', color: '#fff', fontWeight: 700, fontSize: 14, borderRadius: 4, padding: '2px 10px', letterSpacing: 1 }}>MỚI</span>
            {product.status === 'OutOfStock' && <span style={{ background: '#fff0f0', color: '#ff4d4f', fontWeight: 600, borderRadius: 4, padding: '2px 10px', fontSize: 14 }}>Hết hàng</span>}
            {product.status === 'Available' && <span style={{ background: '#f6ffed', color: '#52c41a', fontWeight: 600, borderRadius: 4, padding: '2px 10px', fontSize: 14 }}>Còn hàng</span>}
          </div>
          {/* Price */}
          <div style={{ fontSize: 32, fontWeight: 700, color: '#2b46bd', margin: '8px 0 18px 0' }}>
            {product.price ? product.price.toLocaleString('vi-VN') + ' ₫' : 'Liên hệ để biết giá'}
          </div>
          {/* Description */}
          <div style={{ fontSize: 18, color: '#444', marginBottom: 18, lineHeight: 1.6 }}>{product.description || 'Không có mô tả'}</div>
          {/* Category */}
          <div style={{ fontSize: 16, color: '#888', marginBottom: 8 }}>Danh mục: <span style={{ color: '#222', fontWeight: 500 }}>{product.category}</span></div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailComponent;