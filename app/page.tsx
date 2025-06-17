"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Users, Presentation, Play, BarChart3, ArrowRight, TrendingUp } from "lucide-react"
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-8">
            <SidebarTrigger />
            <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-8">
            <SidebarTrigger />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Sales Rep Dashboard
            </h1>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-red-600 font-medium mb-2">Error loading dashboard</p>
              <p className="text-gray-500 text-sm">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Sales Rep Dashboard
            </h1>
            <p className="text-gray-500 mt-1">Manage presentations and track doctor engagement</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="stat-card group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Available Doctors</CardTitle>
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-1">{doctors.length}</div>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Ready for presentations
              </p>
            </CardContent>
          </Card>

          <Card className="stat-card group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Presentations</CardTitle>
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
                <Presentation className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-1">{presentations.length}</div>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Available content
              </p>
            </CardContent>
          </Card>

          <Card className="stat-card group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Sessions</CardTitle>
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-1">{totalSessions}</div>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Presentations delivered
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <Card className="action-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-900">Quick Actions</CardTitle>
              <CardDescription className="text-gray-500">
                Start presenting to doctors and track engagement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full h-12 text-base font-medium" size="lg">
                <Link href="/start" className="flex items-center justify-center gap-2">
                  <Play className="h-5 w-5" />
                  Start New Presentation
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Link>
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" asChild className="h-11">
                  <Link href="/doctors" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Doctors
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-11">
                  <Link href="/presentations" className="flex items-center gap-2">
                    <Presentation className="h-4 w-4" />
                    Content
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Available Doctors */}
          <Card className="action-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-900">Available Doctors</CardTitle>
              <CardDescription className="text-gray-500">
                Select a doctor to present to
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {doctors.slice(0, 4).map((doctor) => (
                  <div key={doctor.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {doctor.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{doctor.name}</p>
                        <p className="text-sm text-gray-500">{doctor.specialty}</p>
                      </div>
                    </div>
                    <Button size="sm" asChild className="h-8">
                      <Link href={`/start?doctorId=${doctor.id}`}>
                        Present
                      </Link>
                    </Button>
                  </div>
                ))}
                
                {doctors.length > 4 && (
                  <Button variant="ghost" asChild className="w-full mt-2">
                    <Link href="/doctors" className="flex items-center gap-2">
                      View all doctors
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}