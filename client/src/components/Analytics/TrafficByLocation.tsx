import { Card, CardContent, CardHeader, CardTitle } from "../shad"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

const data = [
  { name: "United States", value: 38.6, color: "#1f2937" },
  { name: "Canada", value: 22.5, color: "#bbf0be" },
  { name: "Mexico", value: 30.8, color: "#91bfff" },
  { name: "Other", value: 8.1, color: "#c6c6f7" },
]

export function TrafficByLocation() {
  return (
    <Card className="bg-gray-100 border-none">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Traffic by Location</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-6">
          <div className="h-48 w-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" >
                  {data.map((entry, index) => (
                    <Cell  key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {data.map((item) => (
              <div key={item.name} className="flex items-center justify-between min-w-[150px]">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
