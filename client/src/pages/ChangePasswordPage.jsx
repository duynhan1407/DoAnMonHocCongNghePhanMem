import React, { useState } from 'react';

const ChangePasswordPage = () => {
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('Mật khẩu mới không khớp!');
      return;
    }
    // TODO: Gọi API đổi mật khẩu
    setSuccess(true);
    setForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px #eee', padding: 30 }}>
      <h1 style={{ textAlign: 'center' }}>Đổi mật khẩu</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <label>
          Mật khẩu cũ:
          <input name="oldPassword" type="password" value={form.oldPassword} onChange={handleChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
        </label>
        <label>
          Mật khẩu mới:
          <input name="newPassword" type="password" value={form.newPassword} onChange={handleChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
        </label>
        <label>
          Xác nhận mật khẩu mới:
          <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
        </label>
        <button type="submit" style={{ background: '#00bfae', color: '#fff', border: 'none', borderRadius: 6, padding: 12, fontWeight: 600, fontSize: 16, marginTop: 12 }}>
          Đổi mật khẩu
        </button>
        {error && <div style={{ color: '#e53935', textAlign: 'center' }}>{error}</div>}
        {success && <div style={{ color: '#388e3c', textAlign: 'center' }}>Đổi mật khẩu thành công!</div>}
      </form>
    </div>
  );
};

export default ChangePasswordPage;
