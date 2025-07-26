import React from 'react';
import { InputNumber } from 'antd';

const CartComponent = ({ cart, onCheckout, onRemove, loading, onChangeQuantity }) => {
  // Tính tổng tiền dựa trên số lượng và giá từng sản phẩm
  const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  return (
    <div
      style={{
        background: '#fff',
        padding: 20,
        borderRadius: 12,
        boxShadow: '0 4px 16px #e0e0e0',
        minWidth: 300,
        maxWidth: 400,
        margin: '0 auto',
        transition: 'box-shadow 0.2s',
      }}
    >
      {cart.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#888' }}>Chưa có sản phẩm nào trong giỏ hàng.</p>
      ) : (
        <ul style={{ padding: 0, listStyle: 'none', margin: 0 }}>
          {cart.map((item, idx) => (
            <li
              key={item._id || item.id || idx}
              style={{
                marginBottom: 12,
                display: 'flex',
                flexDirection: 'column',
                background: '#f8f8f8',
                borderRadius: 8,
                padding: '8px 12px',
                boxShadow: '0 1px 4px #f0f0f0',
                transition: 'background 0.2s',
              }}
              tabIndex={0}
              aria-label={`Sản phẩm ${item.name}, giá ${Number(item.price).toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}đ`}
              onMouseOver={e => (e.currentTarget.style.background = '#e6fcfa')}
              onMouseOut={e => (e.currentTarget.style.background = '#f8f8f8')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 16 }}>
                  <b>{item.name}</b> {item.brand && `- ${item.brand}`} - {
                    Number(item.price).toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + 'đ'
                  }
                  <span style={{ marginLeft: 12, marginRight: 8 }}>
                    <InputNumber
                      min={1}
                      max={item.maxQuantity || 99}
                      value={item.quantity || 1}
                      onChange={val => onChangeQuantity && onChangeQuantity(item._id || item.id, val)}
                      size="small"
                      style={{ width: 60 }}
                    />
                  </span>
                </span>
                <button
                  style={{
                    background: '#ff4d4f',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 5,
                    padding: '4px 12px',
                    cursor: 'pointer',
                    marginLeft: 8,
                    fontWeight: 'bold',
                    fontSize: 16,
                    transition: 'background 0.2s',
                  }}
                  aria-label="Xóa sản phẩm khỏi giỏ hàng"
                  title="Xóa sản phẩm này"
                  onClick={() => onRemove(item._id || item.id)}
                  onMouseOver={e => (e.currentTarget.style.background = '#d9363e')}
                  onMouseOut={e => (e.currentTarget.style.background = '#ff4d4f')}
                >
                  🗑 Xóa
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div style={{ marginTop: 18, fontWeight: 'bold', fontSize: 18, textAlign: 'right', color: '#222' }}>
        Tổng: {
          total > 0
            ? total.toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + 'đ'
            : '0đ'
        }
      </div>
      <button
        style={{
          marginTop: 10,
          width: '100%',
          padding: 12,
          background: cart.length === 0 ? '#bdbdbd' : '#1976d2',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          fontWeight: 'bold',
          fontSize: 18,
          cursor: cart.length === 0 || loading ? 'not-allowed' : 'pointer',
          boxShadow: '0 2px 8px #e3f2fd',
          transition: 'background 0.2s',
        }}
        disabled={cart.length === 0 || loading}
        onClick={onCheckout}
        aria-label="Thanh toán đơn hàng"
        onMouseOver={e => {
          if (!cart.length || loading) return;
          e.currentTarget.style.background = '#115293';
        }}
        onMouseOut={e => {
          if (!cart.length || loading) return;
          e.currentTarget.style.background = '#1976d2';
        }}
      >
        {loading ? 'Đang xử lý...' : '✔️ Thanh toán'}
      </button>
    </div>
  );
};

export default CartComponent;
