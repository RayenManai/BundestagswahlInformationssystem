import React, { useState } from "react";
import styled from "styled-components";
import Footer from "./components/footer/Footer";
import ResultsPage from "./components/results/ResultsPage";
import StatisticsPage from "./components/statistics/StatisticsPage";
import Abgeordnete from "./components/abgeordnete/Abgeordnete";
import Header from "./components/header/Header";

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1rem;
`;

const pages: { [key: string]: React.ReactNode } = {
  Ergebnisse: <ResultsPage />,
  Statistiken: <StatisticsPage />,
  Abgeordnete: <Abgeordnete />,
};

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<string>("Ergebnisse");

  return (
    <PageContainer>
      <Header activePage={activePage} setActivePage={setActivePage} />
      <MainContent>{pages[activePage] || <ResultsPage />}</MainContent>
      <Footer />
    </PageContainer>
  );
};

export default App;
