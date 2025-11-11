"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, AlertTriangle, FileText, Radio, MapPin, Map, AlertCircle } from "lucide-react"
import Link from "next/link"
import { SOSButtonModal } from "@/components/sos-button-modal"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [isSOSOpen, setIsSOSOpen] = useState(false)

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        redirect("/auth/login")
      }
      setUser(user)
    }

    checkUser()
  }, [])

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 pb-8">
      <div className="w-full px-4 py-4 sm:py-6 bg-red-600 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h2 className="text-white font-semibold text-xs sm:text-sm">Emergency? Need Help Immediately?</h2>
          <Button
            onClick={() => setIsSOSOpen(true)}
            className="bg-white text-red-600 hover:bg-red-50 font-bold animate-pulse text-xs sm:text-sm h-8 sm:h-10 px-3 sm:px-4"
          >
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
            SOS
          </Button>
        </div>
      </div>

      <div className="w-full px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-red-600 mb-2">Dashboard</h1>
          <p className="text-xs sm:text-base text-muted-foreground">Welcome back, {user.email}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="border-red-200 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 bg-red-100 rounded-lg flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-sm sm:text-base">Report Emergency</CardTitle>
                  <CardDescription className="text-xs">Upload disaster photos</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-red-600 hover:bg-red-700 text-xs sm:text-sm h-8 sm:h-9">
                <Link href="/dashboard/report">Report Now</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-orange-200 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 bg-orange-100 rounded-lg flex-shrink-0">
                  <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-sm sm:text-base">Emergency Contacts</CardTitle>
                  <CardDescription className="text-xs">View rescue team numbers</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                asChild
                variant="outline"
                className="w-full border-orange-600 text-orange-600 hover:bg-orange-50 bg-transparent text-xs sm:text-sm h-8 sm:h-9"
              >
                <Link href="/dashboard/contacts">View Contacts</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg flex-shrink-0">
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-sm sm:text-base">My Reports</CardTitle>
                  <CardDescription className="text-xs">View your submissions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                asChild
                variant="outline"
                className="w-full border-yellow-600 text-yellow-600 hover:bg-yellow-50 bg-transparent text-xs sm:text-sm h-8 sm:h-9"
              >
                <Link href="/dashboard/reports">View Reports</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-purple-200 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 bg-purple-100 rounded-lg flex-shrink-0">
                  <Radio className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-sm sm:text-base">Dispatch Center</CardTitle>
                  <CardDescription className="text-xs">Active rescue operations</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                asChild
                variant="outline"
                className="w-full border-purple-600 text-purple-600 hover:bg-purple-50 bg-transparent text-xs sm:text-sm h-8 sm:h-9"
              >
                <Link href="/dashboard/dispatch">View Dispatches</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-green-200 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 bg-green-100 rounded-lg flex-shrink-0">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-green-700" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-sm sm:text-base">Nearest Camps</CardTitle>
                  <CardDescription className="text-xs">Find rescue camps on map</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                asChild
                variant="outline"
                className="w-full border-green-700 text-green-700 hover:bg-green-50 bg-transparent text-xs sm:text-sm h-8 sm:h-9"
              >
                <Link href="/dashboard/camps">Open Map</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-blue-200 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 bg-blue-100 rounded-lg flex-shrink-0">
                  <Map className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-sm sm:text-base">Live Disaster Map</CardTitle>
                  <CardDescription className="text-xs">Real-time disasters & teams</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm h-8 sm:h-9">
                <Link href="/dashboard/live-map">View Map</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <SOSButtonModal isOpen={isSOSOpen} onClose={() => setIsSOSOpen(false)} />
    </div>
  )
}
