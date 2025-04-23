"use client";

import React from "react";
import { useTheme } from "@mui/material/styles";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Box, Typography } from "@mui/material";

type CategoryData = {
  category: string;
  value: number;
};

type CategoryDistributionChartProps = {
  data: CategoryData[];
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CategoryDistributionChart: React.FC<CategoryDistributionChartProps> = ({
  data,
}) => {
  const theme = useTheme();

  // Renk paleti
  const colors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
    // Daha fazla kategori için ek renkler
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#8dd1e1",
  ];

  // Veri yoksa mesaj göster
  if (!data || data.length === 0) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Kategori verisi bulunamadı
        </Typography>
      </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [`${value}%`, "Oran"]}
          contentStyle={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 4,
          }}
        />
        <Legend
          formatter={(value, entry, index) => (
            <span style={{ color: theme.palette.text.primary }}>{value}</span>
          )}
          layout="vertical"
          verticalAlign="middle"
          align="right"
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CategoryDistributionChart;
