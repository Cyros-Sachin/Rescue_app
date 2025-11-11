import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Navigation, Phone, AlertTriangle, AlertCircle } from "lucide-react"
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
  const { data: reports, error: reportsError } = await supabase
    .from("disaster_reports")
    .select("*")
    .in("status", ["assigned", "dispatched"])
    .order("created_at", { ascending: false })

  if (reportsError) {
    console.error("Error fetching reports:", reportsError)
  }

  const { data: sosAlerts, error: sosError } = await supabase
    .from("sos_alerts")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })

  if (sosError) {
    console.error("Error fetching SOS alerts:", sosError)
  }

  // Get rescue teams for SOS alerts
  const { data: rescueTeams } = await supabase.from("rescue_teams").select("*").eq("is_active", true)

  // Get emergency contacts
  const { data: contacts } = await supabase.from("emergency_contacts").select("*").eq("is_active", true)

  const getContactForTeam = (teamName: string) => {
    return contacts?.find((c) => c.team_name === teamName || c.team_type === teamName)
  }

  // Get nearest teams for a SOS alert
  const getNearestTeams = (lat: number, lng: number, count = 3) => {
    if (!rescueTeams) return []

    return rescueTeams
      .map((team) => ({
        ...team,
        distance: Math.sqrt(
          Math.pow(Number.parseFloat(team.latitude as unknown as string) - lat, 2) +
            Math.pow(Number.parseFloat(team.longitude as unknown as string) - lng, 2),
        ),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, count)
  }

  // Combine and sort all incidents by date
  const allIncidents = [
    ...(reports?.map((r) => ({ ...r, type: "disaster_report" })) || []),
    ...(sosAlerts?.map((s) => ({ ...s, type: "sos_alert" })) || []),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

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
          <p className="text-muted-foreground">Active disaster reports and SOS alerts requiring rescue team response</p>
        </div>

        {allIncidents && allIncidents.length > 0 ? (
          <div className="grid gap-6">
            {allIncidents.map((incident) => {
              const isSOSAlert = incident.type === "sos_alert"
              const nearestTeams = isSOSAlert ? getNearestTeams(incident.location_lat, incident.location_lng) : []

              return (
                <Card
                  key={`${incident.type}-${incident.id}`}
                  className={`border-2 hover:shadow-lg transition-shadow ${
                    isSOSAlert ? "border-red-400 bg-red-50" : "border-red-200"
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="flex items-center gap-2">
                            {isSOSAlert ? (
                              <>
                                <AlertCircle className="h-6 w-6 text-red-600 animate-pulse" />
                                SOS Emergency Alert
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="h-6 w-6 text-orange-600" />
                                Emergency Dispatch
                              </>
                            )}
                          </CardTitle>
                          <Badge
                            className={
                              isSOSAlert ? "bg-red-600 text-white animate-pulse" : "bg-orange-100 text-orange-800"
                            }
                          >
                            {incident.status.toUpperCase()}
                          </Badge>
                        </div>
                        <CardDescription>
                          Reported: {new Date(incident.created_at).toLocaleString("en-US")}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className={`grid ${isSOSAlert ? "grid-cols-1 md:grid-cols-2" : "md:grid-cols-3"} gap-6`}>
                      {!isSOSAlert && incident.image_url && (
                        <div className="relative h-48 rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={incident.image_url || "/placeholder.svg"}
                            alt="Disaster scene"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}

                      <div className="space-y-3">
                        {isSOSAlert && (
                          <div className="p-3 bg-red-100 rounded-lg border border-red-300">
                            <h3 className="font-semibold text-red-900 text-sm mb-1">Disaster Type</h3>
                            <p className="text-lg font-bold text-red-600 capitalize">{incident.disaster_type}</p>
                          </div>
                        )}

                        {!isSOSAlert && incident.assigned_teams && incident.assigned_teams.length > 0 && (
                          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                            <h3 className="font-semibold text-red-900 text-sm mb-2">Assigned Teams</h3>
                            <div className="flex flex-wrap gap-2">
                              {incident.assigned_teams.map((team: string, idx: number) => (
                                <Badge key={idx} className="bg-red-600 text-white">
                                  {team}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {isSOSAlert && nearestTeams.length > 0 && (
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <h3 className="font-semibold text-blue-900 text-sm mb-2">Nearest Teams</h3>
                            <div className="space-y-2">
                              {nearestTeams.map((team) => (
                                <div key={team.id} className="text-xs bg-white p-2 rounded border border-blue-100">
                                  <p className="font-semibold text-blue-900">{team.team_name}</p>
                                  <p className="text-blue-700">{team.team_type}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {!isSOSAlert && incident.ai_analysis && (
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <h3 className="font-semibold text-blue-900 text-sm mb-1">Analysis</h3>
                            <p className="text-xs text-blue-800 leading-relaxed line-clamp-4">{incident.ai_analysis}</p>
                          </div>
                        )}

                        {(incident.location_address || (isSOSAlert && incident.location_lat)) && (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-gray-600 mt-0.5" />
                              <div>
                                <p className="text-sm text-gray-700">{incident.location_address}</p>
                                {isSOSAlert && incident.location_lat && (
                                  <p className="text-xs text-gray-500">
                                    {incident.location_lat.toFixed(4)}, {incident.location_lng.toFixed(4)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="p-4 bg-gradient-to-br from-red-600 to-orange-600 text-white rounded-lg">
                          <h3 className="font-bold mb-3">Quick Actions</h3>
                          <div className="space-y-2">
                            {!isSOSAlert && incident.assigned_team && (
                              <>
                                {(() => {
                                  const teamContact = getContactForTeam(incident.assigned_team)
                                  return teamContact ? (
                                    <Button asChild size="sm" variant="secondary" className="w-full">
                                      <a href={`tel:${teamContact.phone}`}>
                                        <Phone className="h-4 w-4 mr-2" />
                                        Call {incident.assigned_team}
                                      </a>
                                    </Button>
                                  ) : null
                                })()}
                              </>
                            )}

                            {isSOSAlert && nearestTeams.length > 0 && (
                              <>
                                <Button asChild size="sm" variant="secondary" className="w-full">
                                  <a href={`tel:${nearestTeams[0].phone}`}>
                                    <Phone className="h-4 w-4 mr-2" />
                                    Call {nearestTeams[0].team_type}
                                  </a>
                                </Button>
                              </>
                            )}

                            {(incident.location_lat || incident.location_lat) && (
                              <>
                                <Button asChild size="sm" variant="secondary" className="w-full">
                                  <a
                                    href={`https://www.google.com/maps?q=${incident.location_lat},${incident.location_lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <MapPin className="h-4 w-4 mr-2" />
                                    View Location
                                  </a>
                                </Button>
                                <Button asChild size="sm" variant="secondary" className="w-full">
                                  <a
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${incident.location_lat},${incident.location_lng}&travelmode=driving`}
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

                        {!isSOSAlert && incident.assigned_team && (
                          <>
                            {(() => {
                              const teamContact = getContactForTeam(incident.assigned_team)
                              return teamContact ? (
                                <div className="p-3 bg-gray-50 rounded-lg text-sm">
                                  <p className="font-semibold mb-1">{teamContact.team_name}</p>
                                  <p className="text-muted-foreground text-xs">{teamContact.description}</p>
                                </div>
                              ) : null
                            })()}
                          </>
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
              <p className="text-muted-foreground">No active incidents. All clear!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
