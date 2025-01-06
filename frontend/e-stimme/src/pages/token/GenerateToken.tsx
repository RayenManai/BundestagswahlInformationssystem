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
} from "@mui/material";
import { BUNDESLAENDER } from "../../models/bundeslaender";
import { WAHLKREISE } from "../../models/wahlkreise";

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

  const handleGenerateToken = (event: React.FormEvent) => {
    event.preventDefault();
    // Handle token generation logic
    console.log(
      "Token generated for Wahlkreis:",
      wahlkreis,
      "and Ausweisnummer:",
      ausweisnummer
    );
  };

  return (
    <Container>
      <Form>
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

        {/* Generate Token Button */}
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Token generieren
        </Button>
      </Form>
    </Container>
  );
};

export default GenerateToken;
