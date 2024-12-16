import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Statistik1 } from "../../models/results";
import KnappsteSieger from "./KnappsteSieger";

const PageContainer = styled.div`
  display: flex;
  flex: 1;
  height: 100vh;
`;

const Sidebar = styled.div`
  width: 25%;
  padding: 1rem;
  background-color: rgba(202, 221, 255, 0.8);
  border-right: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  text-align: center;
  gap: 1.5rem;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
`;

const FilterPanelContainer = styled.div`
  width: 100%;
  margin: 0 auto 1rem;
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

const ContentArea = styled.div`
  flex: 1;
  padding: 1rem;
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

const StatisticsPage: React.FC = () => {
  const [year, setYear] = useState<number>(2021);
  const [selectedStat, setSelectedStat] = useState<string | null>(
    "knappste Sieger"
  );
  const [statistikData, setStatistikData] = useState<Statistik1 | null>(null);

  const fetchStatistikData = async () => {
    try {
      const response = await fetch(`/api/q6?year=${year}`);
      const data: Statistik1 = await response.json();
      setStatistikData(data);
    } catch (error) {
      console.error("Error fetching Statistik1 data:", error);
      setStatistikData(null);
    }
  };

  useEffect(() => {
    if (selectedStat === "knappste Sieger") {
      fetchStatistikData();
    }
  }, [year, selectedStat]);

  const renderSelectedStat = () => {
    if (!statistikData) return <div>Keine Daten verfügbar.</div>;

    switch (selectedStat) {
      case "knappste Sieger":
        return <KnappsteSieger data={statistikData} />;
      default:
        return <div>Wählen Sie eine Statistik aus dem Menü aus.</div>;
    }
  };

  return (
    <PageContainer>
      <Sidebar>
        <FilterPanelContainer>
          <Title>Bundestagswahl {year}</Title>
          <Label>
            Jahr:
            <Select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              <option value={2021}>2021</option>
              <option value={2017}>2017</option>
            </Select>
          </Label>
        </FilterPanelContainer>
        <StatLink onClick={() => setSelectedStat("knappste Sieger")}>
          Knappste Sieger
        </StatLink>
      </Sidebar>
      <ContentArea>{renderSelectedStat()}</ContentArea>
    </PageContainer>
  );
};

export default StatisticsPage;
