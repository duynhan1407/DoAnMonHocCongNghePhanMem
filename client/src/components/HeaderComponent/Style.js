import styled from "styled-components";
import { Row } from "antd";

export const WrapperHeader = styled(Row)`
  padding: 15px 150px;
  background-color: rgb(14, 143, 255);
  align-items: center;
  gap: 16px;
  flex-wrap: nowrap;
`;

export const WrapperTextHeader = styled.span`
  font-size: 18px;
  color: #fff;
  font-weight: bold;
  text-align: left;
`;

export const WrapperHeaderAccount = styled.div`
  display: flex;
  align-items: center;
  color: #fff;
  gap: 10px;
`;

export const WrapperTextHeaderSmall = styled.span`
  font-size: 12px;
  color: #fff;
  white-space: nowrap;
`;

export const Wrappercontent = styled.p`
  cursor: pointer;
  &:hover {
    background: rgb(26, 148, 255);
    color: #fff;
  }
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ccc;
  border-radius: 20px;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;

  &:focus {
    border-color: rgb(14, 143, 255);
    box-shadow: 0 0 5px rgba(14, 143, 255, 0.5);
  }

  &::placeholder {
    color: #aaa;
  }
`;
