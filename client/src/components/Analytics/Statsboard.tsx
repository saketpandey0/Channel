import DashboardLayout from "./DashboardLayout"
import { StatsCards } from "./StatsCard"
import { MainChart } from "./MainChart"
import { TrafficByWebsite } from "./TrafficByWebsite"
import { TrafficByDevice } from "./TrafficByDevice"
import { TrafficByLocation } from "./TrafficByLocation"

export default function Statsboard() {
  return (
    <DashboardLayout>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Today</h2>
        </div>

        <StatsCards />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <MainChart />
          </div>
          <div>
            <TrafficByWebsite />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TrafficByDevice />
          <TrafficByLocation />
        </div>

      </div>
    </DashboardLayout>
  )
}
