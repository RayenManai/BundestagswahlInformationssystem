import React from "react";
import "./App.css";
import { styled } from "styled-components";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import GenerateToken from "./pages/token/GenerateToken";
import VoteAuth from "./pages/vote/VoteAuth";
import PrivateRoute from "./PrivateRoute";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import keycloak from "./KeycloakService";
import Stimmzettel from "./pages/vote/Stimmzettel";

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: #f9f9f9;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 2rem;
`;

const StyledButton = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 100px;
  background-color: #1976d2;
  color: #ffffff;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: bold;
  border-radius: 8px;
  padding: 10px;
  transition: background-color 0.3s ease;
`;

const App: React.FC = () => {
  return (
    <ReactKeycloakProvider authClient={keycloak}>
      <Router>
        <PageContainer>
          <Header />
          <MainContent>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/generate_token"
                element={
                  <PrivateRoute>
                    <GenerateToken />
                  </PrivateRoute>
                }
              />
              <Route path="/vote" element={<VoteAuth />} />
              <Route path="/stimmzettel" element={<Stimmzettel />} />
            </Routes>
          </MainContent>
          <Footer />
        </PageContainer>
      </Router>
    </ReactKeycloakProvider>
  );
};

const Home: React.FC = () => {
  return (
    <ButtonContainer>
      <StyledButton to="/generate_token">Token generieren</StyledButton>
      <StyledButton to="/vote">Stimme abgeben</StyledButton>
    </ButtonContainer>
  );
};

export default App;
