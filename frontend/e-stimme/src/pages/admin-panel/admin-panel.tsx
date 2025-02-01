import React, { useState } from "react";
import { styled } from "styled-components";
import { useKeycloak } from "@react-keycloak/web";
import { Alert, CircularProgress } from "@mui/material";

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f9f9f9;
`;

const Header = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #333;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 2rem;
`;

const StyledButton = styled.button`
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
  border: none;
  cursor: pointer;

  &:hover {
    background-color: #155a9b;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const AdminPanel: React.FC = () => {
  const { keycloak } = useKeycloak();
  const API_URL = process.env.REACT_APP_API_URL;

  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleEndElection = async () => {
    if (!keycloak.token) {
      setMessage({
        type: "error",
        text: "Fehler: Benutzer nicht authentifiziert.",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_URL}/end_election`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${keycloak.token}`,
        },
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Wahl erfolgreich beendet." });
      } else {
        const errorData = await response.json();
        setMessage({
          type: "error",
          text: errorData.message || "Fehler beim Beenden der Wahl.",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Netzwerkfehler. Bitte später erneut versuchen.",
      });
    } finally {
      setLoading(false);
    }
  };

  const userName = keycloak.tokenParsed?.given_name || "Admin";

  return (
    <PageContainer>
      <Header>
        <Title>Willkommen, {userName}!</Title>
      </Header>
      <ButtonContainer>
        <StyledButton
          onClick={() => (window.location.href = "/generate_token")}
        >
          Token generieren
          <span className="icon"> 🔑 </span>
        </StyledButton>
        <StyledButton onClick={handleEndElection} disabled={loading}>
          {loading ? (
            <CircularProgress size={24} style={{ color: "#fff" }} />
          ) : (
            <>
              <span className="icon">🗳️</span>
              Wahl beenden
            </>
          )}
        </StyledButton>
      </ButtonContainer>

      {message && (
        <Alert severity={message.type} style={{ marginTop: "1rem" }}>
          {message.text}
        </Alert>
      )}
    </PageContainer>
  );
};

export default AdminPanel;
