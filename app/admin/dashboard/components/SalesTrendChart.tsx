"use client";

import React from "react";
import { useTheme } from "@mui/material/styles";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";

type SalesTrendDataPoint = {
  date: string;
  sales: number;
};

type SalesTrendChartProps = {
  data: SalesTrendDataPoint[];
};

const SalesTrendChart: React.FC<SalesTrendChartProps> = ({ data }) => {
  const theme = useTheme();

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "dd MMM", { locale: tr });
    } catch (error) {
      return dateStr; // Eğer tarih ayrıştırılamazsa orijinal değeri döndür
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          stroke={theme.palette.text.secondary}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
          stroke={theme.palette.text.secondary}
          tick={{ fontSize: 12 }}
        />
        <Tooltip
          formatter={(value: number) => [formatCurrency(value), "Satış"]}
          labelFormatter={formatDate}
          contentStyle={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 4,
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="sales"
          name="Satış"
          stroke={theme.palette.primary.main}
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{
            r: 6,
            stroke: theme.palette.primary.main,
            strokeWidth: 2,
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SalesTrendChart;
