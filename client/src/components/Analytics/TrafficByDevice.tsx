import { Card, CardContent, CardHeader, CardTitle } from "../Shad"
import { BarChart, Cell, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"

const data = [
  { device: "Linux", value: 20000000, color: "#9e9ef7" },
  { device: "Mac", value: 25000000, color: "#96e3d7" },
  { device: "iOS", value: 30000000, color: "#000000" },
  { device: "Windows", value: 28000000, color: "#91bfff" },
  { device: "Android", value: 15000000, color: "#adc7ed" },
  { device: "Other", value: 22000000, color: "#95e8b7" },
]


export function TrafficByDevice() {
  return (
    <Card className="bg-gray-100 border-none">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Traffic by Device</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="device" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#666" }} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#666" }}
                tickFormatter={(value) => (value > 0 ? `${value / 1000000}M` : "0")}
              />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
            </Bar>            
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
