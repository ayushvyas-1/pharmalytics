import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Play, Presentation, User, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getDoctor, getDoctorPresentations } from "@/lib/db"
import { notFound } from "next/navigation"

export default function DoctorPresentationsPage({ params }: { params: { id: string } }) {
  const doctor = getDoctor(params.id)
  const presentations = getDoctorPresentations(params.id)

  if (!doctor) {
    notFound()
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center gap-4 mb-6">
        <SidebarTrigger />
        <Link href="/doctors">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Doctors
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Presentations for {doctor.name}</h1>
          <p className="text-muted-foreground">{doctor.specialty}</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Doctor Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{doctor.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Specialty</p>
              <p className="font-medium">{doctor.specialty}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{doctor.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{doctor.phone}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Available Presentations</h2>
        <p className="text-muted-foreground">Select a presentation to deliver to {doctor.name}</p>
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
                  <p className="text-muted-foreground">Status: {presentation.status}</p>
                </div>

                <Button asChild className="w-full">
                  <Link href={`/viewer/${presentation.id}?doctorId=${doctor.id}`}>
                    <Play className="h-4 w-4 mr-2" />
                    Present to {doctor.name.split(" ")[1]}
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
