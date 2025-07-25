import styled from "styled-components";
import { Col, Image } from 'antd'

export const WrapperIimageSmall = styled(Image)
`
    height: 64px;
    width: 64px;
`

export const WrapperColIimage = styled(Col)
`
    flex-basics: unset;
    display: flex;
`


export const WrapperTypeProduct = styled.h1`
    color: rgb(36, 36, 36);
    font-size: 24px;
    font-weight: 300;
    line-height: 32px;
    word-break: break-word;
`;

export const WrapperTypeText = styled.span`
    font-size: 15px;
    line-height: 24px;
    color: rgb(120, 120, 120)
`;

export const WrapperPriceProduct = styled.div`
    color: rgb(250, 250, 250);
    border-radius: 4px;
`;

export const WrapperPriceTextProduct = styled.h1`
    color: rgb(8, 8, 8);
    font-size: 32px;
    line-height: 40px;
    margin-right: 8px;
    font-weight: 500;
    padding: 10px;
    margin-top: 10px;
`;

export const WrapperBrandProduct = styled.div`
   span.brand{
        text-decoration: underline;
        font-size: 15px;
        line-height: 24px;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
   }
`;