import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OauthSuccess = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const isNewUser = params.get('isNewUser');
    const error = params.get('error');
    if (error) {
      if (error === 'signup_email_exists') {
        alert('Email Google này đã tồn tại, vui lòng đăng nhập!');
        navigate('/sign-in');
        return;
      }
      if (error === 'signin_not_registered') {
        alert('Tài khoản Google này chưa được đăng ký, vui lòng đăng ký trước!');
        navigate('/sign-in');
        return;
      }
      alert('Đăng nhập/Đăng ký Google thất bại!');
      navigate('/sign-in');
      return;
    }
    if (token) {
      localStorage.setItem('access_token', token);
      if (isNewUser === '1') {
        alert('Đăng ký tài khoản bằng Google thành công!');
      } else {
        alert('Đăng nhập bằng Google thành công!');
      }
      navigate('/');
    }
  }, [navigate]);
  return <div>Đang đăng nhập...</div>;
};

export default OauthSuccess;
