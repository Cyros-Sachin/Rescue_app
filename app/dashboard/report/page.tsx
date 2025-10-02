"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Upload, Camera, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function ReportPage() {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [locationAddress, setLocationAddress] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!imageFile) {
        throw new Error("Please select an image")
      }

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Upload image to Blob storage
      const formData = new FormData()
      formData.append("file", imageFile)

      const uploadResponse = await fetch("/api/upload-disaster-image", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image")
      }

      const { url: imageUrl } = await uploadResponse.json()

      // Get user's location (optional)
      let locationLat = null
      let locationLng = null

      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject)
          })
          locationLat = position.coords.latitude
          locationLng = position.coords.longitude
        } catch (geoError) {
          console.log("Location access denied or unavailable")
        }
      }

      // Analyze image with AI
      const analysisResponse = await fetch("/api/analyze-disaster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      })

      if (!analysisResponse.ok) {
        throw new Error("Failed to analyze image")
      }

      const { analysis, assignedTeam } = await analysisResponse.json()

      // Create disaster report in database
      const { error: dbError } = await supabase.from("disaster_reports").insert({
        user_id: user.id,
        image_url: imageUrl,
        location_lat: locationLat,
        location_lng: locationLng,
        location_address: locationAddress || null,
        ai_analysis: analysis,
        assigned_team: assignedTeam,
        status: "assigned",
      })

      if (dbError) throw dbError

      setSuccess(true)
      setTimeout(() => {
        router.push("/dashboard/reports")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-green-200">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Report Submitted Successfully</h2>
            <p className="text-muted-foreground mb-4">
              Your disaster report has been analyzed and the appropriate rescue team has been notified.
            </p>
            <Button onClick={() => router.push("/dashboard/reports")} className="bg-red-600 hover:bg-red-700">
              View My Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>

          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-3xl text-red-600">Report Disaster</CardTitle>
              <CardDescription>Upload a photo of the disaster scene for AI analysis and team dispatch</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="image">Disaster Photo *</Label>
                  <div className="border-2 border-dashed border-red-200 rounded-lg p-8 text-center hover:border-red-400 transition-colors">
                    {imagePreview ? (
                      <div className="space-y-4">
                        <div className="relative w-full h-64 rounded-lg overflow-hidden">
                          <Image src={imagePreview || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setImageFile(null)
                            setImagePreview(null)
                          }}
                          className="border-red-600 text-red-600 hover:bg-red-50 bg-transparent"
                        >
                          Change Image
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Camera className="h-16 w-16 text-red-300 mx-auto" />
                        <div>
                          <Label
                            htmlFor="image"
                            className="cursor-pointer text-red-600 hover:text-red-700 font-semibold"
                          >
                            Click to upload
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">or drag and drop</p>
                        </div>
                        <Input
                          id="image"
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleImageChange}
                          className="hidden"
                          required
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location Details (Optional)</Label>
                  <Textarea
                    id="location"
                    placeholder="Enter address or landmark details..."
                    value={locationAddress}
                    onChange={(e) => setLocationAddress(e.target.value)}
                    rows={3}
                  />
                  <p className="text-sm text-muted-foreground">
                    We'll automatically detect your GPS location if available
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Alert className="border-blue-200 bg-blue-50">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-900">
                    Our AI will analyze the image to determine the type of disaster and automatically assign the
                    appropriate rescue team (NDRF, NCC, Fire, Police, or Medical).
                  </AlertDescription>
                </Alert>

                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing & Submitting...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Submit Report
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
