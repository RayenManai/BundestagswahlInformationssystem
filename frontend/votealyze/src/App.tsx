import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Header from "./components/Header";
import Footer from "./components/Footer";
import FilterPanel from "./components/FilterPanel";
import ResultsPanel from "./components/ResultsPanel";

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  padding: 1rem;
`;

const App: React.FC = () => {
  const [year, setYear] = useState<number>(2021);
  const [bundesland, setBundesland] = useState<string | null>(null);
  const [wahlkreis, setWahlkreis] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  // Fetch data based on the current filter settings
  const fetchData = async () => {
    let url = `/api/results?year=${year}`;
    if (bundesland) url += `&bundesland=${bundesland}`;
    if (wahlkreis) url += `&wahlkreis=${wahlkreis}`;

    try {
      const response = await fetch(url);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching data:", error);
      setData([]); // Clear data on error
    }
  };

  // Fetch default results on initial render and whenever filters change
  useEffect(() => {
    fetchData();
  }, [year, bundesland, wahlkreis]);

  return (
    <PageContainer>
      <Header />
      <MainContent>
        <FilterPanel
          year={year}
          bundesland={bundesland}
          wahlkreis={wahlkreis}
          setYear={setYear}
          setBundesland={setBundesland}
          setWahlkreis={setWahlkreis}
        />
        <ResultsPanel data={data} />
      </MainContent>
      <Footer />
    </PageContainer>
  );
};

export default App;
