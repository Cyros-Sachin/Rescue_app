import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { disasterType, latitude, longitude } = await request.json()

    console.log("[v0] SOS Alert received:", {
      userId: user.id,
      disasterType,
      latitude,
      longitude,
    })

    // Save SOS alert to database
    const { data: sosAlert, error: sosError } = await supabase
      .from("sos_alerts")
      .insert({
        user_id: user.id,
        disaster_type: disasterType,
        location_lat: latitude,
        location_lng: longitude,
        status: "active",
      })
      .select()
      .single()

    if (sosError) {
      console.error("[v0] Error saving SOS alert:", sosError)
      return NextResponse.json({ error: "Failed to save SOS alert" }, { status: 500 })
    }

    console.log("[v0] SOS Alert saved:", sosAlert)

    // Fetch all rescue teams from database
    const { data: teams, error: teamsError } = await supabase.from("rescue_teams").select("*").eq("is_active", true)

    if (teamsError) {
      console.error("[v0] Error fetching teams:", teamsError)
      return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 })
    }

    console.log("[v0] Teams fetched for notification:", teams)

    // Get user profile for contact info
    const { data: userProfile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    // Here you would send notifications to rescue teams
    // For now, we'll log the information
    const notificationData = {
      sosAlertId: sosAlert.id,
      userId: user.id,
      userEmail: user.email,
      userPhone: userProfile?.phone,
      disasterType,
      location: {
        latitude,
        longitude,
        address: "Jammu Region",
      },
      teams: teams?.map((team) => ({
        id: team.id,
        name: team.name,
        type: team.type,
        phone: team.phone,
        email: team.email,
      })),
      timestamp: new Date().toISOString(),
    }

    console.log("[v0] Sending notifications to teams:", JSON.stringify(notificationData, null, 2))

    // TODO: Integrate with actual notification service (email, SMS, push notifications)
    // For now, we're logging the data that would be sent to teams

    return NextResponse.json({
      success: true,
      message: "SOS alert sent to rescue teams",
      sosAlertId: sosAlert.id,
      teamsNotified: teams?.length || 0,
    })
  } catch (error) {
    console.error("[v0] SOS Alert API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
