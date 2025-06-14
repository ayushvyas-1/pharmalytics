import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { User, Eye } from "lucide-react"
import { getDoctors } from "@/lib/db"
import Link from "next/link"

export default function DoctorsPage() {
  const doctors = getDoctors()

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center gap-4 mb-6">
        <SidebarTrigger />
        <h1 className="text-2xl md:text-3xl font-bold">Select Doctor</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {doctors.map((doctor) => (
          <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">{doctor.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="text-muted-foreground">Email: {doctor.email}</p>
                  <p className="text-muted-foreground">Phone: {doctor.phone}</p>
                </div>

                <Button asChild className="w-full">
                  <Link href={`/doctors/${doctor.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Presentations for {doctor.name.split(" ")[1]}
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
