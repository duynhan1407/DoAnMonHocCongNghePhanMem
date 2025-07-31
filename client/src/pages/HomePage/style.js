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
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 32px 24px;
    margin-top: 32px;
    background: linear-gradient(135deg, #e3f0ff 0%, #f8fbff 100%);
    border-radius: 18px;
    padding: 32px 24px;
    justify-items: center;
    align-items: start;
    box-shadow: 0 4px 24px #e0e7ff44;
    border: 1.5px solid #e0e7ff;
    @media (max-width: 1200px) {
        grid-template-columns: repeat(2, 1fr);
    }
    @media (max-width: 900px) {
        grid-template-columns: 1fr;
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
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 2px 12px #b2f5ea;
    transition: box-shadow 0.2s, transform 0.2s;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    min-height: 380px;
    max-height: 420px;
    height: 100%;
    box-sizing: border-box;
    &:hover {
        box-shadow: 0 8px 32px #00bfae44;
        transform: translateY(-4px) scale(1.03);
    }
    @media (max-width: 900px) {
        min-width: 90vw !important;
        max-width: 100vw !important;
        min-height: 320px;
        max-height: 420px;
    }
`;