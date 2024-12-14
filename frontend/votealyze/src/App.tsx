import React, { useState } from "react";
import styled from "styled-components";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ResultsPage from "./components/ResultsPage";
import StatisticsPage from "./components/StatisticsPage";
import Abgeordnete from "./components/Abgeordnete";

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
