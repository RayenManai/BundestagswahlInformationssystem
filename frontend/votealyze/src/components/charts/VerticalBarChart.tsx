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
      backgroundColor: year === 2021 ? "#2196F3" : "#FF5733", // Different colors for each year
      borderWidth: 1,
      barThickness: 60,
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
    <div style={{ width: "100%", height: "400px" }}>
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

export default VerticalBarChart;
