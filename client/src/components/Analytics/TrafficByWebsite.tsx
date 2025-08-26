import { Card, CardContent, CardHeader, CardTitle } from "../shad"

const websites = [
  { name: "Google", percentage: 85 },
  { name: "YouTube", percentage: 40 },
  { name: "Instagram", percentage: 70 },
  { name: "Pinterest", percentage: 30 },
  { name: "Facebook", percentage: 55 },
  { name: "Twitter", percentage: 35 },
  { name: "Tumblr", percentage: 45 },
]

export function TrafficByWebsite() {
  return (
    <Card className="bg-gray-100 border-none">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Traffic by Website</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {websites.map((website) => (
          <div key={website.name} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{website.name}</span>
            </div>
            <div className=" bg-gray-200 rounded-full h-2 "
              style={{ width: `${website.percentage}%` }}
            >
              <div
                className="hover:bg-black h-2 rounded-full transition-all duration-300"
                
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
