import React from "react";
import styled from "styled-components";
import HorizontalBarChart from "./charts/HorizontalStackedBarChart";
import VerticalBarChart from "./charts/VerticalBarChart";

const ResultsPanelContainer = styled.div`
  flex: 1;
  padding: 1rem;
  max-height: 100%;
  background-color: #fff;
  border-left: 1px solid #ddd;
`;
interface ResultsPanelProps {
  data: any;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ data }) => {
  data = {
    "Partei A": { 2017: 200, 2021: 250 },
    "Partei B": { 2017: 150, 2021: 130 },
    "Partei C": { 2017: 180, 2021: 210 },
  };

  const years = [2017, 2021];
  const parties = ["Partei A", "Partei B", "Partei C"];

  return (
    <ResultsPanelContainer>
      <h2>Some Title</h2>
      <div>
        <VerticalBarChart data={data} years={years} parties={parties} />
        <VerticalBarChart data={data} years={years} parties={parties} />
      </div>
    </ResultsPanelContainer>
  );
};

export default ResultsPanel;
