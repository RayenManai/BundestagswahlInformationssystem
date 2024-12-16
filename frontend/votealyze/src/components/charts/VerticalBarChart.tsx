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
  data: { [key: string]: { [year: number]: number } }; // { partyName: { year: value } }
  years: number[];
  parties: string[];
}

const VerticalBarChart: React.FC<VerticalBarChartProps> = ({
  data,
  years,
  parties,
}) => {
  const chartData = {
    labels: parties, // Party names as labels (x-axis)
    datasets: years.map((year) => ({
      label: `${year}`,
      data: parties.map((party) => data[party]?.[year] || 0),
      backgroundColor: parties.map((party: string) => {
        const partyColor = PARTEI_FARBE.find((p) => p.id === party);
        return partyColor
          ? year === 2021
            ? partyColor.color
            : partyColor.color + "B3" //Hexadecimal color code for transparency 70%
          : "#000000";
      }), // Default
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
            return `${tooltipItem.dataset.label}: ${tooltipItem.raw}`;
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
      },
    },
  };

  return (
    <div style={{ width: "60%", height: "400px", margin: "0 auto" }}>
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

export default VerticalBarChart;
