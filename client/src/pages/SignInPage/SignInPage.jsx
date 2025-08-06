import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import * as UserServices from '../../services/UserServices';
import { setUser } from '../../redux/Slide/userSlide';
import { Button, Input, message } from 'antd';
import { jwtDecode } from 'jwt-decode'; // Import jwt-decode
import { SignInWrapper, SignInContainer, Title, InputWrapper, GoogleButtonWrapper, GoogleButton } from './style';
import axios from 'axios';

const SignInPage = () => {
  const [loginValue, setLoginValue] = useState(''); // username hoặc email
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Kiểm tra nếu đã đăng nhập và token hợp lệ

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const expiryTime = decoded?.exp * 1000; // thời gian hết hạn của token (ms)
        const currentTime = Date.now();

        if (expiryTime > currentTime) {
          // Token còn hiệu lực, thực hiện lấy thông tin người dùng
          if (decoded?.id) {
            (async () => {
              const user = await handleGetDetailUser(decoded.id, token);
              // Nếu đã đăng nhập mà chưa có userName trong localStorage thì lưu lại
              if (user) {
                let userName = 'Không xác định';
                if (user.name && typeof user.name === 'string') userName = user.name;
                else if (user.username && typeof user.username === 'string') userName = user.username;
                else if (user.fullName && typeof user.fullName === 'string') userName = user.fullName;
                else if (user.email && typeof user.email === 'string') userName = user.email;
                if (!localStorage.getItem('userName')) {
                  localStorage.setItem('userName', userName);
                  console.log('Đã lưu userName vào localStorage khi khởi động:', userName);
                }
              }
            })();
          }
        } else {
          // Token đã hết hạn, làm mới token
          console.warn('Token đã hết hạn.');
          localStorage.removeItem('access_token');
          refreshToken();
        }
      } catch (error) {
        console.error('Token không hợp lệ:', error.message);
        localStorage.removeItem('access_token');
        navigate('/sign-in'); // Điều hướng đến trang đăng nhập
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hàm đăng nhập người dùng
  const handleSignIn = async () => {
    if (!loginValue || !password) {
      message.error('Tên đăng nhập/email và mật khẩu là bắt buộc!');
      return;
    }
    // Kiểm tra loginValue là email hay username
    const isEmail = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(loginValue);
    const payload = isEmail ? { email: loginValue, password } : { username: loginValue, password };
    setLoading(true);
    try {
      const response = await UserServices.loginUser(payload);
      if (response?.access_token) {
        const { access_token } = response;
        localStorage.setItem('access_token', access_token);
        const decoded = jwtDecode(access_token);
        if (decoded?.id) {
          const user = await handleGetDetailUser(decoded.id, access_token);
          let userName = 'Không xác định';
          if (user) {
            if (user.name && typeof user.name === 'string') userName = user.name;
            else if (user.username && typeof user.username === 'string') userName = user.username;
            else if (user.fullName && typeof user.fullName === 'string') userName = user.fullName;
            else if (user.email && typeof user.email === 'string') userName = user.email;
          }
          localStorage.setItem('userName', userName);
          if (user?.isProfileUpdated) {
            message.success('Đăng nhập thành công!');
            navigate('/');
          } else {
            navigate('/profile');
          }
        }
      } else {
        message.error('Đăng nhập thất bại.');
      }
    } catch (error) {
      message.error(error?.response?.data?.message || 'Đăng nhập thất bại.');
    } finally {
      setLoading(false);
    }
  };

  // Lấy chi tiết người dùng sau khi đăng nhập
  const handleGetDetailUser = async (id, token) => {
    try {
      const res = await UserServices.getDetailUser(id, token);
      dispatch(setUser({ ...res?.data, access_token: token }));
      return res?.data; // Trả về thông tin người dùng
    } catch (error) {
      console.error('Không thể lấy chi tiết người dùng:', error.message);
      message.error('Không thể tải thông tin người dùng.');
      return null;
    }
  };

  // Kiểm tra email hợp lệ và cập nhật trạng thái lỗi
  const handleLoginValueChange = (e) => {
    const value = e.target.value;
    setLoginValue(value);
    // Nếu là email thì kiểm tra hợp lệ, nếu không thì không báo lỗi
    const isEmail = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(value);
    if (value && isEmail === true && !value.match(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/)) {
      setLoginError('Vui lòng nhập email hợp lệ!');
    } else {
      setLoginError('');
    }
  };

  // Gọi API làm mới token
  const refreshToken = async () => {
    try {
      const response = await axios.post('/api/refresh-token', {}, { withCredentials: true });

      if (response?.data?.access_token) {
        const newAccessToken = response.data.access_token;

        // Lưu lại access token mới vào localStorage
        localStorage.setItem('access_token', newAccessToken);

        // Lấy thông tin người dùng và điều hướng trang chủ
        const decoded = jwtDecode(newAccessToken);
        if (decoded?.id) {
          await handleGetDetailUser(decoded.id, newAccessToken);
          message.success('Token đã được làm mới. Đang chuyển đến trang chủ.');
          navigate('/');
        }
      } else {
        message.error('Không thể làm mới token. Vui lòng đăng nhập lại.');
        navigate('/sign-in');
      }
    } catch (error) {
      console.error('Lỗi làm mới token:', error.message);
      message.error('Lỗi làm mới token. Vui lòng đăng nhập lại.');
      navigate('/sign-in');
    }
  };

  // Chuyển hướng tới trang đăng ký
  const goToSignUpPage = () => {
    navigate('/sign-up'); // Chuyển hướng tới trang đăng ký
  };

  return (
    <SignInWrapper>
      <SignInContainer>
        <Title>Đăng nhập</Title>
        <InputWrapper>
          <Input
            placeholder="Tên đăng nhập hoặc Email"
            value={loginValue}
            onChange={handleLoginValueChange}
          />
          {loginError && <span style={{ color: 'red' }}>{loginError}</span>}
        </InputWrapper>
        <InputWrapper>
          <Input.Password
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </InputWrapper>
        <Button
          type="primary"
          block
          loading={loading}
          onClick={handleSignIn}
          disabled={!loginValue || !password || loading || !!loginError}
        >
          Đăng nhập
        </Button>
        <div style={{ textAlign: 'center', margin: '16px 0' }}>
          <GoogleButtonWrapper>
            <a href={process.env.REACT_APP_API_URL.replace(/\/$/, '') + '/auth/google-signin'} style={{ width: '100%' }}>
              <GoogleButton type="button">
                <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" style={{ width: 24, height: 24, marginRight: 8 }} />
                Đăng nhập với Google
              </GoogleButton>
            </a>
          </GoogleButtonWrapper>
        </div>

        {/* Chuyển hướng đến trang Đăng ký */}
        <Button type="default" block onClick={goToSignUpPage}>
          Đăng ký
        </Button>
      </SignInContainer>
    </SignInWrapper>
  );
};

export default SignInPage;
