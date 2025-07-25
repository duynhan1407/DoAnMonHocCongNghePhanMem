import React from 'react'
import Input from 'antd/es/input/Input'
const InputComponnent = (size, placeholder, bordered, style,...rests) => {
  return (
    <Input
    size={size} 
    placeholder ={placeholder} 
    style={{style}} 
    {...rests}
  />
  )
}

export default InputComponnent