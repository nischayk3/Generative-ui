"use client";

import React from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartProps } from '../schemas';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const ChartRenderer: React.FC<ChartProps> = ({
  title,
  description,
  chartType = 'bar',
  data,
  options,
  className,
  ...props
}) => {
  // Add debugging
  console.log('ChartRenderer props:', { title, chartType, data, options });
  
  // Transform Chart.js format data to Recharts format
  const transformData = () => {
    if (!data || !data.labels || !data.datasets || data.datasets.length === 0) {
      console.warn('ChartRenderer: Invalid data structure:', data);
      return [];
    }

    const labels = data.labels;
    const dataset = data.datasets[0];
    
    if (chartType === 'pie' || chartType === 'doughnut') {
      return labels.map((label, index) => ({
        name: label,
        value: dataset.data[index] || 0,
      }));
    }

    // For line and bar charts
    return labels.map((label, index) => ({
      name: label,
      value: dataset.data[index] || 0,
    }));
  };

  const renderChart = () => {
    const chartData = transformData();
    console.log('ChartRenderer: Transformed data:', chartData);
    
    if (chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p>No data available for chart</p>
        </div>
      );
    }

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ fill: '#8884d8' }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'bar':
      default:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

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
