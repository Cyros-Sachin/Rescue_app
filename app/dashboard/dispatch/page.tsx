import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Navigation, Phone, AlertTriangle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default async function DispatchPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get all reports that need dispatch (assigned or dispatched status)
  const { data: reports, error } = await supabase
    .from("disaster_reports")
    .select("*")
    .in("status", ["assigned", "dispatched"])
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching reports:", error)
  }

  // Get emergency contacts
  const { data: contacts } = await supabase.from("emergency_contacts").select("*").eq("is_active", true)

  const getContactForTeam = (teamName: string) => {
    return contacts?.find((c) => c.team_name === teamName || c.team_type === teamName)
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
          <h1 className="text-4xl font-bold text-red-600 mb-2">Team Dispatch Center</h1>
          <p className="text-muted-foreground">Active disaster reports requiring rescue team response</p>
        </div>

        {reports && reports.length > 0 ? (
          <div className="grid gap-6">
            {reports.map((report) => {
              const teamContact = getContactForTeam(report.assigned_team)
              return (
                <Card key={report.id} className="border-red-200 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle>Emergency Dispatch</CardTitle>
                          <Badge className="bg-orange-100 text-orange-800">{report.status.toUpperCase()}</Badge>
                        </div>
                        <CardDescription>
                          Reported: {new Date(report.created_at).toLocaleString("en-US")}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="relative h-48 rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={report.image_url || "/placeholder.svg"}
                          alt="Disaster scene"
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                          <h3 className="font-semibold text-red-900 text-sm mb-1">Assigned Team</h3>
                          <p className="text-lg font-bold text-red-600">{report.assigned_team}</p>
                        </div>

                        {report.ai_analysis && (
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <h3 className="font-semibold text-blue-900 text-sm mb-1">Analysis</h3>
                            <p className="text-xs text-blue-800 leading-relaxed line-clamp-4">{report.ai_analysis}</p>
                          </div>
                        )}

                        {report.location_address && (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-gray-600 mt-0.5" />
                              <p className="text-sm text-gray-700">{report.location_address}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="p-4 bg-gradient-to-br from-red-600 to-orange-600 text-white rounded-lg">
                          <h3 className="font-bold mb-3">Quick Actions</h3>
                          <div className="space-y-2">
                            {teamContact && (
                              <Button asChild size="sm" variant="secondary" className="w-full">
                                <a href={`tel:${teamContact.phone}`}>
                                  <Phone className="h-4 w-4 mr-2" />
                                  Call {report.assigned_team}
                                </a>
                              </Button>
                            )}
                            {report.location_lat && report.location_lng && (
                              <>
                                <Button asChild size="sm" variant="secondary" className="w-full">
                                  <a
                                    href={`https://www.google.com/maps?q=${report.location_lat},${report.location_lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <MapPin className="h-4 w-4 mr-2" />
                                    View Location
                                  </a>
                                </Button>
                                <Button asChild size="sm" variant="secondary" className="w-full">
                                  <a
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${report.location_lat},${report.location_lng}&travelmode=driving`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Navigation className="h-4 w-4 mr-2" />
                                    Navigate (Fastest Route)
                                  </a>
                                </Button>
                              </>
                            )}
                          </div>
                        </div>

                        {teamContact && (
                          <div className="p-3 bg-gray-50 rounded-lg text-sm">
                            <p className="font-semibold mb-1">{teamContact.team_name}</p>
                            <p className="text-muted-foreground text-xs">{teamContact.description}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="border-green-200">
            <CardContent className="pt-6 text-center">
              <AlertTriangle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <p className="text-muted-foreground">No active dispatches at the moment. All clear!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
