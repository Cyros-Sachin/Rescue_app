"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, AlertTriangle, Loader2, Phone, Mail, Navigation, ChevronDown, ChevronUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface DisasterReport {
  id: string
  location_lat: number | null
  location_lng: number | null
  location_address: string | null
  assigned_team: string
  ai_analysis: string
  created_at: string
  image_url: string
}

interface RescueTeam {
  id: string
  team_name: string
  team_type: string
  latitude: number
  longitude: number
  phone: string
  email: string | null
  address: string
  description: string
}

const JAMMU_CENTER = { lat: 32.7266, lng: 74.857 }

export default function LiveMapPage() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [disasterReports, setDisasterReports] = useState<DisasterReport[]>([])
  const [rescueTeams, setRescueTeams] = useState<RescueTeam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedDisaster, setExpandedDisaster] = useState<string | null>(null)
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null)
  const supabase = createClient()

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        () => {
          setUserLocation(JAMMU_CENTER)
        },
      )
    }
  }, [])

  // Fetch disaster reports and rescue teams
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const { data: reports, error: reportsError } = await supabase
          .from("disaster_reports")
          .select("*")
          .eq("status", "assigned")
          .order("created_at", { ascending: false })
          .limit(50)

        if (reportsError) throw reportsError
        setDisasterReports(reports || [])

        const { data: teams, error: teamsError } = await supabase.from("rescue_teams").select("*").eq("is_active", true)

        if (teamsError) throw teamsError
        setRescueTeams(teams || [])
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load map data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [supabase])

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Get nearest teams for a disaster
  const getNearestTeams = (disasterLat: number, disasterLng: number) => {
    return rescueTeams
      .map((team) => ({
        ...team,
        distance: calculateDistance(disasterLat, disasterLng, team.latitude, team.longitude),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Loading live map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 pb-8">
      <div className="w-full px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <AlertTriangle className="h-6 w-6 sm:h-7 sm:w-7 text-red-600 flex-shrink-0" />
            <h1 className="text-2xl sm:text-3xl font-bold text-red-600">Live Disaster Map</h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">Real-time disasters & rescue teams in Jammu</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Map Section */}
          <Card className="border-red-200 overflow-hidden">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl">Interactive Map</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Red = Disasters | Blue = Teams | Green = You
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              <div className="aspect-video w-full overflow-hidden rounded-md border bg-gray-100">
                <iframe
                  title="Live disaster and rescue map"
                  src={`https://www.google.com/maps?q=Jammu&ll=${JAMMU_CENTER.lat},${JAMMU_CENTER.lng}&z=13&output=embed`}
                  className="h-full w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-3">Updates every 30 seconds</p>
            </CardContent>
          </Card>

          {/* Legend */}
          <Card className="border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full flex-shrink-0" />
                <span className="text-xs sm:text-sm">Active Disasters ({disasterReports.length})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded-full flex-shrink-0" />
                <span className="text-xs sm:text-sm">Rescue Teams ({rescueTeams.length})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full flex-shrink-0" />
                <span className="text-xs sm:text-sm">Your Location</span>
              </div>
            </CardContent>
          </Card>

          {/* Active Disasters */}
          <Card className="border-red-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">Active Disasters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3">
              {disasterReports.length === 0 ? (
                <p className="text-xs sm:text-sm text-muted-foreground">No active disasters reported</p>
              ) : (
                disasterReports.map((report, idx) => (
                  <div key={report.id} className="border-l-4 border-red-500 pl-3 py-2 sm:py-3">
                    <button
                      onClick={() => setExpandedDisaster(expandedDisaster === report.id ? null : report.id)}
                      className="w-full text-left hover:opacity-80 transition-opacity"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <Badge className="bg-red-600 mb-1 text-xs">D{idx + 1}</Badge>
                          <p className="text-xs text-muted-foreground">
                            {new Date(report.created_at).toLocaleTimeString()}
                          </p>
                          <p className="text-xs sm:text-sm font-medium mt-1 line-clamp-2">
                            {report.ai_analysis?.split("\n")[0]}
                          </p>
                        </div>
                        {expandedDisaster === report.id ? (
                          <ChevronUp className="h-4 w-4 flex-shrink-0 mt-1" />
                        ) : (
                          <ChevronDown className="h-4 w-4 flex-shrink-0 mt-1" />
                        )}
                      </div>
                    </button>

                    {expandedDisaster === report.id && (
                      <div className="mt-3 pt-3 border-t space-y-2">
                        {report.location_lat && report.location_lng && (
                          <>
                            <p className="text-xs text-blue-600">
                              📍 {report.location_lat.toFixed(4)}, {report.location_lng.toFixed(4)}
                            </p>
                            <div>
                              <p className="text-xs font-semibold mb-2">Nearest Teams:</p>
                              <div className="space-y-1">
                                {getNearestTeams(report.location_lat, report.location_lng).map((team) => (
                                  <div key={team.id} className="text-xs bg-blue-50 p-2 rounded">
                                    <p className="font-medium">{team.team_name}</p>
                                    <p className="text-blue-600">{team.distance.toFixed(1)} km away</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Rescue Teams Directory */}
          <Card className="border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">Rescue Teams</CardTitle>
              <CardDescription className="text-xs sm:text-sm">All active teams in Jammu</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {rescueTeams.map((team) => (
                <div key={team.id} className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                  <button
                    onClick={() => setExpandedTeam(expandedTeam === team.id ? null : team.id)}
                    className="w-full text-left"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-xs sm:text-sm">{team.team_name}</h3>
                        <Badge variant="outline" className="text-xs mt-1">
                          {team.team_type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full" />
                        {expandedTeam === team.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  </button>

                  {expandedTeam === team.id && (
                    <div className="mt-3 pt-3 border-t space-y-2">
                      <p className="text-xs text-muted-foreground">{team.description}</p>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-3 w-3 text-blue-600 flex-shrink-0 mt-0.5" />
                          <span className="break-words">{team.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-green-600 flex-shrink-0" />
                          <a href={`tel:${team.phone}`} className="text-blue-600 hover:underline break-all">
                            {team.phone}
                          </a>
                        </div>
                        {team.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3 text-orange-600 flex-shrink-0" />
                            <a href={`mailto:${team.email}`} className="text-blue-600 hover:underline break-all">
                              {team.email}
                            </a>
                          </div>
                        )}
                      </div>
                      <Button
                        asChild
                        size="sm"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm h-8 sm:h-9"
                      >
                        <a
                          href={`https://www.google.com/maps/search/${encodeURIComponent(team.team_name)}/@${team.latitude},${team.longitude},15z`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Navigation className="h-3 w-3 mr-1" />
                          Navigate
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
