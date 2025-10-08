import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, AlertTriangle, FileText, Radio, MapPin } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-red-600 mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.email}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="border-red-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <CardTitle>Report Emergency</CardTitle>
                  <CardDescription>Upload disaster photos</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-red-600 hover:bg-red-700">
                <Link href="/dashboard/report">Report Now</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-orange-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Phone className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <CardTitle>Emergency Contacts</CardTitle>
                  <CardDescription>View rescue team numbers</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                asChild
                variant="outline"
                className="w-full border-orange-600 text-orange-600 hover:bg-orange-50 bg-transparent"
              >
                <Link href="/dashboard/contacts">View Contacts</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <FileText className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <CardTitle>My Reports</CardTitle>
                  <CardDescription>View your submissions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                asChild
                variant="outline"
                className="w-full border-yellow-600 text-yellow-600 hover:bg-yellow-50 bg-transparent"
              >
                <Link href="/dashboard/reports">View Reports</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-purple-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Radio className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle>Dispatch Center</CardTitle>
                  <CardDescription>Active rescue operations</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                asChild
                variant="outline"
                className="w-full border-purple-600 text-purple-600 hover:bg-purple-50 bg-transparent"
              >
                <Link href="/dashboard/dispatch">View Dispatches</Link>
              </Button>
            </CardContent>
          </Card>

          {/* New card for Nearest Camps */}
          <Card className="border-green-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <MapPin className="h-6 w-6 text-green-700" />
                </div>
                <div>
                  <CardTitle>Nearest Camps</CardTitle>
                  <CardDescription>Find rescue camps on map</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                asChild
                variant="outline"
                className="w-full border-green-700 text-green-700 hover:bg-green-50 bg-transparent"
              >
                <Link href="/dashboard/camps">Open Map</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
