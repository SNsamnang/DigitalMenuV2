import React, { useState } from "react";
import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Helper to format date based on mode
const getDateKey = (dateStr, mode) => {
  const date = new Date(dateStr);
  if (mode === "day") {
    return date.toLocaleDateString("default", { day: "2-digit", month: "2-digit", year: "2-digit" });
  }
  if (mode === "month") {
    return date.toLocaleDateString("default", { month: "2-digit", year: "numeric" });
  }
  // year
  return date.getFullYear().toString();
};

export const processData = (data, mode) => {
  const countMap = {};
  data.forEach((shop) => {
    const key = getDateKey(shop.created_at, mode);
    countMap[key] = (countMap[key] || 0) + 1;
  });
  // Sort keys chronologically
  const sortedKeys = Object.keys(countMap).sort((a, b) => {
    if (mode === "year") return a - b;
    if (mode === "month") {
      // "MM/YYYY" format
      const [ma, ya] = a.split("/").map(Number);
      const [mb, yb] = b.split("/").map(Number);
      return ya !== yb ? ya - yb : ma - mb;
    }
    // "DD/MM/YYYY" format
    const [da, ma, ya] = a.split("/").map(Number);
    const [db, mb, yb] = b.split("/").map(Number);
    return ya !== yb ? ya - yb : ma !== mb ? ma - mb : da - db;
  });
  return sortedKeys.map((key) => ({
    month: key,
    count: countMap[key],
  }));
};

const LineChartComponent = ({ shopData }) => {
  const [mode, setMode] = useState("day"); // "day", "month", "year"
  const data = processData(shopData || [], mode);

  return (
    <div>
      <div className="flex gap-2 justify-center mb-2">
        <button
          className={`px-3 py-1 rounded ${mode === "day" ? "bg-orange-400 text-white" : "bg-gray-200"}`}
          onClick={() => setMode("day")}
        >
          Day
        </button>
        <button
          className={`px-3 py-1 rounded ${mode === "month" ? "bg-orange-400 text-white" : "bg-gray-200"}`}
          onClick={() => setMode("month")}
        >
          Month
        </button>
        <button
          className={`px-3 py-1 rounded ${mode === "year" ? "bg-orange-400 text-white" : "bg-gray-200"}`}
          onClick={() => setMode("year")}
        >
          Year
        </button>
      </div>
      <ResponsiveContainer width="100%" height={300} className="-ml-5">
        <ReLineChart data={data}>
          <CartesianGrid strokeDasharray="1 1" />
          <XAxis dataKey="month" />
          <YAxis domain={[0, 'dataMax + 1']} interval={0} allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#8884d8"
            strokeWidth={2}
          />
        </ReLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChartComponent;