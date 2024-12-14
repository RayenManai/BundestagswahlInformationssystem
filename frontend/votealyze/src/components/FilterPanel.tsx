import React, { useState } from "react";
import styled from "styled-components";
import { BUNDESLAENDER } from "../models/bundeslaender";
import { WAHLKREISE } from "../models/wahlkreise";

const FilterPanelContainer = styled.div`
  width: 25%;
  padding: 1rem;
  background-color: rgba(202, 221, 255, 0.8);
  border-right: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1rem;
  text-align: center;
`;

const Label = styled.label`
  display: flex;
  flex-direction: column;
  width: 100%;
  text-align: left;
  font-size: 1rem;
  gap: 0.5rem;
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  width: 100%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

interface FilterPanelProps {
  year: number;
  bundesland: string | null;
  wahlkreis: string | null;
  setYear: React.Dispatch<React.SetStateAction<number>>;
  setBundesland: React.Dispatch<React.SetStateAction<string | null>>;
  setWahlkreis: React.Dispatch<React.SetStateAction<string | null>>;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  year,
  bundesland,
  wahlkreis,
  setYear,
  setBundesland,
  setWahlkreis,
}) => {
  const [filteredWahlkreise, setFilteredWahlkreise] = useState<
    { id: number; name: string }[]
  >([]);

  // This function updates the Wahlkreis options based on the selected Bundesland
  const handleBundeslandChange = (value: string | null) => {
    setBundesland(value);
    if (value) {
      // Get the Wahlkreise for the selected Bundesland
      const kreise = WAHLKREISE[value as keyof typeof WAHLKREISE] || [];
      setFilteredWahlkreise(kreise);
    } else {
      setFilteredWahlkreise([]); // Reset Wahlkreise if no Bundesland is selected
    }
    setWahlkreis(null); // Reset Wahlkreis when Bundesland changes
  };
  return (
    <FilterPanelContainer>
      <Title>Bundestagswahl {year}</Title>
      <Label>
        Jahr:
        <Select value={year} onChange={(e) => setYear(Number(e.target.value))}>
          <option value={2021}>2021</option>
          <option value={2017}>2017</option>
        </Select>
      </Label>
      <Label>
        Bundesland:
        <Select
          value={bundesland || ""}
          onChange={(e) => handleBundeslandChange(e.target.value || null)}
        >
          <option value="">Alle</option>
          {BUNDESLAENDER.map((land) => (
            <option key={land.abbreviation} value={land.abbreviation}>
              {land.name}
            </option>
          ))}
        </Select>
      </Label>
      {bundesland && (
        <Label>
          Wahlkreis:
          <Select
            value={wahlkreis || ""}
            onChange={(e) => setWahlkreis(e.target.value || null)}
          >
            <option value="">Alle</option>
            {filteredWahlkreise.map((kreis) => (
              <option key={kreis.id} value={kreis.id}>
                {kreis.name}
              </option>
            ))}
          </Select>
        </Label>
      )}
    </FilterPanelContainer>
  );
};

export default FilterPanel;
