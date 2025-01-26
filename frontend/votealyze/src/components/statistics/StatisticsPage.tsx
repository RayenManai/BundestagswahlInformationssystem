import React, { useEffect, useState } from "react";
import styled from "styled-components";
import KnappsteSieger from "./KnappsteSieger";
import ScatterPlot from "./ScatterPlot";
import ScatterPlot2 from "./ScatterPlot2";
import { Statistik1, Statistik2, Statistik3 } from "../../models/results";
import Loader from "../loader";
import CustomSnackbar from "../utils/CustomSnackbar";

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

const StatLink = styled.div<{ selected: boolean }>`
  padding: 0.5rem;
  background-color: ${(props) => (props.selected ? "#d0e7ff" : "#e9e9ed")};
  color: ${(props) => (props.selected ? "#004085" : "#333")};
  border: ${(props) => (props.selected ? "2px solid #004085" : "none")};
  border-radius: 8px;
  cursor: pointer;
  font-weight: ${(props) => (props.selected ? "bold" : "normal")};
  &:hover {
    background-color: ${(props) => (props.selected ? "#c8ddff" : "#e1e1e1")};
  }
`;

const StatisticsPage: React.FC = () => {
  const [year, setYear] = useState<number>(2021);
  const [selectedStat, setSelectedStat] = useState<string | null>(
    "knappste Sieger"
  );
  const [statistikData, setStatistikData] = useState<Statistik1 | null>(null);
  const [scatterData1, setScatterData1] = useState<Statistik2[] | null>(null);
  const [scatterData2, setScatterData2] = useState<Statistik3[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const API_URL = process.env.REACT_APP_API_URL;

  const fetchStatistikData = async () => {
    try {
      setLoading(true);
      let url = "";
      if (selectedStat === "knappste Sieger") {
        url = `${API_URL}/api/q6?year=${year}`;
      } else if (selectedStat === "Age") {
        url = `${API_URL}/api/statistik2/${year}`;
      } else if (selectedStat === "PKW_elektro") {
        url = `${API_URL}/api/statistik3/`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (selectedStat === "knappste Sieger") {
        setStatistikData(data);
        setScatterData1(null);
      } else if (selectedStat === "Age") {
        setScatterData1(data);
        setStatistikData(null);
      } else if (selectedStat === "PKW_elektro") {
        setScatterData2(data);
        setScatterData1(null);
        setStatistikData(null);
      }
    } catch (error) {
      console.error("Error fetching statistik data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistikData();
  }, [year, selectedStat]);

  const renderSelectedStat = () => {
    if (loading) {
      return <Loader />;
    }
    if (selectedStat === "knappste Sieger" && statistikData) {
      return <KnappsteSieger data={statistikData} />;
    }
    if (selectedStat === "Age" && scatterData1) {
      return <ScatterPlot data={scatterData1} />;
    }
    if (selectedStat === "PKW_elektro") {
      if (year == 2017) {
        return (
          <CustomSnackbar
            backgroundColor={"#ff656c"}
            color={"white"}
            message="Keine Daten vorhanden"
          />
        );
      } else if (scatterData2) {
        return <ScatterPlot2 data={scatterData2} />;
      }
    }
    return (
      <CustomSnackbar
        backgroundColor={"#ff656c"}
        color={"white"}
        message="Keine Daten vorhanden"
      />
    );
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
        <StatLink
          selected={selectedStat === "knappste Sieger"}
          onClick={() => setSelectedStat("knappste Sieger")}
        >
          Knappste Sieger
        </StatLink>
        <StatLink
          selected={selectedStat === "Age"}
          onClick={() => setSelectedStat("Age")}
        >
          Politische Richtung vs. Durchschnittsalter der Wahlkreise
        </StatLink>
        <StatLink
          selected={selectedStat === "PKW_elektro"}
          onClick={() => setSelectedStat("PKW_elektro")}
        >
          Verhältnis von GRÜNEN-Zweitstimmen zu Elektro-/Hybrid-PKWs
        </StatLink>
      </Sidebar>
      <ContentArea>{renderSelectedStat()}</ContentArea>
    </PageContainer>
  );
};

export default StatisticsPage;
