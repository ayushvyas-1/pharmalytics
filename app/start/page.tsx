"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { getDoctors, getPresentations } from "@/lib/db"
import { useRouter, useSearchParams } from "next/navigation"
import { Play, User, Presentation } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

export default function StartPage() {
  const [selectedDoctor, setSelectedDoctor] = useState("")
  const [selectedPresentation, setSelectedPresentation] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  const doctors = getDoctors()
  const presentations = getPresentations()

  // Set defaults from URL params or first available
  useEffect(() => {
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

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center gap-4 mb-6">
        <SidebarTrigger />
        <h1 className="text-2xl md:text-3xl font-bold">Start Presentation</h1>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Setup Your Presentation</CardTitle>
            <CardDescription>Select a doctor and presentation to begin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Select Doctor
              </h3>
              <RadioGroup value={selectedDoctor} onValueChange={setSelectedDoctor} className="grid grid-cols-1 gap-3">
                {doctors.map((doctor) => (
                  <div key={doctor.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value={doctor.id} id={`doctor-${doctor.id}`} />
                    <Label htmlFor={`doctor-${doctor.id}`} className="flex-1 cursor-pointer">
                      <div className="font-medium">{doctor.name}</div>
                      <div className="text-sm text-muted-foreground">{doctor.specialty}</div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Presentation className="h-5 w-5" />
                Select Presentation
              </h3>
              <RadioGroup
                value={selectedPresentation}
                onValueChange={setSelectedPresentation}
                className="grid grid-cols-1 gap-3"
              >
                {presentations.map((presentation) => (
                  <div
                    key={presentation.id}
                    className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <RadioGroupItem value={presentation.id} id={`presentation-${presentation.id}`} />
                    <Label htmlFor={`presentation-${presentation.id}`} className="flex-1 cursor-pointer">
                      <div className="font-medium">{presentation.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {presentation.description} • {presentation.slides} slides
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <Button
              onClick={handleStartPresentation}
              className="w-full"
              size="lg"
              disabled={!selectedDoctor || !selectedPresentation}
            >
              <Play className="h-4 w-4 mr-2" />
              Start Presentation
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
