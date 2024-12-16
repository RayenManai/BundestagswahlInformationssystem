import React from "react";
import styled from "styled-components";
import { COALITIONS, Results, WahlkreisResult } from "../models/results";
import HalfDoughnutChart from "./charts/HalfDoughnutChart";
import { PARTEI_FARBE } from "../models/parteien_politische_farben";
import HorizontalStackedBarChart from "./charts/HorizontalStackedBarChart";

const ResultsPanelContainer = styled.div`
  flex: 1;
  padding: 1rem;
  max-height: 100%;
  background-color: #fff;
  border-left: 1px solid #ddd;
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
    text-align: left;
    border-bottom: 1px solid #ddd;
  }

  th {
    background-color: #f4f4f4;
  }

  tr:hover {
    background-color: #f1f1f1;
  }
`;

interface ResultsPanelProps {
  data: Results | WahlkreisResult;
  type: string; // The type of data (e.g., "global", "bundesland")
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ data, type }) => {
  if (!data) {
    return <div>Loading or no data available...</div>;
  }
  if (type === "global") {
    const partyResults: any[] = data.partiesResults;
    const wahlBeteiligung = (data.wahlbeteiligte / data.wahlberechtigte) * 100;
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
        <h2>Sitzverteilung</h2>
        <HalfDoughnutChart
          data={seats}
          labels={parties}
          colors={backgroundColor}
        />
        <TableContainer>
          <table>
            <thead>
              <tr>
                <th>Partei</th>
                <th>Sitze</th>
                {oldPartyResults.length > 0 && (
                  <th>Differenz zu Vorwahl</th>
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
                    ? result.seats - oldResult.seats
                    : result.seats;
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
        <h2>Wahlbeteiligung</h2>
        {wahlBeteiligung} %<h2>Erststimmen</h2>
        <h2>Zweitstimmen</h2>
        <h2>Mögliche Koalitionen</h2>
        <HorizontalStackedBarChart
          data={coalitionData}
          parties={parties}
          totalSeats={totalSeats}
          labels={labels}
        />
      </ResultsPanelContainer>
    );
  } else if (type === "bundesland") {
    return (
      <ResultsPanelContainer>
        <h2>Wahlbeteiligung</h2>

        <h2>Erststimmen</h2>

        <h2>Zweitstimmen</h2>
      </ResultsPanelContainer>
    );
  } else if (type === "wahlkreis") {
    return (
      <ResultsPanelContainer>
        <h2>Direktmandat</h2>

        <h2>Wahlbeteiligung</h2>

        <h2>Erststimmen</h2>

        <h2>Zweitstimmen</h2>
      </ResultsPanelContainer>
    );
  }
  return <div>No data to display.</div>;
};

export default ResultsPanel;
