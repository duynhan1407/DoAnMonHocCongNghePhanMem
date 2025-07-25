import React, { useState } from 'react';
import { useSelector } from 'react-redux';

const ProfilePage = () => {
  const user = useSelector((state) => state.user);
  const [form, setForm] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    address: user.address || '',
  });
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Gọi API cập nhật thông tin user
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px #eee', padding: 30 }}>
      <h1 style={{ textAlign: 'center' }}>Thông tin cá nhân</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <label>
          Họ tên:
          <input name="name" value={form.name} onChange={handleChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
        </label>
        <label>
          Email:
          <input name="email" value={form.email} disabled style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', background: '#f5f5f5' }} />
        </label>
        <label>
          Số điện thoại:
          <input name="phone" value={form.phone} onChange={handleChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
        </label>
        <label>
          Địa chỉ:
          <input name="address" value={form.address} onChange={handleChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
        </label>
        <button type="submit" style={{ background: '#00bfae', color: '#fff', border: 'none', borderRadius: 6, padding: 12, fontWeight: 600, fontSize: 16, marginTop: 12 }}>
          Lưu thông tin
        </button>
        {success && <div style={{ color: '#388e3c', textAlign: 'center' }}>Cập nhật thành công!</div>}
      </form>
    </div>
  );
};

export default ProfilePage;
