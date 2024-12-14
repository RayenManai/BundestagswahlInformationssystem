import React from "react";
import styled from "styled-components";

const ResultsPanelContainer = styled.div`
  flex: 1;
  padding: 1rem;
  max-height: 100%;
  background-color: #fff;
  border-left: 1px solid #ddd;
`;

interface ResultsPanelProps {
  data: any;
  type: string; // The type of data (e.g., "global", "bundesland")
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ data, type }) => {
  if (type === "global") {
    return (
      <ResultsPanelContainer>
        <h2>Sitzverteilung</h2>

        <h2>Wahlbeteiligung</h2>

        <h2>Erststimmen</h2>

        <h2>Zweitstimmen</h2>

        <h2>Mögliche Koalitionen</h2>
      </ResultsPanelContainer>
    );
  } else if (type === "bundesland") {
    return (
      <ResultsPanelContainer>
        <h2>Wahlbeteiligung</h2>

        <h2>Erststimmen</h2>

        <h2>Zweitstimmen</h2>
      </ResultsPanelContainer>
    );
  } else if (type === "wahlkreis") {
    return (
      <ResultsPanelContainer>
        <h2>Direktmandat</h2>

        <h2>Wahlbeteiligung</h2>

        <h2>Erststimmen</h2>

        <h2>Zweitstimmen</h2>
      </ResultsPanelContainer>
    );
  }
  return <div>No data to display.</div>;
};

export default ResultsPanel;
