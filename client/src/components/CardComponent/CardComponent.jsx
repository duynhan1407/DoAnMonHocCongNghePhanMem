import React from "react";
import { Card, Tag } from "antd";
import { StarFilled } from "@ant-design/icons";
import {
  StyleNameProduct,
  WrapperDiscount,
  WrapperPrice,
  WrapperReport,
} from "./style";

const CardComponent = ({
  name = "N/A",
  price = null,
  rating = 0,
  image = "",
  brand = "",
  condition = "Unavailable",
  discount = null,
}) => {
  const getFullImageUrl = (img) => {
    if (!img) return "/assets/images/no-image.png";
    if (img.startsWith("http")) return img;
    return `http://localhost:3001${img}`;
  };

  const fullImageUrl = getFullImageUrl(image);

  // Xác định màu sắc theo trạng thái sản phẩm
  const getConditionColor = (condition) => {
    switch (condition) {
      case "Available":
        return "green";
      case "OutOfStock":
        return "volcano";
      default:
        return "gray";
    }
  };

  // Xác định nhãn hiển thị cho trạng thái sản phẩm
  const getConditionLabel = (condition) => {
    switch (condition) {
      case "Available":
        return "Còn hàng";
      case "OutOfStock":
        return "Hết hàng";
      default:
        return "Không xác định";
    }
  };

  return (
    <Card
      hoverable
      style={{
        width: 240,
        border: "1px solid #f0f0f0",
        borderRadius: "8px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
      cover={
        <img
          alt={name}
          src={fullImageUrl}
          onError={(e) => {
            if (!e.target.src.includes('no-image.png')) {
              e.target.onerror = null;
              e.target.src = "/assets/images/no-image.png";
            }
          }}
          style={{
            height: 150,
            objectFit: "cover",
            borderBottom: "1px solid #f0f0f0",
          }}
        />
      }
    >
      <StyleNameProduct>{name} {brand && `(${brand})`}</StyleNameProduct>

      <WrapperReport>
        <span style={{ marginRight: "4px" }}>
          <span>{rating.toFixed(1)}</span>
          <StarFilled style={{ fontSize: "16px", color: "#FFD700", marginLeft: "4px" }} />
        </span>
        <Tag color={getConditionColor(condition)}>
          {getConditionLabel(condition)}
        </Tag>
      </WrapperReport>

      <div style={{ marginTop: "8px" }}>
        <WrapperPrice>
          {price ? `${price.toLocaleString()} ₫` : "N/A"}
          {discount && <WrapperDiscount>-{discount}%</WrapperDiscount>}
        </WrapperPrice>
      </div>
    </Card>
  );
};

export default CardComponent;
