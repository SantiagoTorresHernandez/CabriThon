import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface StoreInventorySummary {
  storeId: string;
  storeName: string;
  totalProducts: number;
  totalQuantity: number;
  totalValue: number;
}

interface InventoryChartProps {
  data: StoreInventorySummary[];
}

const InventoryChart: React.FC<InventoryChartProps> = ({ data }) => {
  const chartData = data.map((store) => ({
    name: store.storeName,
    quantity: store.totalQuantity,
    value: store.totalValue,
  }));

  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis yAxisId="left" orientation="left" stroke="#0066cc" />
          <YAxis yAxisId="right" orientation="right" stroke="#28a745" />
          <Tooltip />
          <Legend />
          <Bar yAxisId="left" dataKey="quantity" fill="#0066cc" name="Total Units" />
          <Bar yAxisId="right" dataKey="value" fill="#28a745" name="Total Value ($)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default InventoryChart;

