import React from 'react';
import { SearchOutlined } from '@ant-design/icons';
import InputComponnent from '../InputComponent/InputComponnent';
import ButtonComponent from '../ButtonComponent/ButtonComponent';

const ButtonInputSearch = (props) => {
  const {
    size = 'medium',
    placeholder = 'Tìm kiếm...',
    textButton = '',
    bordered = true,
    backgroundColorInput = '#fff',
    backgroundColorButton = 'rgb(13, 92, 182)',
    colorButton = '#fff',
    inputStyle = {},
    buttonStyle = {},
    containerStyle = {},
  } = props;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', ...containerStyle }}>
      <InputComponnent
        size={size}
        placeholder={placeholder}
        bordered={bordered}
        style={{
          backgroundColor: backgroundColorInput,
          borderRadius: '8px',
          flex: 1,
          ...inputStyle,
        }}
      />
      <ButtonComponent
        size={size}
        bordered={bordered}
        style={{
          backgroundColor: backgroundColorButton,
          border: !bordered && 'none',
          borderRadius: '8px',
          padding: '0 15px',
          ...buttonStyle,
        }}
        icon={<SearchOutlined style={{ color: colorButton }} />}
        textButton={textButton}
        styleButton={{ color: colorButton }}
      />
    </div>
  );
};

export default ButtonInputSearch;
