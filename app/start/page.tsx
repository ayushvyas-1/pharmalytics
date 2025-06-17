"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Doctor, Presentation as PresentationType } from "@/lib/db"
import { useRouter, useSearchParams } from "next/navigation"
import { Play, User, Presentation, ArrowRight, CheckCircle } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

// Fetch functions
async function getStartPageData() {
  const response = await fetch('/api/start')
  if (!response.ok) {
    throw new Error('Failed to fetch start page data')
  }
  return response.json()
}

export default function StartPage() {
  const [selectedDoctor, setSelectedDoctor] = useState("")
  const [selectedPresentation, setSelectedPresentation] = useState("")
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [presentations, setPresentations] = useState<PresentationType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const data = await getStartPageData()
        setDoctors(data.doctors)
        setPresentations(data.presentations)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Set defaults from URL params or first available
  useEffect(() => {
    if (doctors.length === 0 || presentations.length === 0) return

    const doctorId = searchParams.get("doctorId")
    const presentationId = searchParams.get("presentationId")

    if (doctorId && doctors.some((d) => d.id === doctorId)) {
      setSelectedDoctor(doctorId)
    } else if (doctors.length > 0) {
      setSelectedDoctor(doctors[0].id)
    }

    if (presentationId && presentations.some((p) => p.id === presentationId)) {
      setSelectedPresentation(presentationId)
    } else if (presentations.length > 0) {
      setSelectedPresentation(presentations[0].id)
    }
  }, [searchParams, doctors, presentations])

  const handleStartPresentation = () => {
    if (selectedDoctor && selectedPresentation) {
      router.push(`/viewer/${selectedPresentation}?doctorId=${selectedDoctor}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-8">
            <SidebarTrigger />
            <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
          </div>
          <div className="max-w-2xl mx-auto">
            <div className="h-96 bg-gray-200 rounded-xl animate-pulse" />
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
              Start Presentation
            </h1>
          </div>
          <div className="text-center text-red-500">Error: {error}</div>
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
              Start Presentation
            </h1>
            <p className="text-gray-500 mt-1">Setup your presentation session</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="action-card">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-semibold text-gray-900">Setup Your Presentation</CardTitle>
              <CardDescription className="text-gray-500">
                Select a doctor and presentation to begin your session
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-8">
              {/* Doctor Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  Select Doctor
                </h3>
                <RadioGroup value={selectedDoctor} onValueChange={setSelectedDoctor} className="space-y-3">
                  {doctors.map((doctor) => (
                    <div key={doctor.id} className="relative">
                      <Label
                        htmlFor={`doctor-${doctor.id}`}
                        className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <RadioGroupItem value={doctor.id} id={`doctor-${doctor.id}`} />
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {doctor.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{doctor.name}</div>
                          <div className="text-sm text-gray-500">{doctor.specialty}</div>
                        </div>
                        {selectedDoctor === doctor.id && (
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                        )}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Presentation Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Presentation className="h-4 w-4 text-green-600" />
                  </div>
                  Select Presentation
                </h3>
                <RadioGroup
                  value={selectedPresentation}
                  onValueChange={setSelectedPresentation}
                  className="space-y-3"
                >
                  {presentations.map((presentation) => (
                    <div key={presentation.id} className="relative">
                      <Label
                        htmlFor={`presentation-${presentation.id}`}
                        className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <RadioGroupItem value={presentation.id} id={`presentation-${presentation.id}`} />
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                          <Presentation className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{presentation.title}</div>
                          <div className="text-sm text-gray-500">
                            {presentation.description} • {presentation.slides} slides
                          </div>
                        </div>
                        {selectedPresentation === presentation.id && (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Start Button */}
              <Button
                onClick={handleStartPresentation}
                className="w-full h-12 text-base font-medium group"
                size="lg"
                disabled={!selectedDoctor || !selectedPresentation}
              >
                <Play className="h-5 w-5 mr-2" />
                Start Presentation
                <ArrowRight className="h-4 w-4 ml-auto group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}