import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Users, Presentation, Play, BarChart3 } from "lucide-react"
import { getDoctors, getPresentations } from "@/lib/db"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getRecentSessions } from "@/lib/db"

export default function Dashboard() {
  const doctors = getDoctors()
  const presentations = getPresentations()
  const recentSessions = getRecentSessions(4)

  // Calculate real stats from actual data
  const totalSessions = recentSessions.length
  const activeDoctors = doctors.filter((d) => d.status === "active").length

  return (
    <div className="p-4 md:p-6 bg-gray-50">
      <div className="flex items-center gap-4 mb-6">
        <SidebarTrigger />
        <h1 className="text-2xl md:text-3xl font-bold">Sales Rep Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Doctors</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{doctors.length}</div>
            <p className="text-xs text-muted-foreground">Doctors to present to</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Presentations</CardTitle>
            <Presentation className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{presentations.length}</div>
            <p className="text-xs text-muted-foreground">Available presentations</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSessions}</div>
            <p className="text-xs text-muted-foreground">Presentations delivered</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Start presenting to doctors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full" size="lg">
              <Link href="/start">
                <Play className="h-4 w-4 mr-2" />
                Start New Presentation
              </Link>
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" asChild>
                <Link href="/doctors">
                  <Users className="h-4 w-4 mr-2" />
                  View Doctors
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/presentations">
                  <Presentation className="h-4 w-4 mr-2" />
                  View Presentations
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Available Doctors</CardTitle>
            <CardDescription>Select a doctor to present to</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{doctor.name}</p>
                    <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                  </div>
                  <Button size="sm" asChild>
                    <Link href={`/start?doctorId=${doctor.id}`}>Present</Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
