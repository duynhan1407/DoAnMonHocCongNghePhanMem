import styled from 'styled-components';

export const SignInWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: linear-gradient(135deg, #e0e7ff 0%, #f0f8ff 50%, #c7d2fe 100%);
`;

export const SignInContainer = styled.div`
    width: 90%;
    max-width: 400px;
    padding: 28px 24px 24px 24px;
    background: #f9fafb;
    border-radius: 16px;
    box-shadow: 0px 8px 32px rgba(66,133,244,0.10);
    display: flex;
    flex-direction: column;
    gap: 20px;
    border: 1.5px solid #e0e7ff;

    @media (max-width: 768px) {
        padding: 18px;
    }

    @media (max-width: 480px) {
        padding: 10px;
    }
`;

export const Title = styled.h2`
    text-align: center;
    font-size: 26px;
    font-weight: 700;
    color: #2563eb;
    letter-spacing: 1px;
    margin-bottom: 8px;
    @media (max-width: 480px) {
        font-size: 20px;
    }
`;

export const InputWrapper = styled.div`
    width: 100%;
    margin-bottom: 15px;

    .ant-input,
    .ant-input-password {
        height: 44px;
        border-radius: 7px;
        border: 1.5px solid #c7d2fe;
        background: #f3f6fd;
        font-size: 15px;
    }

    @media (max-width: 480px) {
        .ant-input,
        .ant-input-password {
            height: 36px;
        }
    }
`;

export const GoogleButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin: 18px 0 10px 0;
`;

export const GoogleButton = styled.button`
  width: 100%;
  background: linear-gradient(90deg, #fff 60%, #e0e7ff 100%);
  color: #2563eb;
  border: 1.5px solid #c7d2fe;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 17px;
  font-weight: 600;
  border-radius: 7px;
  height: 48px;
  cursor: pointer;
  transition: box-shadow 0.2s, border 0.2s, background 0.2s;
  box-shadow: 0 2px 12px rgba(66,133,244,0.10);

  &:hover {
    border: 2px solid #2563eb;
    box-shadow: 0 4px 20px rgba(66,133,244,0.18);
    color: #174ea6;
    background: linear-gradient(90deg, #e0e7ff 0%, #fff 100%);
  }

  @media (max-width: 480px) {
    font-size: 14px;
    height: 40px;
  }
`;
