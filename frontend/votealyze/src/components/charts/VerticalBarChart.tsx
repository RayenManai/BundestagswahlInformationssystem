import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { PARTEI_FARBE } from "../../models/parteien_politische_farben";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface VerticalBarChartProps {
  data: {
    [key: string]: {
      [year: number]: { value: number; percentageChange?: number };
    };
  };
  years: number[];
  parties: string[];
}

const VerticalBarChart: React.FC<VerticalBarChartProps> = ({
  data,
  years,
  parties,
}) => {
  const chartData = {
    labels: parties,
    datasets: years.map((year) => ({
      label: `${year}`,
      data: parties.map((party) => data[party]?.[year]?.value || 0),
      backgroundColor: parties.map((party: string) => {
        const partyColor = PARTEI_FARBE.find((p) => p.id === party);
        return partyColor
          ? year === 2021
            ? partyColor.color
            : partyColor.color + "B3"
          : "#000000";
      }),
      borderWidth: 1,
      barThickness: 40,
    })),
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem: any) => {
            const party = parties[tooltipItem.dataIndex];
            const value = tooltipItem.raw;
            const percentageChange =
              years[tooltipItem.datasetIndex] === 2021
                ? data[party]?.[2021]?.percentageChange
                : null;
            const percentageChangeText = percentageChange
              ? ` (${percentageChange > 0 ? "+" : ""}${percentageChange.toFixed(
                  1
                )}%)`
              : "";
            return `${tooltipItem.dataset.label}: ${value}${percentageChangeText}`;
          },
        },
      },
      legend: {
        position: "bottom" as const,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => `${value}`,
        },
      },
    },
  };

  return (
    <div
      style={{
        width: "60%",
        height: "400px",
        margin: "0 auto",
        position: "relative",
      }}
    >
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

export default VerticalBarChart;
