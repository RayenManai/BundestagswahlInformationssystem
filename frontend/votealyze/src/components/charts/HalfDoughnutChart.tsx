import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface HalfDoughnutChartProps {
  data: number[];
  labels: string[];
}

const HalfDoughnutChart: React.FC<HalfDoughnutChartProps> = ({
  data,
  labels,
}) => {
  const chartData = {
    labels: labels,
    datasets: [
      {
        data: data,
        backgroundColor: [
          "rgba(169, 244, 208, 0.70)",
          "rgba(219, 174, 255, 0.70)",
          "rgba(253, 208, 159, 0.70)",
          "#FF33A1",
          "#FFCD33",
        ],
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

  return <Doughnut data={chartData} options={chartOptions} />;
};

export default HalfDoughnutChart;
