import React from "react";
import styled from "styled-components";
import { ReactComponent as GermanFlag } from "../../assets/de.svg";
import { ReactComponent as BritishFlag } from "../../assets/gb.svg";
import Logo from "./Logo";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";

const HeaderContainer = styled.header`
  background-color: rgba(30, 113, 255, 0.1);
  padding: 1rem;
  height: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LanguageSwitch = styled.div`
  display: flex;
  gap: 0.7rem;
`;

const FlagButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 12px;
  display: flex;
  justify-content: center;
  align-items: center;

  &:hover {
    opacity: 0.8;
  }
`;

const Navigation = styled.nav`
  display: flex;
  gap: 1rem;
`;

const NavButton = styled.button<{ active: boolean }>`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  color: ${(props) => (props.active ? "#1e71ff" : "#000")};
  border-bottom: ${(props) => (props.active ? "2px solid #1e71ff" : "none")};

  &:hover {
    opacity: 0.8;
  }
`;

interface HeaderProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activePage, setActivePage }) => {
  const { t } = useTranslation();

  return (
    <HeaderContainer>
      <Logo />
      <Navigation>
        <NavButton
          active={activePage === "Ergebnisse"}
          onClick={() => setActivePage("Ergebnisse")}
        >
          {t("Ergebnisse")}
        </NavButton>

        <NavButton
          active={activePage === "Abgeordnete"}
          onClick={() => setActivePage("Abgeordnete")}
        >
          {t("Abgeordnete")}
        </NavButton>

        <NavButton
          active={activePage === "Statistiken"}
          onClick={() => setActivePage("Statistiken")}
        >
          {t("Statistiken")}{" "}
        </NavButton>
      </Navigation>
      <LanguageSwitch>
        <FlagButton onClick={() => i18n.changeLanguage("de")}>
          <GermanFlag />
        </FlagButton>
        <FlagButton onClick={() => i18n.changeLanguage("en")}>
          <BritishFlag />
        </FlagButton>
      </LanguageSwitch>
    </HeaderContainer>
  );
};

export default Header;
