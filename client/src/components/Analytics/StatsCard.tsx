import { Card, CardContent } from "../Shad"
import { TrendingUp, TrendingDown } from "lucide-react"

const stats = [
  {
    title: "Views",
    value: "721K",
    change: "+11.02%",
    trend: "up",
    bgColor: "bg-blue-50",
  },
  {
    title: "Visits",
    value: "367K",
    change: "-0.03%",
    trend: "down",
    bgColor: "bg-indigo-50",
  },
  {
    title: "New Users",
    value: "1,156",
    change: "+15.03%",
    trend: "up",
    bgColor: "bg-blue-50",
  },
  {
    title: "Active Users",
    value: "239K",
    change: "+6.08%",
    trend: "up",
    bgColor: "bg-indigo-50",
  },
]

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title} className={`${stat.bgColor} border-0`}>
          <CardContent className="p-6">
  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
    <div>
      <p className="text-sm font-medium text-gray-900 mb-1">{stat.title}</p>
      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
    </div>
    <div className="mt-3 md:mt-0">
      <div className="flex items-center space-x-1">
        {stat.trend === "up" ? (
          <TrendingUp className="h-4 w-4" />
        ) : (
          <TrendingDown className="h-4 w-4" />
        )}
        <span className="text-xs font-medium">{stat.change}</span>
      </div>
    </div>
  </div>
</CardContent>

        </Card>
      ))}
    </div>
  )
}
