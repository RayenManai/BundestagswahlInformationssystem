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
import annotationPlugin from "chartjs-plugin-annotation"; // Import the annotation plugin

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  annotationPlugin
);

interface HorizontalStackedBarChartProps {
  data: Array<{ [key: string]: number }>; // Array of objects with party names and their values for each row
  parties: string[]; // Array of party names
  totalSeats: number;
  labels: string[]; // Coalition names
}

const HorizontalStackedBarChart: React.FC<HorizontalStackedBarChartProps> = ({
  data,
  parties,
  totalSeats,
  labels,
}) => {
  const colors = parties.map((party: string) => {
    const partyColor = PARTEI_FARBE.find((p) => p.id === party);
    return partyColor ? partyColor.color : "#000000"; // Default
  });

  const chartData = {
    labels: labels,
    datasets: parties.map((party, partyIndex) => ({
      label: party,
      data: data.map((row) => row[party] || 0),
      backgroundColor: colors[partyIndex],
      barThickness: 40,
      stack: "stack1",
    })),
  };
  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem: any) => {
            return `${tooltipItem.dataset.label}: ${tooltipItem.raw}`;
          },
        },
      },
      legend: {
        position: "bottom" as const,
      },
      annotation: {
        annotations: {
          line: {
            type: "line" as const,
            xMin: totalSeats / 2, // Position the line at totalSeats / 2
            xMax: totalSeats / 2,
            borderColor: "rgba(0, 0, 0, 0.5)",
            borderWidth: 2,
          },
        },
      },
    },
    indexAxis: "y" as const,
    scales: {
      y: {
        beginAtZero: true,
        stacked: true,
      },
      x: {
        beginAtZero: true,
        stacked: true,
      },
    },
  };

  return (
    <div style={{ width: "100%", height: "400px" }}>
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

export default HorizontalStackedBarChart;
