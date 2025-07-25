import React from "react";
import HeaderComponent from "../HeaderComponent/HeaderComponent";

const DefaultComponent = ({ children }) => {
  return (
    <>
      <HeaderComponent />
      <div>{children}</div>
    </>
  );
};

export default DefaultComponent;
