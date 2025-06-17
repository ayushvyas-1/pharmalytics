import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Play, Presentation, ArrowRight, FileText } from "lucide-react"
import Link from "next/link"
import { getPresentations } from "@/lib/db"

export default function PresentationsPage() {
  const presentations = getPresentations()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Select Presentation
            </h1>
            <p className="text-gray-500 mt-1">Choose content to present to doctors</p>
          </div>
        </div>

        {/* Presentations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {presentations.map((presentation) => (
            <Card key={presentation.id} className="action-card group">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Presentation className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {presentation.title}
                    </CardTitle>
                    <CardDescription className="mt-2 text-gray-600">
                      {presentation.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-4 w-4 text-gray-500" />
                    </div>
                    <span className="text-gray-600">{presentation.slides} slides</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-600 font-medium capitalize">{presentation.status}</span>
                  </div>
                </div>

                <Button asChild className="w-full h-11 group">
                  <Link href={`/start?presentationId=${presentation.id}`} className="flex items-center justify-center gap-2">
                    <Play className="h-4 w-4" />
                    Use This Presentation
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
              <p className="text-gray-400 text-sm">Upload presentations to get started</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}