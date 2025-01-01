import React from "react";
import styled from "styled-components";

interface SnackbarProps {
  backgroundColor: string;
  color: string;
  message?: string;
}

const Snackbar = styled.div<SnackbarProps>`
  background-color: ${(props) => props.backgroundColor};
  color: ${(props) => props.color};
  padding: 16px;
  border-radius: 4px;
  font-size: 1rem;
  display: flex;
  align-items: center;
  margin: 2rem auto;
  width: 40%;
`;

const SnackbarText = styled.span`
  flex-grow: 1;
  text-align: center;
`;

const CustomSnackbar: React.FC<SnackbarProps> = ({
  backgroundColor,
  color,
  message,
}) => {
  return (
    <Snackbar backgroundColor={backgroundColor} color={color}>
      <SnackbarText>{message}</SnackbarText>
    </Snackbar>
  );
};

export default CustomSnackbar;
