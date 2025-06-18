"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Play, Presentation, User, ArrowLeft, Mail, Phone, Briefcase, ArrowRight } from "lucide-react"
import Link from "next/link"
import { getDoctor, getDoctorPresentations, getPresentations } from "@/lib/db"
import { notFound, useParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function DoctorPresentationsPage({ params }: { params: { id: string } }) {
   const [doctor, setDoctor] = useState<any>([])
   const [presentation, setPresentation] = useState<any[]>([])
 
  const routerParams = useParams() as { id: string }
   
  useEffect(() => {
     async function loadInitialData() {
       try {
         const [doctorData, presentationsData] = await Promise.all([
           getDoctor(routerParams.id),
           getDoctorPresentations(routerParams.id)
         ])
         setDoctor(doctorData)
         setPresentation(presentationsData)
       } catch (error) {
         console.error('Error loading initial data:', error)
       }
     }
     loadInitialData()
   }, [])

  if (!doctor) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <SidebarTrigger />
          <Link href="/doctors">
            <Button variant="outline" size="sm" className="h-9">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Doctors
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Presentations for {doctor.name}
            </h1>
            <p className="text-gray-500 mt-1">{doctor.specialty}</p>
          </div>
        </div>

        {/* Doctor Information Card */}
        <Card className="action-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              Doctor Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Name</p>
                  <p className="font-semibold text-gray-900">{doctor.name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Specialty</p>
                  <p className="font-semibold text-gray-900">{doctor.specialty}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Email</p>
                  <p className="font-semibold text-gray-900 truncate">{doctor.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Phone className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Phone</p>
                  <p className="font-semibold text-gray-900">{doctor.phone}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Presentations */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Available Presentations</h2>
          <p className="text-gray-500">Select a presentation to deliver to {doctor.name}</p>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {presentation.map((presentation) => (
          <Card key={presentation.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Presentation className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{presentation.title}</CardTitle>
                  <CardDescription className="mt-2">{presentation.description}</CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">{presentation.slides} slides</span>
                  </div>
                  <span className="text-green-600 font-medium capitalize">{presentation.status}</span>
                </div>

                <Button asChild className="w-full h-11 group">
                  <Link href={`/viewer/${presentation.id}?doctorId=${doctor.id}`} className="flex items-center justify-center gap-2">
                    <Play className="h-4 w-4" />
                    Present to {doctor.name.split(" ")[1]}
                    <ArrowRight className="h-4 w-4 ml-auto group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {presentations.length === 0 && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Presentation className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium mb-2">No presentations available</p>
              <p className="text-gray-400 text-sm">Add presentations to start presenting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}