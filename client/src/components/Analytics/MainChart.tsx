import { Card, CardContent, CardHeader } from "../Shad";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const data = [
  {
    month: "Jan",
    totalUsers: 15000000,
    totalProjects: 8000000,
    operatingStatus: 12000000,
  },
  {
    month: "Feb",
    totalUsers: 12000000,
    totalProjects: 10000000,
    operatingStatus: 14000000,
  },
  {
    month: "Mar",
    totalUsers: 8000000,
    totalProjects: 12000000,
    operatingStatus: 16000000,
  },
  {
    month: "Apr",
    totalUsers: 10000000,
    totalProjects: 15000000,
    operatingStatus: 18000000,
  },
  {
    month: "May",
    totalUsers: 14000000,
    totalProjects: 18256598,
    operatingStatus: 20000000,
  },
  {
    month: "Jun",
    totalUsers: 18000000,
    totalProjects: 16000000,
    operatingStatus: 22000000,
  },
  {
    month: "Jul",
    totalUsers: 22000000,
    totalProjects: 20000000,
    operatingStatus: 24000000,
  },
];

export function MainChart() {
  return (
    <Card className="bg-gray-100 border-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="text-sm font-medium text-gray-900 border-b-2 border-black pb-2">
              Total Users
            </button>
            <button className="text-sm text-gray-500 pb-2">
              Total Projects
            </button>
            <button className="text-sm text-gray-500 pb-2">
              Operating Status
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-black rounded-full"></div>
              <span className="text-sm text-gray-600">This year</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <span className="text-sm text-gray-600">Last year</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                tickMargin={10}
                dataKey="month"
                axisLine={true}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#666" }}
              />
              <YAxis
                tickMargin={20}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#666" }}
                tickFormatter={(value) =>
                  value > 0 ? `${value / 1000000}M` : "0"
                }
              />
              <Tooltip
                content={({ payload }) => {
                  if (payload && payload.length) {
                    const value = payload[0].value;
                    return (
                      <div className="bg-gray-700 p-1 text-sm rounded-lg shadow-md">
                        {value}
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Line
                type="monotone"
                dataKey="totalUsers"
                stroke="#000"
                strokeWidth={2}
                // strokeDasharray="50,3,7,2,8,1,9,0,20"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="totalProjects"
                stroke="#94a3b8"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
