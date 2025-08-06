import React, { useEffect, useState } from 'react';
import { WrapperContainerLeft, WrapperText } from './style';
import InputForm from '../../components/InputForm/InputForm';
import ButtonComponent from '../../components/ButtonComponent/ButtonComponent';
import { Image } from 'antd';
import logoLogin from '../../assets/Logo-login.jpg';
import { useNavigate } from 'react-router-dom';
import { useMutationHooks } from '../../hooks/useMutationHooks';
import * as UserServices from '../../services/UserServices';
import * as message from '../../components/Message/Message';

const handleNavigateSignIn = (navigate) => () => navigate('/sign-in');

const SignUpPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const mutation = useMutationHooks(
    data => UserServices.signupUser(data)
  );

  const { data, isSuccess, isError } = mutation;

  useEffect(() => {
    if (isSuccess) {
      message.success();
      navigate('/sign-in');
    } else if (isError) {
      message.error();
    }
  }, [isSuccess, isError, navigate]);

  const handleOnchangeEmail = (value) => setEmail(value);
  const handleOnchangeUsername = (value) => setUsername(value);
  const handleOnchangePassword = (value) => setPassword(value);
  const handleOnchangeConfirmPassword = (value) => setConfirmPassword(value);

  const handleSignUp = () => {
    // Gửi cả username và email nếu có, hoặc chỉ 1 trong 2
    const payload = {};
    if (email) payload.email = email;
    if (username) payload.username = username;
    payload.password = password;
    payload.confirmPassword = confirmPassword;
    mutation.mutate(payload);
    console.log('sign-up', payload);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.53)', height: '100vh' }}>
      <div style={{ width: '800px', height: '445px', borderRadius: '6px', backgroundColor: '#fff', display: 'flex' }}>
        <WrapperContainerLeft>
          <h1>Xin chào</h1>
          <p style={{ fontSize: '16px', padding: '0 6px', color: 'rgb(16, 28, 255)' }}>
            Đăng nhập và tạo tài khoản
          </p>
          <InputForm style={{ marginBottom: '6px' }} placeholder="Tên đăng nhập" value={username} onChange={handleOnchangeUsername} />
          <InputForm style={{ marginBottom: '6px' }} placeholder="Email" value={email} onChange={handleOnchangeEmail} />
          <InputForm style={{ marginBottom: '6px' }} placeholder="Mật khẩu" value={password} onChange={handleOnchangePassword} />
          <InputForm placeholder="Xác nhận mật khẩu" value={confirmPassword} onChange={handleOnchangeConfirmPassword} />
          {data?.status === 'ERR' && <span>{data?.message}</span>}
          <ButtonComponent
            disabled={(!email.length && !username.length) || !password.length || !confirmPassword.length}
            onClick={handleSignUp}
            bodered={false}
            size={100}
            style={{
              backgroundColor: 'rgb(43, 70, 189)',
              width: '100%',
              height: '48px',
              border: 'none',
              borderRadius: '4px',
              margin: '26px 0 12px'
            }}
            textButton={'Đăng ký'}
            styleButton={{ color: '#efefef' }}
          />
          <div style={{ display: 'flex', justifyContent: 'center', margin: '12px 0' }}>
            <a href={`${process.env.REACT_APP_API_URL.replace(/\/$/, '')}/auth/google-signup`}>
              <img
                src="https://developers.google.com/identity/images/g-logo.png"
                alt="Google"
                style={{ width: 36, height: 36, cursor: 'pointer' }}
                title="Đăng ký với Google"
              />
            </a>
          </div>
          <p style={{fontSize: '15px'}}>
            Bạn đã có tài khoản
            <span>
              <WrapperText onClick={handleNavigateSignIn(navigate)} style={{fontSize: '15px'}}>Đăng nhập</WrapperText>
            </span>
          </p>
        </WrapperContainerLeft>
        <WrapperContainerLeft>
          <Image src={logoLogin} previous={false} alt="Image-login" height="203px" width="203px" />
          <h4 style={{ fontSize: '25px', justifyContent: 'center' }}>Mua sắm đồng hồ mọi lúc</h4>
        </WrapperContainerLeft>
      </div>
    </div>
  );
};

export default SignUpPage;
