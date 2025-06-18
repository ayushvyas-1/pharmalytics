"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { User, Eye, Mail, Phone, ArrowRight } from "lucide-react"
import { getDoctors } from "@/lib/db"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function DoctorsPage() {
  
  const [doctors, setDoctors] = useState<any[]>([])
 
  useEffect(() => {
      async function loadInitialData() {
        try {
          const doctorsData = await getDoctors();
          setDoctors(doctorsData)

        } catch (error) {
          console.error('Error loading initial data:', error)
        }
      }
      loadInitialData()
    }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Select Doctor
            </h1>
            <p className="text-gray-500 mt-1">Choose a doctor to present to</p>
          </div>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <Card key={doctor.id} className="action-card group">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                      {doctor.name}
                    </CardTitle>
                    <p className="text-sm text-blue-600 font-medium mt-1">{doctor.specialty}</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Mail className="h-4 w-4 text-gray-500" />
                    </div>
                    <span className="text-gray-600 truncate">{doctor.email}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Phone className="h-4 w-4 text-gray-500" />
                    </div>
                    <span className="text-gray-600">{doctor.phone}</span>
                  </div>
                </div>

                <Button asChild className="w-full h-11 group">
                  <Link href={`/doctors/${doctor.id}`} className="flex items-center justify-center gap-2">
                    <Eye className="h-4 w-4" />
                    View Presentations
                    <ArrowRight className="h-4 w-4 ml-auto group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {doctors.length === 0 && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium mb-2">No doctors available</p>
              <p className="text-gray-400 text-sm">Add doctors to start presenting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}