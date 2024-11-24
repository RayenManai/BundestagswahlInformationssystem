import React from "react";
import styled from "styled-components";
import { ReactComponent as GermanFlag } from "../assets/de.svg";
import { ReactComponent as BritishFlag } from "../assets/gb.svg";
import Logo from "./Logo";

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
    margin: 0 5rem;
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

const Header: React.FC = () => {
    return (
        <HeaderContainer>
            <Logo />
            <LanguageSwitch>
                <FlagButton>
                    <GermanFlag />
                </FlagButton>
                <FlagButton>
                    <BritishFlag />
                </FlagButton>
            </LanguageSwitch>
        </HeaderContainer>
    );
};

export default Header;
