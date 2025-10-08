"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Crosshair, AlertTriangle } from "lucide-react"

// Simple location state
type Loc = { lat: number; lng: number }

// Default to New Delhi if permission denied
const DEFAULT_LOC: Loc = { lat: 28.6139, lng: 77.209 }

export default function CampsPage() {
  const [loc, setLoc] = useState<Loc | null>(null)
  const [status, setStatus] = useState<"idle" | "locating" | "ready" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [query, setQuery] = useState("rescue camp")

  const requestLocation = () => {
    setStatus("locating")
    setErrorMsg(null)
    if (!("geolocation" in navigator)) {
      setStatus("error")
      setErrorMsg("Geolocation is not supported by your browser.")
      setLoc(DEFAULT_LOC)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setLoc({ lat: latitude, lng: longitude })
        setStatus("ready")
      },
      (err) => {
        console.log("[v0] Geolocation error:", err?.message)
        // Fallback to default but still functional
        setLoc(DEFAULT_LOC)
        setErrorMsg("Using default location due to permission or accuracy issue.")
        setStatus("ready")
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
    )
  }

  useEffect(() => {
    requestLocation()
  }, [])

  // Build an embeddable Google Maps search centered on location
  const embedSrc = useMemo(() => {
    const center = loc ? `${loc.lat},${loc.lng}` : `${DEFAULT_LOC.lat},${DEFAULT_LOC.lng}`
    const q = encodeURIComponent(`${query} near ${center}`)
    return `https://www.google.com/maps?q=${q}&ll=${center}&z=14&output=embed`
  }, [loc, query])

  const openInMapsUrl = useMemo(() => {
    const center = loc ? `${loc.lat},${loc.lng}` : `${DEFAULT_LOC.lat},${DEFAULT_LOC.lng}`
    const q = encodeURIComponent(`${query}`)
    return `https://www.google.com/maps/search/${q}/@${center},14z`
  }, [loc, query])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-7 w-7 text-red-600" />
            <h1 className="text-3xl font-bold text-red-600">Nearest Rescue Camps</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Find nearby rescue camps and shelters on a live map. We’ll use your current location for accuracy.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2 border-red-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Live Map</CardTitle>
                  <CardDescription>Showing results near your current location</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={requestLocation}
                    className="border-red-600 text-red-600 hover:bg-red-50 bg-transparent"
                  >
                    <Crosshair className="h-4 w-4 mr-2" />
                    Refresh Location
                  </Button>
                  <Button asChild className="bg-red-600 hover:bg-red-700">
                    <a href={openInMapsUrl} target="_blank" rel="noreferrer">
                      Open in Google Maps
                    </a>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="aspect-video w-full overflow-hidden rounded-md border">
                <iframe
                  title="Nearest rescue camps map"
                  aria-label="Map showing nearest rescue camps"
                  src={embedSrc}
                  className="h-full w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              {errorMsg ? (
                <p className="mt-3 text-sm text-amber-700">{errorMsg}</p>
              ) : status === "locating" ? (
                <p className="mt-3 text-sm text-muted-foreground">Locating…</p>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle>Search Filters</CardTitle>
              <CardDescription>Change the nearby search type</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button
                variant={query === "rescue camp" ? "default" : "outline"}
                onClick={() => setQuery("rescue camp")}
                className={
                  query === "rescue camp"
                    ? "bg-red-600 hover:bg-red-700"
                    : "border-red-600 text-red-600 hover:bg-red-50"
                }
              >
                Rescue Camps
              </Button>
              <Button
                variant={query === "relief center" ? "default" : "outline"}
                onClick={() => setQuery("relief center")}
                className={
                  query === "relief center"
                    ? "bg-red-600 hover:bg-red-700"
                    : "border-red-600 text-red-600 hover:bg-red-50"
                }
              >
                Relief Centers
              </Button>
              <Button
                variant={query === "shelter" ? "default" : "outline"}
                onClick={() => setQuery("shelter")}
                className={
                  query === "shelter" ? "bg-red-600 hover:bg-red-700" : "border-red-600 text-red-600 hover:bg-red-50"
                }
              >
                Shelters
              </Button>
              <div className="mt-4 rounded-md bg-orange-50 p-3 text-sm text-orange-800 flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5" />
                <p>
                  For turn-by-turn navigation, use Open in Google Maps. Results update live as your location changes
                  when you refresh.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
