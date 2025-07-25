import styled from "styled-components";
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";

export const WrapperTypeRoom = styled.div`
    display: flex;
    align-items: center;
    gap: 24px;
    justify-content: flex-start;
    border-bottom: 2px solid #2563eb;
    height: 54px;
    background: linear-gradient(90deg, #e0e7ff 0%, #f0f8ff 100%);
    border-radius: 10px 10px 0 0;
`;

export const WrapperButtonMore = styled(ButtonComponent)`
    &:hover{
        color: #fff;
        background: #2563eb;
    }
    width: 100%;
    text-align: center;
    border-radius: 8px;
    font-weight: 600;
`;

export const WrapperProducts = styled.div`
    display: flex;
    justify-content: center;
    gap: 18px;
    margin-top: 24px;
    flex-wrap: wrap;
    background: linear-gradient(135deg, #f0f8ff 0%, #e0e7ff 100%);
    border-radius: 12px;
    padding: 18px 12px;

    @media (max-width: 900px) {
        padding: 0 10px !important;
    }
`;

export const HomeResponsiveButton = styled(ButtonComponent)`
    @media (max-width: 900px) {
        top: 10px !important;
        right: 10px !important;
        padding: 8px 12px !important;
        font-size: 14px !important;
    }
`;

export const HomeResponsiveCard = styled.div`
    @media (max-width: 900px) {
        min-width: 90vw !important;
        max-width: 100vw !important;
    }
`;