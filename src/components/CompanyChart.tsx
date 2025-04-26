"use client"
import { useState } from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  Filler,
  RadialLinearScale,
  ArcElement,
} from "chart.js"
import { Line, Bar, Radar, Doughnut } from "react-chartjs-2"
import { FaChartLine, FaChartBar, FaChartPie, FaRadiation } from "react-icons/fa"

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale,
  ArcElement,
)

type ChartType = "line" | "bar" | "radar" | "doughnut"

type CompanyChartProps = {
  title: string
  data: any
  defaultType?: ChartType
}

const CompanyChart = ({ title, data, defaultType = "line" }: CompanyChartProps) => {
  const [chartType, setChartType] = useState<ChartType>(defaultType)

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "var(--foreground)",
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: title,
        color: "var(--foreground)",
        font: {
          size: 16,
          weight: "bold",
        },
      },
      tooltip: {
        backgroundColor: "var(--card-bg)",
        titleColor: "var(--foreground)",
        bodyColor: "var(--foreground)",
        borderColor: "var(--border)",
        borderWidth: 1,
        padding: 10,
        displayColors: true,
        usePointStyle: true,
      },
    },
    scales:
      chartType !== "doughnut" && chartType !== "radar"
        ? {
            x: {
              ticks: {
                color: "var(--muted-foreground)",
              },
              grid: {
                color: "rgba(var(--muted), 0.1)",
              },
            },
            y: {
              ticks: {
                color: "var(--muted-foreground)",
              },
              grid: {
                color: "rgba(var(--muted), 0.1)",
              },
            },
          }
        : undefined,
    elements: {
      line: {
        tension: 0.3,
      },
      point: {
        radius: 3,
        hoverRadius: 5,
      },
    },
    animation: {
      duration: 1000,
    },
  }

  // Add fill option for line chart
  if (chartType === "line" && data.datasets) {
    data.datasets = data.datasets.map((dataset: any) => ({
      ...dataset,
      fill: true,
      backgroundColor: `${dataset.borderColor}20`,
    }))
  }

  const renderChart = () => {
    switch (chartType) {
      case "line":
        return <Line options={{...chartOptions, plugins: {...chartOptions.plugins, title: {...chartOptions.plugins.title, font: {size: 16, weight: "bold" as const}}}}} data={data} height={300} />
      case "bar":
        return <Bar options={{...chartOptions, plugins: {...chartOptions.plugins, title: {...chartOptions.plugins.title, font: {size: 16, weight: "bold" as const}}}}} data={data} height={300} />
      case "radar":
        return <Radar options={{...chartOptions, plugins: {...chartOptions.plugins, title: {...chartOptions.plugins.title, font: {size: 16, weight: "bold" as const}}}}} data={data} height={300} />
      case "doughnut":
        return <Doughnut options={{...chartOptions, plugins: {...chartOptions.plugins, title: {...chartOptions.plugins.title, font: {size: 16, weight: "bold" as const}}}}} data={data} height={300} />
      default:
        return <Line options={{...chartOptions, plugins: {...chartOptions.plugins, title: {...chartOptions.plugins.title, font: {size: 16, weight: "bold" as const}}}}} data={data} height={300} />
    }
  }

  return (
    <div className="bg-card-bg p-4 rounded-lg shadow-lg border border-border transition-all duration-300">
      <div className="flex justify-end mb-4 space-x-2">
        <button
          onClick={() => setChartType("line")}
          className={`p-2 rounded-md ${
            chartType === "line" ? "bg-primary text-white" : "bg-card-hover text-foreground"
          }`}
          aria-label="Line chart"
        >
          <FaChartLine />
        </button>
        <button
          onClick={() => setChartType("bar")}
          className={`p-2 rounded-md ${
            chartType === "bar" ? "bg-primary text-white" : "bg-card-hover text-foreground"
          }`}
          aria-label="Bar chart"
        >
          <FaChartBar />
        </button>
        <button
          onClick={() => setChartType("radar")}
          className={`p-2 rounded-md ${
            chartType === "radar" ? "bg-primary text-white" : "bg-card-hover text-foreground"
          }`}
          aria-label="Radar chart"
        >
          <FaRadiation />
        </button>
        <button
          onClick={() => setChartType("doughnut")}
          className={`p-2 rounded-md ${
            chartType === "doughnut" ? "bg-primary text-white" : "bg-card-hover text-foreground"
          }`}
          aria-label="Doughnut chart"
        >
          <FaChartPie />
        </button>
      </div>
      <div className="h-[300px]">{renderChart()}</div> 
    </div>
  )
}

export default CompanyChart
