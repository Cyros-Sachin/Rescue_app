import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, Mail, ArrowLeft, Shield, Flame, Ambulance, Users, AlertTriangle } from "lucide-react"
import Link from "next/link"

const teamIcons = {
  NDRF: Shield,
  NCC: Users,
  Fire: Flame,
  Police: Shield,
  Medical: Ambulance,
  Other: AlertTriangle,
}

export default async function ContactsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: contacts, error } = await supabase
    .from("emergency_contacts")
    .select("*")
    .eq("is_active", true)
    .order("team_type")

  if (error) {
    console.error("Error fetching contacts:", error)
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
          <h1 className="text-4xl font-bold text-red-600 mb-2">Emergency Contacts</h1>
          <p className="text-muted-foreground">Quick access to all rescue and emergency services</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {contacts?.map((contact) => {
            const IconComponent = teamIcons[contact.team_type as keyof typeof teamIcons] || AlertTriangle
            return (
              <Card key={contact.id} className="border-red-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-100 rounded-lg">
                      <IconComponent className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-xl">{contact.team_name}</CardTitle>
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                          {contact.team_type}
                        </span>
                      </div>
                      <CardDescription className="leading-relaxed">{contact.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="h-5 w-5 text-red-600" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <a href={`tel:${contact.phone}`} className="text-lg font-semibold text-red-600 hover:underline">
                          {contact.phone}
                        </a>
                      </div>
                      <Button asChild size="sm" className="bg-red-600 hover:bg-red-700">
                        <a href={`tel:${contact.phone}`}>Call Now</a>
                      </Button>
                    </div>
                    {contact.email && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Mail className="h-5 w-5 text-orange-600" />
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground">Email</p>
                          <a
                            href={`mailto:${contact.email}`}
                            className="text-sm font-medium text-orange-600 hover:underline"
                          >
                            {contact.email}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {!contacts || contacts.length === 0 ? (
          <Card className="border-yellow-200">
            <CardContent className="pt-6 text-center">
              <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
              <p className="text-muted-foreground">No emergency contacts available at the moment.</p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  )
}
