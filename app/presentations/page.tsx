import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Play, Presentation } from "lucide-react"
import Link from "next/link"
import { getPresentations } from "@/lib/db"

export default function PresentationsPage() {
  const presentations = getPresentations()

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center gap-4 mb-6">
        <SidebarTrigger />
        <h1 className="text-2xl md:text-3xl font-bold">Select Presentation</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {presentations.map((presentation) => (
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
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm">
                  <p className="text-muted-foreground">{presentation.slides} slides</p>
                </div>

                <Button asChild className="w-full">
                  <Link href={`/start?presentationId=${presentation.id}`}>
                    <Play className="h-4 w-4 mr-2" />
                    Use This Presentation
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
