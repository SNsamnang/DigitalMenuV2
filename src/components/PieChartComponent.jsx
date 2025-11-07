import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Process users to count by status
export const processUserStatuses = (users) => {
  const statusCount = { Active: 0, Disable: 0 };
  users.forEach((user) => {
    if (user.status === 1 || user.status === "active") statusCount.Active += 1;
    else statusCount.Disable += 1; // treat anything else as disabled
  });
  return Object.keys(statusCount).map((status) => ({
    name: status,
    value: statusCount[status],
  }));
};

const COLORS = ["#7BB662", "#E03C32"]; // Active (green), Disable (red)

const PieChartComponent = ({ users = [] }) => {
  const data = processUserStatuses(users);

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={90}
          fill="#8884d8"
          dataKey="value"
          label={({ name, value }) => `${name}: ${value}`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PieChartComponent;
