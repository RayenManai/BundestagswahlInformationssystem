import React from "react";
import styled from "styled-components";
import { ReactComponent as GitHubIcon } from "../assets/github-mark.svg"; 
import Logo from "./Logo";

const FooterContainer = styled.footer`
    background-color: rgba(30, 113, 255, 0.1);
    padding: 2rem;
    text-align: center;
    position: relative;
`;

const FooterLink = styled.a`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    text-decoration: none;
    color: #000;
    margin-top: 1rem;
    font-size: 1.1rem;
    &:hover {
        opacity: 0.8;
    }
`;

const CopyRightNotice = styled.p`
    color: rgba(43, 53, 62, 0.70);
    font-family: Roboto;
    font-size: 13px;
    font-style: normal;
    font-weight: 400;
`;

const Footer: React.FC = () => {
    return (
        <FooterContainer>
            <Logo />
            <FooterLink href="https://github.com/RayenManai/BundestagswahlInformationssystem" target="_blank" rel="noopener noreferrer">
                <GitHubIcon width="46" height="40" />
            </FooterLink>
            <CopyRightNotice>&copy; votealyze 2024 . All rights reserved.</CopyRightNotice>
        </FooterContainer>
    );
};

export default Footer;
