import React from "react";
import styled from "styled-components";

const Title = styled.h1`
  margin: 0 5rem;
  color: #000;
  letter-spacing: -0.52px;
  font: 500 26px/1 Poppins, sans-serif;
`;

const LogoText = styled.span`
  font-weight: 275;
`;

const LogoTextBold = styled.span`
  font-weight: 600;
`;

const Logo: React.FC = () => {
  return (
    <Title>
      <LogoTextBold>vote</LogoTextBold>
      <LogoText>alyze</LogoText>
    </Title>
  );
};

export default Logo;
