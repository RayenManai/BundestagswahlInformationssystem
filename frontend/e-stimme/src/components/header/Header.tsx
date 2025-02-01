import React from "react";
import styled from "styled-components";
import Logo from "./Logo";
import { useNavigate } from "react-router-dom";

const HeaderContainer = styled.header`
  background-color: rgba(30, 113, 255, 0.1);
  padding: 1rem;
  height: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
`;

const Header: React.FC = () => {
  const navigate = useNavigate();
  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <HeaderContainer onClick={handleLogoClick}>
      {" "}
      <Logo />
    </HeaderContainer>
  );
};

export default Header;
