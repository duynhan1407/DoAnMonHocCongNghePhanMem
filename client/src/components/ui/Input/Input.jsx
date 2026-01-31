import React from 'react';
import Input from 'antd/es/input/Input';

const InputComponent = ({ size = 'middle', placeholder = '', bordered = true, style = {}, ...rest }) => {
  return (
    <Input
      size={size}
      placeholder={placeholder}
      bordered={bordered}
      style={style}
      {...rest}
    />
  );
};

export default InputComponent;