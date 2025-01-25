import React, { useState } from "react";
import styled from "styled-components";
import {
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Button,
  SelectChangeEvent,
  CircularProgress,
  Alert,
} from "@mui/material";
import { BUNDESLAENDER } from "../../models/bundeslaender";
import { WAHLKREISE } from "../../models/wahlkreise";
import { useKeycloak } from "@react-keycloak/web";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 55vh;
  padding: 2rem;
  background-color: #f9f9f9;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 600px;
`;

const GenerateToken: React.FC = () => {
  const [bundesland, setBundesland] = useState<string | null>("");
  const [wahlkreis, setWahlkreis] = useState<string | null>("");
  const [ausweisnummer, setAusweisnummer] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.REACT_APP_API_URL;

  const filteredWahlkreise = bundesland
    ? WAHLKREISE[bundesland as keyof typeof WAHLKREISE] || []
    : [];

  const handleBundeslandChange = (event: SelectChangeEvent<string>) => {
    setBundesland(event.target.value as string);
    setWahlkreis("");
  };

  const handleWahlkreisChange = (event: SelectChangeEvent<string>) => {
    setWahlkreis(event.target.value);
  };
  const handleAusweisnummerChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setAusweisnummer(event.target.value);
  };

  const computeHash = async (input: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  };

  const { keycloak } = useKeycloak();

  const handleGenerateToken = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!wahlkreis || !ausweisnummer) {
      setError("Bitte Wahlkreis und Ausweisnummer ausfüllen.");
      return;
    }

    setLoading(true);
    setError(null);
    setToken(null);

    try {
      const hash = await computeHash(`${ausweisnummer}`);
      const token = keycloak?.token;

      if (!token) {
        setError("Fehler: Benutzer nicht authentifiziert.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ hash, wahlkreis }),
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
        sessionStorage.setItem(
          "wahlkreis",
          `${wahlkreis} - ${
            filteredWahlkreise
              .filter((kreis) => kreis.id === Number(wahlkreis))
              .at(0)?.name
          }`
        );
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Fehler beim Abrufen des Tokens.");
      }
    } catch (err) {
      setError("Netzwerkfehler. Bitte versuchen Sie es später erneut.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Form onSubmit={handleGenerateToken}>
        <FormControl fullWidth style={{ marginBottom: "1rem" }}>
          <InputLabel id="bundesland-label">Bundesland</InputLabel>
          <Select
            labelId="bundesland-label"
            id="bundesland"
            value={bundesland || ""}
            onChange={handleBundeslandChange}
            label="Bundesland"
          >
            <MenuItem value="">Alle</MenuItem>
            {BUNDESLAENDER.map((land) => (
              <MenuItem key={land.abbreviation} value={land.abbreviation}>
                {land.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Wahlkreis Dropdown, shown only when Bundesland is selected */}
        {
          <FormControl fullWidth style={{ marginBottom: "1rem" }}>
            <InputLabel id="wahlkreis-label">Wahlkreis</InputLabel>
            <Select
              labelId="wahlkreis-label"
              id="wahlkreis"
              value={wahlkreis || ""}
              onChange={handleWahlkreisChange}
              label="Wahlkreis"
            >
              <MenuItem value="">Alle</MenuItem>
              {filteredWahlkreise.map((kreis) => (
                <MenuItem key={kreis.id} value={kreis.id}>
                  {kreis.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        }
        <TextField
          label="Ausweisnummer"
          variant="outlined"
          type="text"
          value={ausweisnummer}
          onChange={handleAusweisnummerChange}
          fullWidth
          style={{ marginBottom: "1rem" }}
        />

        {loading ? (
          <CircularProgress style={{ marginBottom: "1rem" }} />
        ) : (
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            style={{ marginBottom: "1rem" }}
          >
            Token generieren
          </Button>
        )}

        {token && <Alert severity="success">Token: {token}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
      </Form>
    </Container>
  );
};

export default GenerateToken;
