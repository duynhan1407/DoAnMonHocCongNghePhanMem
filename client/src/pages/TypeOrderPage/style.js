import { Col } from "antd";
import styled from "styled-components";

export const WrapperProducts = styled.div
`
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 24px;
    margin-top: 24px;
    background: linear-gradient(135deg, #e0e7ff 0%, #f0f8ff 60%, #c7d2fe 100%);
    border-radius: 12px;
    padding: 18px 12px;
`

export const WrapperNavbar = styled(Col)
`
    background: #f9fafb;
    margin-right: 10px;
    padding: 16px;
    border-radius: 10px;
    height: fit-content;
    margin-top: 24px;
    box-shadow: 0 2px 12px rgba(66,133,244,0.08);
    border: 1.5px solid #e0e7ff;
`