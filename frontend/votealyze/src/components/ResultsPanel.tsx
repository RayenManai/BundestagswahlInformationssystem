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
        <h2>National Results</h2>
      </ResultsPanelContainer>
    );
  } else if (type === "bundesland") {
    return (
      <ResultsPanelContainer>
        <h2>Bundesland Results</h2>
      </ResultsPanelContainer>
    );
  } else if (type === "wahlkreis") {
    return (
      <ResultsPanelContainer>
        <h2>Wahlkreis Results</h2>
      </ResultsPanelContainer>
    );
  }
  return <div>No data to display.</div>;
};

export default ResultsPanel;
