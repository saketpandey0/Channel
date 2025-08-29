import { Card, CardHeader, Avatar, CardTitle, Button } from "../components/shad";

export default function PublicationPage() {
  return (
    <Card className="mx-auto max-w-7xl min-h-screen rounded-xl border border-gray-100 bg-slate-100 px-4 py-8 shadow-sm sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <CardHeader className="min-h-[10rem] bg-blue-300 rounded-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Left side */}
            <div className="flex flex-row gap-6 items-center">
              <Avatar className="h-16 w-16 bg-green-200">A</Avatar>
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold">Publication Title</CardTitle>
                <p className="text-sm text-gray-700">Publication bio goes here</p>
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>123 followers</span>
                  <span>5 editors</span>
                </div>
              </div>
            </div>

            {/* Right side */}
            <div className="flex gap-2">
              <Button>Follow</Button>
              <Button variant="secondary">Newsletter</Button>
            </div>
          </div>
        </CardHeader>

        {/* Content / Stories */}
        <div className="w-full rounded-xl border border-gray-100 bg-red-100 px-6 py-8 shadow-sm">
          <div className="text-center text-gray-800 font-medium">Publication Stories</div>
        </div>
      </div>
    </Card>
  );
}
