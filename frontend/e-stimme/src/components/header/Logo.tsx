import React from "react";
import styled from "styled-components";
import BundeswahlleiterinLogo from "../../assets/Bundeswahlleiterin_logo.png";

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 0 auto;
`;

const LogoImage = styled.img`
  height: 60px;
  margin-right: 1rem;
`;

const Title = styled.h1`
  margin: 0;
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
    <LogoContainer>
      <LogoImage src={BundeswahlleiterinLogo} alt="Logo" />
      <Title>
        <LogoTextBold>e</LogoTextBold>
        <LogoText>Stimme</LogoText>
      </Title>
    </LogoContainer>
  );
};

export default Logo;
