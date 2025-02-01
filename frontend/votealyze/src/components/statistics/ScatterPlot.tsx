import React, { useEffect, useState } from "react";
import { Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  LineController,
} from "chart.js";
import { WAHLKREISE } from "../../models/wahlkreise";
import { Statistik2 } from "../../models/results";
import { useTranslation } from "react-i18next";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend
);

interface ScatterPlotProps {
  data: Statistik2[];
}

const ScatterPlot: React.FC<ScatterPlotProps> = ({ data }) => {
  const [scatterData, setScatterData] = useState<any>(null);
  const { t } = useTranslation();

  //maybe useful for x-axis?
  const directionMap: { [key: string]: number } = {
    Links: 0,
    "Mitte-links": 1,
    Mitte: 2,
    "Mitte-rechts": 3,
    Rechts: 4,
  };

  useEffect(() => {
    if (data) {
      const xData: number[] = [];
      const yData: number[] = [];
      const wahlkreisIds: number[] = [];

      data.forEach((item: any) => {
        xData.push(item.weighted_direction);
        yData.push(item.weighted_age);
        wahlkreisIds.push(item.wahlkreisId);
      });

      const calculateRegression = (x: any[], y: any[]) => {
        const n = x.length;
        const sumX = x.reduce((a: any, b: any) => a + b, 0);
        const sumY = y.reduce((a: any, b: any) => a + b, 0);
        const sumXY = x.reduce(
          (sum: number, xi: number, i: number) => sum + xi * y[i],
          0
        );
        const sumX2 = x.reduce((sum: number, xi: number) => sum + xi * xi, 0);

        const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const b = (sumY - m * sumX) / n;

        return { slope: m, intercept: b };
      };

      const regression = calculateRegression(xData, yData);

      const trendlineData = xData.map((x) => ({
        x: x,
        y: regression.slope * x + regression.intercept,
      }));

      setScatterData({
        datasets: [
          {
            label: t("Wahlkreise"),
            data: xData.map((xValue, index) => ({
              x: xValue,
              y: yData[index],
              wahlkreisId: wahlkreisIds[index],
            })),
            backgroundColor: "rgba(75, 192, 192, 0.6)",
          },
          {
            label: "Trendline",
            data: trendlineData,
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
            fill: false,
            type: "line",
            pointRadius: 0,
          },
        ],
      });
    }
  }, [data]);

  if (!scatterData) return <div>Loading scatter plot...</div>;

  const scatterOptions: ChartOptions<"scatter"> = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: t("Alter vs. Politische Richtung"),
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem: any) => {
            const { wahlkreisId } = tooltipItem.raw;
            let wahlkreisName = "Unknown";
            Object.values(WAHLKREISE).forEach((region) => {
              const found = region.find((item) => item.id === wahlkreisId);
              if (found) {
                wahlkreisName = found.name;
              }
            });
            return `${wahlkreisName}: ${tooltipItem.raw.x}, ${tooltipItem.raw.y}`;
          },
        },
      },
      legend: {
        position: "bottom" as const,
      },
    },
    scales: {
      x: {
        type: "linear",
        title: {
          display: true,
          text: t("Politische Richtung"),
        },
      },
      y: {
        type: "linear",
        title: {
          display: true,
          text: t("Durchschnittsalter"),
        },
      },
    },
  };

  return (
    <div style={{ width: "80%", margin: "3rem auto" }}>
      <Scatter data={scatterData} options={scatterOptions} />
    </div>
  );
};

export default ScatterPlot;
