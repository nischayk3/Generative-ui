"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartToolProps {
  title?: string;
  description?: string;
  chartType?: "bar" | "line" | "pie" | "area";
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string;
      borderColor?: string;
      borderWidth?: number;
    }>;
  };
}

export const ChartTool = ({ title, description, chartType, data }: ChartToolProps) => {
  // Safety check: if no data provided, show a message
  if (!data || !data.labels || !data.datasets || data.labels.length === 0 || data.datasets.length === 0) {
    return (
      <Card className="w-full my-4">
        <CardHeader>
          <CardTitle className="text-black">{title || "Data Visualization"}</CardTitle>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <p className="text-gray-600 text-lg">No chart data available to display</p>
            <p className="text-gray-500 text-sm">Please provide data to visualize</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Use chartType if provided, otherwise default to bar
  const type = chartType || "bar";
  
  // Transform data for recharts format
  const chartData = data.labels.map((label, index) => {
    const dataPoint: Record<string, string | number> = { name: label };
    data.datasets.forEach(dataset => {
      dataPoint[dataset.label] = dataset.data[index] || 0;
    });
    return dataPoint;
  });

  // Generate colors for datasets
  const generateColor = (index: number) => 
    `hsl(${(index * 60) % 360}, 70%, 50%)`;

  const COLORS = data.datasets.map((_, index) => 
    data.datasets[index].backgroundColor || generateColor(index)
  );

  const renderChart = () => {
    switch (type) {
      case "bar":
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
            {data.datasets.map((dataset, index) => (
              <Bar
                key={dataset.label}
                dataKey={dataset.label}
                fill={COLORS[index]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        );

      case "line":
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
            {data.datasets.map((dataset, index) => (
              <Line
                key={dataset.label}
                type="monotone"
                dataKey={dataset.label}
                stroke={COLORS[index]}
                strokeWidth={3}
                dot={{ fill: COLORS[index], strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: COLORS[index], strokeWidth: 2 }}
              />
            ))}
          </LineChart>
        );

      case "area":
        return (
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
            {data.datasets.map((dataset, index) => (
              <Area
                key={dataset.label}
                type="monotone"
                dataKey={dataset.label}
                stackId="1"
                stroke={COLORS[index]}
                fill={COLORS[index]}
                fillOpacity={0.6}
              />
            ))}
          </AreaChart>
        );

      case "pie":
        const pieData = data.labels.map((label, index) => ({
          name: label,
          value: data.datasets[0]?.data[index] || 0
        }));

        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            />
          </PieChart>
        );

      default:
        return <div>Unsupported chart type: {type}</div>;
    }
  };

  return (
    <Card className="w-full max-w-none my-4">
      <CardHeader>
        <CardTitle className="text-black text-xl">
          {title || "Data Visualization"}
        </CardTitle>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </CardHeader>
      <CardContent className="w-full">
        <ResponsiveContainer width="100%" height={400}>
          {renderChart()}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
