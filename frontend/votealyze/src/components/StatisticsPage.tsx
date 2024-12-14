import React, { useState } from "react";
import styled from "styled-components";

const PageContainer = styled.div`
  display: flex;
  flex: 1;
  height: 100vh;
`;

const Sidebar = styled.div`
  width: 350px;
  background-color: rgba(202, 221, 255, 0.8);
  padding: 1rem;
  border-right: 1px solid #ddd;
  overflow-y: auto;
  max-height: 80vh;
  text-align: center;
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 1rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const StatLink = styled.div`
  margin: 1rem 0;
  padding: 0.5rem;
  background-color: #f1f1f1;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #e1e1e1;
  }
`;

const KnappesteSieger: React.FC = () => {
  return <div>Details about the "Knappeste Sieger" statistic...</div>;
};

const GroessteDifferenz: React.FC = () => {
  return <div>Details about the "Groesste Differenz" statistic...</div>;
};

const MeisteStimmen: React.FC = () => {
  return <div>Details about the "Meiste Stimmen" statistic...</div>;
};

const StatisticsPage: React.FC = () => {
  // State to manage selected statistic and toggle the sidebar visibility
  const [selectedStat, setSelectedStat] = useState<string | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // Functions to handle toggling the sidebar and selecting a statistic
  const handleStatSelect = (stat: string) => {
    setSelectedStat(stat);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  // Render the correct component based on selected statistic
  const renderSelectedStat = () => {
    switch (selectedStat) {
      case "knappeste Sieger":
        return <KnappesteSieger />;
      case "größte Differenz":
        return <GroessteDifferenz />;
      case "meiste Stimmen":
        return <MeisteStimmen />;
      default:
        return <div>Wählen Sie eine Statistik aus dem Menü aus.</div>;
    }
  };

  return (
    <PageContainer>
      <Sidebar>
        <StatLink onClick={() => handleStatSelect("knappeste Sieger")}>
          Knappeste Sieger
        </StatLink>
        <StatLink onClick={() => handleStatSelect("größte Differenz")}>
          Größte Differenz
        </StatLink>
        <StatLink onClick={() => handleStatSelect("meiste Stimmen")}>
          Meiste Stimmen
        </StatLink>
      </Sidebar>

      <ContentArea>
        <Title>Interessante Statistiken</Title>
        {renderSelectedStat()}
      </ContentArea>
    </PageContainer>
  );
};

export default StatisticsPage;
