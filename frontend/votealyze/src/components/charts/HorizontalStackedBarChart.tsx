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

interface HorizontalStackedBarChartProps {
  data: Array<{ [key: string]: number }>; // Array of objects with party names and their values for each row
  parties: string[]; // Array of party names
}

const HorizontalStackedBarChart: React.FC<HorizontalStackedBarChartProps> = ({
  data,
  parties,
}) => {
  const colors = parties.map((_, index) => {
    const colorsList = [
      "#FF5733",
      "#33FF57",
      "#3357FF",
      "#FF33A1",
      "#FFCD33",
      "#9C27B0",
      "#2196F3",
    ];
    return colorsList[index % colorsList.length];
  });

  const chartData = {
    labels: data.map((_, index) => `Koalition ${index + 1}`),
    datasets: parties.map((party, partyIndex) => ({
      label: party,
      data: data.map((row) => row[party] || 0),
      backgroundColor: colors[partyIndex],
      barThickness: 60,
      stack: "stack1",
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
        position: "top" as const,
      },
    },
    indexAxis: "y" as const,
    scales: {
      y: {
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
