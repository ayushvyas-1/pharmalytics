"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Users, Presentation, Play, BarChart3, TrendingUp, Calendar, Clock, Target } from "lucide-react"
import { Doctor, Presentation as PresentationType } from "@/lib/db"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

// Server actions
async function getDashboardData() {
  const response = await fetch('/api/dashboard')
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard data')
  }
  return response.json()
}

export default function Dashboard() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [presentations, setPresentations] = useState<PresentationType[]>([])
  const [totalSessions, setTotalSessions] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const data = await getDashboardData()
        setDoctors(data.doctors)
        setPresentations(data.presentations)
        setTotalSessions(data.totalSessions)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="w-full max-w-none px-6 py-6">
          <div className="flex items-center gap-4 mb-8">
            <SidebarTrigger />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Sales Rep Dashboard
            </h1>
          </div>
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="w-full max-w-none px-6 py-6">
          <div className="flex items-center gap-4 mb-8">
            <SidebarTrigger />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Sales Rep Dashboard
            </h1>
          </div>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="text-red-500 text-lg font-medium mb-2">Error Loading Dashboard</div>
              <div className="text-gray-600">{error}</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="w-full max-w-none px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Sales Rep Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Welcome back! Track your presentation performance and engage with doctors.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg" asChild>
              <Link href="/start">
                <Play className="h-4 w-4 mr-2" />
                Start New Presentation
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Available Doctors</CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{doctors.length}</div>
              <p className="text-xs text-gray-500 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                Doctors to present to
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Presentations</CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Presentation className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{presentations.length}</div>
              <p className="text-xs text-gray-500 flex items-center mt-1">
                <Target className="h-3 w-3 mr-1" />
                Available presentations
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Sessions</CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{totalSessions}</div>
              <p className="text-xs text-gray-500 flex items-center mt-1">
                <Calendar className="h-3 w-3 mr-1" />
                Presentations delivered
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Success Rate</CardTitle>
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {totalSessions > 0 ? Math.round((totalSessions / (doctors.length * presentations.length)) * 100) : 0}%
              </div>
              <p className="text-xs text-gray-500 flex items-center mt-1">
                <Clock className="h-3 w-3 mr-1" />
                Engagement rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Quick Actions - Full Width on Mobile, 1/3 on Desktop */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 xl:col-span-1">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Quick Actions</CardTitle>
              <CardDescription className="text-gray-600">Start presenting to doctors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                <Link href="/start">
                  <Play className="h-5 w-5 mr-3" />
                  Start New Presentation
                </Link>
              </Button>

              <div className="grid grid-cols-1 gap-3">
                <Button variant="outline" asChild className="h-12 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200">
                  <Link href="/doctors">
                    <Users className="h-4 w-4 mr-2" />
                    View All Doctors
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-12 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200">
                  <Link href="/presentations">
                    <Presentation className="h-4 w-4 mr-2" />
                    View Presentations
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-12 hover:bg-green-50 hover:border-green-300 transition-all duration-200">
                  <Link href="/analytics">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Available Doctors - 2/3 Width on Desktop */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 xl:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Available Doctors</CardTitle>
              <CardDescription className="text-gray-600">Select a doctor to present to</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {doctors.map((doctor) => (
                  <div key={doctor.id} className="group p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-300 bg-gradient-to-r from-white to-gray-50/50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            {doctor.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                              {doctor.name}
                            </p>
                            <p className="text-sm text-gray-500">{doctor.specialty}</p>
                          </div>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        asChild 
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-sm ml-4"
                      >
                        <Link href={`/start?doctorId=${doctor.id}`}>
                          <Play className="h-3 w-3 mr-1" />
                          Present
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {doctors.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No doctors available</p>
                  <p className="text-gray-400 text-sm mt-1">Add doctors to start presenting</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Section */}
        <div className="mt-8">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Recent Activity</CardTitle>
              <CardDescription className="text-gray-600">Your latest presentation sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No recent activity</p>
                <p className="text-gray-400 text-sm mt-1">Start your first presentation to see activity here</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}