import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { styled } from "styled-components";

ChartJS.register(ArcElement, Tooltip, Legend);

const ChartContainer = styled.div`
  width: 100%; /* Full width */
  height: 300px; /* Set a fixed height or use min-height/max-height */
  max-width: 600px; /* Optional: Limit the maximum width */
  margin: 0 auto; /* Center the chart */
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
`;

interface HalfDoughnutChartProps {
  data: number[];
  labels: string[];
  colors: string[]; // Add colors as a prop
}

const HalfDoughnutChart: React.FC<HalfDoughnutChartProps> = ({
  data,
  labels,
  colors,
}) => {
  const chartData = {
    labels: labels,
    datasets: [
      {
        data: data,
        backgroundColor: colors, // Use the colors passed as a prop
        hoverOffset: 4,
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    circumference: 180,
    rotation: -90,
    cutout: "60%",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem: any) => {
            const percent = tooltipItem.raw.toFixed(2);
            return `${tooltipItem.label}: ${percent}%`;
          },
        },
      },
      legend: {
        position: "bottom" as const,
      },
    },
  };

  return (
    <ChartContainer>
      <Doughnut data={chartData} options={chartOptions} />
    </ChartContainer>
  );
};

export default HalfDoughnutChart;
