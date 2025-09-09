"use client";

import React from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartProps } from '../schemas';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

interface ChartRendererProps extends ChartProps {
  frameless?: boolean;
}

export const ChartRenderer: React.FC<ChartRendererProps> = ({
  title,
  description,
  chartType = 'bar',
  data,
  options,
  className,
  sparkline,
  frameless = false,
  ...props
}) => {
  const transformData = () => {
    if (!data || !data.labels || !data.datasets || data.datasets.length === 0) {
      return [];
    }
    const labels = data.labels;
    const dataset = data.datasets[0];
    if (chartType === 'pie' || chartType === 'doughnut') {
      return labels.map((label, index) => ({ name: label, value: dataset.data[index] || 0 }));
    }
    return labels.map((label, index) => ({ name: label, value: dataset.data[index] || 0 }));
  };

  const renderChart = () => {
    const chartData = transformData();
    if (chartData.length === 0) {
      return <div className="flex items-center justify-center h-64 text-gray-500"><p>No data available</p></div>;
    }
    const chartHeight = sparkline ? 60 : 300;

    const chartComponents: Record<string, React.ReactElement> = {
      line: (
        <LineChart data={chartData}>
          {!sparkline && <CartesianGrid strokeDasharray="3 3" />}
          {!sparkline && <XAxis dataKey="name" />}
          {!sparkline && <YAxis />}
          {!sparkline && <Tooltip />}
          {!sparkline && <Legend />}
          <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} dot={false} />
        </LineChart>
      ),
      pie: (
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" labelLine={false} label={!sparkline ? ({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%` : false} outerRadius={sparkline ? 25 : 80} fill="#8884d8" dataKey="value">
            {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
          </Pie>
          {!sparkline && <Tooltip />}
          {!sparkline && <Legend />}
        </PieChart>
      ),
      bar: (
        <BarChart data={chartData}>
          {!sparkline && <CartesianGrid strokeDasharray="3 3" />}
          {!sparkline && <XAxis dataKey="name" />}
          {!sparkline && <YAxis />}
          {!sparkline && <Tooltip />}
          {!sparkline && <Legend />}
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      ),
      area: (
        <LineChart data={chartData}>
          {!sparkline && <CartesianGrid strokeDasharray="3 3" />}
          {!sparkline && <XAxis dataKey="name" />}
          {!sparkline && <YAxis />}
          {!sparkline && <Tooltip />}
          {!sparkline && <Legend />}
          <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} dot={false} />
        </LineChart>
      ),
      doughnut: (
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" labelLine={false} label={!sparkline ? ({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%` : false} outerRadius={sparkline ? 25 : 80} innerRadius={sparkline ? 15 : 40} fill="#8884d8" dataKey="value">
            {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
          </Pie>
          {!sparkline && <Tooltip />}
          {!sparkline && <Legend />}
        </PieChart>
      ),
      radar: (
        <BarChart data={chartData}>
          {!sparkline && <CartesianGrid strokeDasharray="3 3" />}
          {!sparkline && <XAxis dataKey="name" />}
          {!sparkline && <YAxis />}
          {!sparkline && <Tooltip />}
          {!sparkline && <Legend />}
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      ),
      scatter: (
        <LineChart data={chartData}>
          {!sparkline && <CartesianGrid strokeDasharray="3 3" />}
          {!sparkline && <XAxis dataKey="name" />}
          {!sparkline && <YAxis />}
          {!sparkline && <Tooltip />}
          {!sparkline && <Legend />}
          <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} dot={true} />
        </LineChart>
      ),
    };

    return (
      <ResponsiveContainer width="100%" height={chartHeight}>
        {chartComponents[chartType] || chartComponents.bar}
      </ResponsiveContainer>
    );
  };

  if (frameless || sparkline) {
    return renderChart();
  }

  return (
    <Card className={className} {...props}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
};