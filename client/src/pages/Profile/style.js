import { Upload } from "antd";
import styled from "styled-components";

export const WrapperHeader = styled.h1
`
    color: #2563eb;
    font-size: 22px;
    margin: 8px 0;
    font-weight: 700;
    text-align: center;
`

export const WrapperContentProfile = styled.div
`
    display: flex;
    flex-direction: column;
    border: 2.5px solid #c7d2fe;
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    padding: 28px 20px;
    border-radius: 16px;
    gap: 24px;
    background: linear-gradient(135deg, #f0f8ff 0%, #e0e7ff 100%);
    box-shadow: 0 4px 24px rgba(66,133,244,0.10);
`

export const WrapperLabel = styled.label
`
    color: #174ea6;
    font-size: 14px;
    line-height: 30px;
    font-weight: 600;
    width: 80px;
    text-align: left;

`

export const WrapperInput = styled.div
`
    display: flex;
    align-items: center;
    gap: 20px;
`

export const WrapperUploadFile = styled(Upload)
`
    & .ant-upload.ant-upload-select.ant-upload-select-picture-card {
        width: 60px;
        height: 60px;
        border-radius: 50%;
    }
    & .ant-uplaod-list-item-info {
        display: none
    }
`