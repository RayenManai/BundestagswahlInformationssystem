import React, { useState, useEffect } from "react";
import styled from "styled-components";
import FilterPanel from "./FilterPanel";
import ResultsPanel from "./ResultsPanel";
import {
  PartyResult,
  PartyResultWK,
  Results,
  WahlkreisResult,
} from "../models/results";

const PageContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
`;

const ResultsPage: React.FC = () => {
  const [year, setYear] = useState<number>(2021);
  const [bundesland, setBundesland] = useState<string | null>(null);
  const [wahlkreis, setWahlkreis] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [dataType, setDataType] = useState<string>("global");

  // Fetch data based on the current filter settings
  const fetchData = async () => {
    let url = `/api/results?year=${year}`;
    if (bundesland) url += `&bundesland=${bundesland}`;
    if (wahlkreis) url += `&wahlkreis=${wahlkreis}`;

    try {
      const response = await fetch(url);
      const result = await response.json();

      if (wahlkreis) {
        const wahlkreisResults: WahlkreisResult = result;
        setData(wahlkreisResults);
        setDataType("wahlkreis");
      } else if (bundesland) {
        const regionalResults: Results = result;
        setData(regionalResults);
        setDataType("bundesland");
      } else {
        const nationalResults: Results = result;
        setData(nationalResults);
        setDataType("global");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setData([]);
    }
  };

  // Fetch default results on initial render and whenever filters change
  useEffect(() => {
    fetchData();
  }, [year, bundesland, wahlkreis]);

  return (
    <PageContainer>
      <FilterPanel
        year={year}
        bundesland={bundesland}
        wahlkreis={wahlkreis}
        setYear={setYear}
        setBundesland={setBundesland}
        setWahlkreis={setWahlkreis}
      />
      <ResultsPanel data={data} type={dataType} />
    </PageContainer>
  );
};

export default ResultsPage;
