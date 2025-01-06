import React from "react";
import styled from "styled-components";
import FormControl from "@mui/material/FormControl";
import {
  Button,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 55vh;
  padding: 2rem;
`;

const Title = styled.h1`
  color: #000;
  font-size: 26px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
`;

const Text = styled.p`
  color: #000;
  text-align: center;
  font-size: 18px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  width: 900px;
  flex-shrink: 0;
`;

const FormTitle = styled.h2`
  margin-top: 3rem;
  color: #000;
  text-align: center;
  font-size: 22px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 400px;
`;

const VoteAuth: React.FC = () => {
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const handleMouseUpPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  return (
    <Container>
      <Title>Willkommen zur Online-Wahl</Title>
      <Text>
        Herzlich willkommen! Sie befinden sich im offiziellen Online-Wahlsystem.
        Bitte geben Sie Ihren persönlichen Zugangscode (Token) ein, um mit der
        Stimmabgabe zu beginnen.
        <br />
        Ihr Zugangscode stellt sicher, dass Ihre Stimme sicher und anonym
        abgegeben wird.
      </Text>
      <FormTitle>Bitte Token eingeben</FormTitle>
      <Form>
        <FormControl sx={{ m: 1, width: "100%" }} variant="outlined">
          <InputLabel htmlFor="outlined-adornment-password">Token</InputLabel>
          <OutlinedInput
            id="outlined-adornment-password"
            type={showPassword ? "text" : "password"}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label={
                    showPassword ? "hide the password" : "display the password"
                  }
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  onMouseUp={handleMouseUpPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
            label="Password"
          />
        </FormControl>
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Weiter zur Stimmabgabe
        </Button>
      </Form>
    </Container>
  );
};

export default VoteAuth;
