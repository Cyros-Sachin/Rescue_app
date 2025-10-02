import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Calendar, Shield, Navigation } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default async function ReportsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: reports, error } = await supabase
    .from("disaster_reports")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching reports:", error)
  }

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    assigned: "bg-blue-100 text-blue-800",
    dispatched: "bg-orange-100 text-orange-800",
    resolved: "bg-green-100 text-green-800",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-4xl font-bold text-red-600 mb-2">My Reports</h1>
          <p className="text-muted-foreground">View all your submitted disaster reports</p>
        </div>

        {reports && reports.length > 0 ? (
          <div className="grid gap-6">
            {reports.map((report) => (
              <Card key={report.id} className="border-red-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle>Disaster Report</CardTitle>
                        <Badge className={statusColors[report.status as keyof typeof statusColors]}>
                          {report.status.toUpperCase()}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(report.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {report.location_address && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {report.location_address}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="relative h-64 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={report.image_url || "/placeholder.svg"}
                        alt="Disaster scene"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-4">
                      {report.assigned_team && (
                        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Shield className="h-5 w-5 text-red-600" />
                            <h3 className="font-semibold text-red-900">Assigned Team</h3>
                          </div>
                          <p className="text-lg font-bold text-red-600">{report.assigned_team}</p>
                        </div>
                      )}
                      {report.ai_analysis && (
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <h3 className="font-semibold text-blue-900 mb-2">AI Analysis</h3>
                          <p className="text-sm text-blue-800 leading-relaxed whitespace-pre-line">
                            {report.ai_analysis}
                          </p>
                        </div>
                      )}
                      {report.location_lat && report.location_lng && (
                        <div className="space-y-2">
                          <Button
                            asChild
                            variant="outline"
                            className="w-full border-red-600 text-red-600 hover:bg-red-50 bg-transparent"
                          >
                            <a
                              href={`https://www.google.com/maps?q=${report.location_lat},${report.location_lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <MapPin className="h-4 w-4 mr-2" />
                              View Location on Map
                            </a>
                          </Button>
                          <Button asChild className="w-full bg-red-600 hover:bg-red-700">
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${report.location_lat},${report.location_lng}&travelmode=driving`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Navigation className="h-4 w-4 mr-2" />
                              Get Directions (Shortest Route)
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-yellow-200">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">You haven't submitted any reports yet.</p>
              <Button asChild className="bg-red-600 hover:bg-red-700">
                <Link href="/dashboard/report">Submit Your First Report</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
