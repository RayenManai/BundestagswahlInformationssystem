import React from "react";
import styled from "styled-components";
import {
  Abgeordneter,
  COALITIONS,
  PartyResult,
  Results,
  WahlkreisResult,
} from "../../models/results";
import HalfDoughnutChart from "../charts/HalfDoughnutChart";
import { PARTEI_FARBE } from "../../models/parteien_politische_farben";
import HorizontalStackedBarChart from "../charts/HorizontalStackedBarChart";
import VerticalBarChart from "../charts/VerticalBarChart";
import { Doughnut } from "react-chartjs-2";
import Loader from "../loader";
import CustomSnackbar from "../utils/CustomSnackbar";
import { useTranslation } from "react-i18next";

const ResultsPanelContainer = styled.div`
  flex: 1;
  padding: 1rem;
  max-height: 100%;
  background-color: #fff;
  border-left: 1px solid #ddd;
`;

const ResultContainer = styled.div`
  flex: 1;
  padding: 1rem;
  max-height: 100%;
  background-color: #fff;
  border: 1px solid #ddd;
  margin-bottom: 1rem;
  text-align: center;
`;

const TableContainer = styled.div`
  margin-top: 20px;
  table {
    width: 30%;
    border-collapse: collapse;
    margin: 0 auto;
  }

  th,
  td {
    padding: 10px;
    border-bottom: 1px solid #ddd;
  }

  th {
    background-color: #f4f4f4;
  }

  tr:hover {
    background-color: #f1f1f1;
  }
`;

const Summary = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  margin-top: 1rem;
`;

const InfoBox = styled.div`
  text-align: center;
  background-color: #f9f9f9;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Label1 = styled.p`
  font-size: 1rem;
  color: #555;
  margin: 0;
`;

const Value1 = styled.h3`
  font-size: 1.5rem;
  color: #333;
  margin: 0;
`;

const DirektmandatCard = styled.div`
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 16px;
  background-color: #f9f9f9;
  max-width: 400px;
  margin: 16px auto;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const InfoRow = styled.div`
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
`;

const Label = styled.span`
  font-weight: bold;
  color: #555;
`;

const Value = styled.span`
  color: #222;
`;

interface ResultsPanelProps {
  data: Results | WahlkreisResult;
  type: string; // The type of data (e.g., "global", "bundesland")
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ data, type }) => {
  const { t } = useTranslation();
  //TODO: look for a better way to do this
  if (!data) {
    return <Loader />;
  }
  if (Array.isArray(data) && data.length === 0) {
    return (
      <CustomSnackbar
        backgroundColor={"#ff656c"}
        color={"white"}
        message="Fehler beim Laden, bitte später erneut versuchen"
      />
    );
  }
  //
  const wahlBeteiligung = (
    (data.wahlbeteiligte / data.wahlberechtigte) *
    100
  ).toFixed(2);

  const chartData = {
    labels: [t("Wahlbeteiligte"), t("Nicht-Teilgenommen")],
    datasets: [
      {
        data: [data.wahlbeteiligte, data.wahlberechtigte - data.wahlbeteiligte],
        backgroundColor: ["#4caf50", "#f44336"],
        hoverBackgroundColor: ["#45a049", "#e53935"],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    cutout: "70%",
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem: any) => {
            const value = tooltipItem.raw;
            return `${value.toLocaleString()}`;
          },
        },
      },
    },
  };

  // Prepare Erststimmen and Zweitstimmen data
  const prepareVoteData = (
    voteType: "firstVotes" | "secondVotes",
    partyResults: PartyResult[],
    oldPartyResults: PartyResult[]
  ) => {
    const years: number[] = oldPartyResults.length > 0 ? [2021, 2017] : [2017];
    const data: any = {};

    partyResults.forEach((party) => {
      const oldResult = oldPartyResults.find((old) => old.id === party.id);
      const currentVotes = party[voteType];
      const oldVotes = oldResult?.[voteType];
      const percentageChange = oldVotes
        ? ((currentVotes - oldVotes) / oldVotes) * 100
        : null;

      data[party.id] = {
        [years[0]]: {
          value: currentVotes,
          percentageChange,
        },
        ...(oldResult && {
          [years[1]]: { value: oldVotes },
        }),
      };
    });

    return { data, years };
  };

  if (type === "global") {
    const partyResults: any[] = data.partiesResults;

    const oldPartyResults: any[] = data.partiesOldResults || [];
    const totalSeats = partyResults.reduce(
      (sum, party) => sum + party.seats,
      0
    );

    const parties = partyResults.map((result) => result.id);
    const seats = partyResults.map((result) => result.seats);

    const backgroundColor = parties.map((party) => {
      const partyColor = PARTEI_FARBE.find((p) => p.id === party);
      return partyColor ? partyColor.color : "#000000"; // Default
    });

    const { data: erststimmenData, years: erststimmenYears } = prepareVoteData(
      "firstVotes",
      partyResults,
      oldPartyResults
    );

    const { data: zweitstimmenData, years: zweitstimmenYears } =
      prepareVoteData("secondVotes", partyResults, oldPartyResults);

    const prepareCoalitionData = (
      partyResults: any[],
      predefinedCoalitions: any[]
    ) => {
      const coalitionData = predefinedCoalitions.map((coalition) => {
        const row: { [key: string]: number } = {};
        coalition.parties.forEach((party: string) => {
          row[party] = partyResults.find((p) => p.id === party)?.seats || 0;
        });
        return row;
      });
      const labels = predefinedCoalitions.map((coalition) => coalition.name);
      return { coalitionData, labels };
    };
    const { coalitionData: coalitionData, labels: labels } =
      prepareCoalitionData(partyResults, COALITIONS);

    return (
      <ResultsPanelContainer>
        <ResultContainer>
          <h2>{t("Sitzverteilung")}</h2>{" "}
          <HalfDoughnutChart
            data={seats}
            labels={parties}
            colors={backgroundColor}
          />
          <TableContainer>
            <table>
              <thead>
                <tr>
                  <th>{t("Partei")}</th>
                  <th>{t("Sitze")}</th>
                  {oldPartyResults.length > 0 && (
                    <th>{t("Differenz zu Vorwahl")}</th>
                  )}{" "}
                  {/* Show only if old results exist */}
                </tr>
              </thead>
              <tbody>
                {partyResults.map((result, index) => {
                  const seatDifferences = parties.map((party) => {
                    const oldResult = oldPartyResults.find(
                      (oldResult) => oldResult.id === party
                    );
                    return oldResult
                      ? result.seats - oldResult.seats > 0
                        ? "+ " + (result.seats - oldResult.seats)
                        : "- " + (oldResult.seats - result.seats)
                      : "+ " + result.seats;
                  });
                  return (
                    <tr key={result.id}>
                      <td>{result.id}</td>
                      <td>{result.seats}</td>
                      {oldPartyResults.length > 0 && (
                        <td>{seatDifferences[index]}</td>
                      )}{" "}
                      {/* Only show difference column if old results exist */}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableContainer>
        </ResultContainer>
        <ResultContainer>
          <h2>{t("Wahlbeteiligung")}</h2>{" "}
          <div style={{ width: "200px", margin: "0 auto" }}>
            <Doughnut data={chartData} options={chartOptions} />
            <div
              style={{
                position: "relative",
                top: "-90px",
                textAlign: "center",
                fontSize: "1.2rem",
                fontWeight: "bold",
              }}
            >
              {wahlBeteiligung}%
            </div>
          </div>
          <Summary>
            <InfoBox>
              <Label1>{t("Wahlberechtigte")}</Label1>
              <Value1>{data.wahlberechtigte.toLocaleString()}</Value1>
            </InfoBox>
            <InfoBox>
              <Label1>{t("Wahlbeteiligte")}</Label1>
              <Value1>{data.wahlbeteiligte.toLocaleString()}</Value1>
            </InfoBox>
          </Summary>
        </ResultContainer>
        <ResultContainer>
          <h2>{t("Erststimmen")}</h2>{" "}
          <VerticalBarChart
            data={erststimmenData}
            years={erststimmenYears}
            parties={parties}
          />
        </ResultContainer>
        <ResultContainer>
          <h2>{t("Zweitstimmen")}</h2>{" "}
          <VerticalBarChart
            data={zweitstimmenData}
            years={zweitstimmenYears}
            parties={parties}
          />
        </ResultContainer>
        <ResultContainer>
          <h2>{t("Mögliche Koalitionen")}</h2>{" "}
          <HorizontalStackedBarChart
            data={coalitionData}
            parties={parties}
            totalSeats={totalSeats}
            labels={labels}
          />
        </ResultContainer>
      </ResultsPanelContainer>
    );
  } else if (type === "bundesland") {
    const partyResults: any[] = data.partiesResults;
    const oldPartyResults: any[] = data.partiesOldResults || [];

    const parties = partyResults.map((result) => result.id);

    const { data: erststimmenData, years: erststimmenYears } = prepareVoteData(
      "firstVotes",
      partyResults,
      oldPartyResults
    );

    const { data: zweitstimmenData, years: zweitstimmenYears } =
      prepareVoteData("secondVotes", partyResults, oldPartyResults);

    return (
      <ResultsPanelContainer>
        <ResultContainer>
          <h2>{t("Wahlbeteiligung")}</h2>
          <div style={{ width: "200px", margin: "0 auto" }}>
            <Doughnut data={chartData} options={chartOptions} />
            <div
              style={{
                position: "relative",
                top: "-90px",
                textAlign: "center",
                fontSize: "1.2rem",
                fontWeight: "bold",
              }}
            >
              {wahlBeteiligung}%
            </div>
          </div>
          <Summary>
            <InfoBox>
              <Label1>{t("Wahlberechtigte")}</Label1>
              <Value1>{data.wahlberechtigte.toLocaleString()}</Value1>
            </InfoBox>
            <InfoBox>
              <Label1>{t("Wahlbeteiligte")}</Label1>
              <Value1>{data.wahlbeteiligte.toLocaleString()}</Value1>
            </InfoBox>
          </Summary>
        </ResultContainer>
        <ResultContainer>
          <h2>{t("Erststimmen")}</h2>
          <VerticalBarChart
            data={erststimmenData}
            years={erststimmenYears}
            parties={parties}
          />
        </ResultContainer>
        <ResultContainer>
          <h2>{t("Zweitstimmen")}</h2>
          <VerticalBarChart
            data={zweitstimmenData}
            years={zweitstimmenYears}
            parties={parties}
          />
        </ResultContainer>
      </ResultsPanelContainer>
    );
  } else if (type === "wahlkreis") {
    const partyResults: any[] = data.partiesResults;
    const oldPartyResults: any[] = data.partiesOldResults || [];
    const direktMandat: Abgeordneter = (data as WahlkreisResult).direktKandidat;

    const parties = partyResults.map((result) => result.id);

    const { data: erststimmenData, years: erststimmenYears } = prepareVoteData(
      "firstVotes",
      partyResults,
      oldPartyResults
    );

    const { data: zweitstimmenData, years: zweitstimmenYears } =
      prepareVoteData("secondVotes", partyResults, oldPartyResults);
    return (
      <ResultsPanelContainer>
        <ResultContainer>
          <h2>{t("Direktmandat")}</h2>
          <DirektmandatCard>
            <InfoRow>
              <Label>{t("Name")}:</Label>
              <Value>{direktMandat.name}</Value>
            </InfoRow>
            <InfoRow>
              <Label>{t("Partei")}:</Label>
              <Value>{direktMandat.party}</Value>
            </InfoRow>
          </DirektmandatCard>
        </ResultContainer>
        <ResultContainer>
          <h2>{t("Wahlbeteiligung")}</h2>
          <div style={{ width: "200px", margin: "0 auto" }}>
            <Doughnut data={chartData} options={chartOptions} />
            <div
              style={{
                position: "relative",
                top: "-90px",
                textAlign: "center",
                fontSize: "1.2rem",
                fontWeight: "bold",
              }}
            >
              {wahlBeteiligung}%
            </div>
          </div>
          <Summary>
            <InfoBox>
              <Label1>{t("Wahlberechtigte")}</Label1>
              <Value1>{data.wahlberechtigte.toLocaleString()}</Value1>
            </InfoBox>
            <InfoBox>
              <Label1>{t("Wahlbeteiligte")}</Label1>
              <Value1>{data.wahlbeteiligte.toLocaleString()}</Value1>
            </InfoBox>
          </Summary>
        </ResultContainer>
        <ResultContainer>
          <h2>{t("Erststimmen")}</h2>
          <VerticalBarChart
            data={erststimmenData}
            years={erststimmenYears}
            parties={parties}
          />
        </ResultContainer>
        <ResultContainer>
          <h2>{t("Zweitstimmen")}</h2>
          <VerticalBarChart
            data={zweitstimmenData}
            years={zweitstimmenYears}
            parties={parties}
          />
        </ResultContainer>
      </ResultsPanelContainer>
    );
  }
  return <div>No data to display.</div>;
};

export default ResultsPanel;
