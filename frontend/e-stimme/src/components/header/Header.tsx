import React from "react";
import styled from "styled-components";
import Logo from "./Logo";

const HeaderContainer = styled.header`
  background-color: rgba(30, 113, 255, 0.1);
  padding: 1rem;
  height: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Header: React.FC = ({}) => {
  return (
    <HeaderContainer>
      <Logo />
    </HeaderContainer>
  );
};

export default Header;
