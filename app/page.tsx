import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, Phone, MapPin, Users } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <AlertTriangle className="h-16 w-16 text-red-600" />
            <h1 className="text-6xl font-bold text-red-600">RescueAlert</h1>
          </div>
          <p className="text-2xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
            Fast, AI-powered disaster response system connecting you with the right rescue teams instantly
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="bg-red-600 hover:bg-red-700 text-lg px-8 py-6">
              <Link href="/auth/signup">Get Started</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-50 text-lg px-8 py-6 bg-transparent"
            >
              <Link href="/auth/login">Login</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="border-red-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-4 bg-red-100 rounded-full">
                  <Phone className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold">Emergency Contacts</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Access verified emergency contact numbers for NDRF, NCC, Fire, Police, and Medical services
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-4 bg-orange-100 rounded-full">
                  <MapPin className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold">AI-Powered Analysis</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Upload disaster photos and our AI determines which rescue team to dispatch automatically
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-4 bg-yellow-100 rounded-full">
                  <Users className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold">Quick Dispatch</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Teams receive location and shortest route information for rapid response
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <Card className="max-w-2xl mx-auto bg-red-600 border-red-700">
            <CardContent className="pt-8 pb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Every Second Counts in an Emergency</h2>
              <p className="text-red-100 mb-6 text-lg leading-relaxed">
                Join RescueAlert today and help save lives with faster, smarter disaster response
              </p>
              <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
                <Link href="/auth/signup">Create Free Account</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
