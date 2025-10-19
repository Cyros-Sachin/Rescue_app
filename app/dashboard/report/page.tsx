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
import { ArrowLeft, Upload, Camera, AlertCircle, CheckCircle, Loader2, MapPin } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function ReportPage() {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [locationAddress, setLocationAddress] = useState("")
  const [locationLat, setLocationLat] = useState<number | null>(null)
  const [locationLng, setLocationLng] = useState<number | null>(null)
  const [locationStatus, setLocationStatus] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const getLocation = () => {
    setLocationStatus("Getting location...")
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationLat(position.coords.latitude)
          setLocationLng(position.coords.longitude)
          setLocationStatus(
            `Location captured: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
          )
        },
        (error) => {
          console.error("Geolocation error:", error)
          setLocationStatus("Unable to get location. Please enable location services.")
        },
      )
    } else {
      setLocationStatus("Geolocation is not supported by your browser.")
    }
  }

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

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const formData = new FormData()
      formData.append("file", imageFile)
      if (locationLat) formData.append("latitude", locationLat.toString())
      if (locationLng) formData.append("longitude", locationLng.toString())

      const uploadResponse = await fetch("/api/upload-disaster-image", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image")
      }

      const uploadData = await uploadResponse.json()
      const imageUrl = uploadData.url

      const finalLat = locationLat
      const finalLng = locationLng

      const analysisResponse = await fetch("/api/analyze-disaster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      })

      if (!analysisResponse.ok) {
        throw new Error("Failed to analyze image")
      }

      const { analysis, assignedTeams, disasterType, severity } = await analysisResponse.json()

      const { error: dbError } = await supabase.from("disaster_reports").insert({
        user_id: user.id,
        image_url: imageUrl,
        location_lat: finalLat,
        location_lng: finalLng,
        location_address: locationAddress || null,
        ai_analysis: analysis,
        assigned_team: assignedTeams?.join(", ") || "Unassigned",
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
            <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Report Submitted</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4">
              Your disaster report has been analyzed and rescue teams have been notified.
            </p>
            <Button onClick={() => router.push("/dashboard/reports")} className="bg-red-600 hover:bg-red-700 w-full">
              View My Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 pb-8">
      <div className="w-full px-4 py-6 sm:py-8">
        <div className="max-w-2xl mx-auto">
          <Button asChild variant="ghost" className="mb-4 text-xs sm:text-sm">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>

          <Card className="border-red-200">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="text-2xl sm:text-3xl text-red-600">Report Disaster</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Upload a photo for AI analysis and team dispatch
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="image" className="text-xs sm:text-sm">
                    Disaster Photo *
                  </Label>
                  <div className="border-2 border-dashed border-red-200 rounded-lg p-4 sm:p-8 text-center hover:border-red-400 transition-colors">
                    {imagePreview ? (
                      <div className="space-y-3 sm:space-y-4">
                        <div className="relative w-full h-48 sm:h-64 rounded-lg overflow-hidden">
                          <Image src={imagePreview || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setImageFile(null)
                            setImagePreview(null)
                          }}
                          className="border-red-600 text-red-600 hover:bg-red-50 bg-transparent w-full text-xs sm:text-sm"
                        >
                          Change Image
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3 sm:space-y-4">
                        <Camera className="h-12 w-12 sm:h-16 sm:w-16 text-red-300 mx-auto" />
                        <div>
                          <Label
                            htmlFor="image"
                            className="cursor-pointer text-red-600 hover:text-red-700 font-semibold text-xs sm:text-sm"
                          >
                            Click to upload
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">or drag and drop</p>
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
                  <Label className="flex items-center gap-2 text-xs sm:text-sm">
                    <MapPin className="h-4 w-4 text-red-600 flex-shrink-0" />
                    Location Information
                  </Label>
                  <Button
                    type="button"
                    onClick={getLocation}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm h-9 sm:h-10"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Capture Current Location
                  </Button>
                  {locationStatus && (
                    <p className="text-xs text-blue-600 bg-blue-50 p-2 sm:p-3 rounded">{locationStatus}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-xs sm:text-sm">
                    Additional Location Details (Optional)
                  </Label>
                  <Textarea
                    id="location"
                    placeholder="Enter address, landmark, or additional details..."
                    value={locationAddress}
                    onChange={(e) => setLocationAddress(e.target.value)}
                    rows={3}
                    className="text-xs sm:text-sm"
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs sm:text-sm">{error}</AlertDescription>
                  </Alert>
                )}

                <Alert className="border-blue-200 bg-blue-50">
                  <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <AlertDescription className="text-xs sm:text-sm text-blue-900">
                    Our AI will analyze the image to determine the disaster type and automatically assign the
                    appropriate rescue teams. Your location will be geotagged and shared with teams.
                  </AlertDescription>
                </Alert>

                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-xs sm:text-sm h-9 sm:h-10"
                  disabled={isLoading}
                >
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
