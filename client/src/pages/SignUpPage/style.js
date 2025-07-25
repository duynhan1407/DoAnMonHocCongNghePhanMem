import styled from "styled-components";

export const WrapperContainerLeft = styled.div
`
    flex: 1;
    padding: 40px 45px 24px;
    display: flex;
    flex-direction: column;
    background: linear-gradient(135deg, #e0e7ff 0%, #f0f8ff 60%, #c7d2fe 100%);
    border-radius: 16px;
    box-shadow: 0 4px 24px rgba(66,133,244,0.10);
`

export const WrapperContainerRight = styled.div
`
    width: 300px;
    background: linear-gradient(136deg, #f0f8ff -1%, #dbeeff 85%);
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    border-radius: 16px;
    box-shadow: 0 4px 24px rgba(66,133,244,0.10);
`

export const WrapperText = styled.span
`
    color: #2563eb;
    font-size: 14px;
    cursor: pointer;
    font-weight: 600;
    transition: color 0.2s;
    &:hover {
      color: #174ea6;
      text-decoration: underline;
    }
`