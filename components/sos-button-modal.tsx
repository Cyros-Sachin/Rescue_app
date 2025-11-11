"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, X } from "lucide-react"
import { useCallback } from "react"

const DISASTER_TYPES = [
  { id: "flood", label: "Flood", icon: "🌊" },
  { id: "earthquake", label: "Earthquake", icon: "🏚️" },
  { id: "fire", label: "Fire", icon: "🔥" },
  { id: "landslide", label: "Landslide", icon: "⛰️" },
  { id: "accident", label: "Accident", icon: "🚗" },
  { id: "medical", label: "Medical Emergency", icon: "⚕️" },
  { id: "other", label: "Other Disaster", icon: "⚠️" },
]

interface SOSButtonModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SOSButtonModal({ isOpen, onClose }: SOSButtonModalProps) {
  const [selectedDisaster, setSelectedDisaster] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSOSSubmit = useCallback(async () => {
    if (!selectedDisaster) {
      setError("Please select a disaster type")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Get user's location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords

            const response = await fetch("/api/send-sos-alert", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                disasterType: selectedDisaster,
                latitude,
                longitude,
              }),
            })

            if (!response.ok) {
              const errorData = await response.json()
              throw new Error(errorData.error || "Failed to send SOS alert")
            }

            setSuccess(true)
            setTimeout(() => {
              onClose()
              setSuccess(false)
              setSelectedDisaster(null)
            }, 2000)
          },
          () => {
            setError("Unable to get your location. Please enable location services.")
            setIsLoading(false)
          },
        )
      } else {
        setError("Geolocation not supported by your browser")
        setIsLoading(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send SOS alert")
      setIsLoading(false)
    }
  }, [selectedDisaster, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-red-600 text-white p-4 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8" />
            <h2 className="text-lg sm:text-xl font-bold">SOS Emergency Alert</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-red-700 rounded transition-colors">
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">✓</div>
              <p className="text-green-600 font-semibold text-sm sm:text-base">SOS Alert Sent Successfully!</p>
              <p className="text-gray-600 text-xs sm:text-sm mt-2">
                Rescue teams have been notified and are heading to your location.
              </p>
            </div>
          ) : (
            <>
              <p className="text-gray-700 mb-4 text-xs sm:text-sm">
                Select the type of disaster. Emergency teams in Jammu will be notified immediately with your exact
                location.
              </p>

              {/* Disaster Type Selection */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4">
                {DISASTER_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setSelectedDisaster(type.id)
                      setError(null)
                    }}
                    className={`p-3 sm:p-4 rounded-lg border-2 transition-all text-xs sm:text-sm font-medium ${
                      selectedDisaster === type.id
                        ? "border-red-600 bg-red-50 text-red-600"
                        : "border-gray-300 bg-gray-50 text-gray-700 hover:border-red-300"
                    }`}
                  >
                    <div className="text-xl sm:text-2xl mb-1">{type.icon}</div>
                    {type.label}
                  </button>
                ))}
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-xs sm:text-sm">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 sm:gap-3">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 text-xs sm:text-sm h-8 sm:h-10 bg-transparent"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSOSSubmit}
                  disabled={!selectedDisaster || isLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm h-8 sm:h-10"
                >
                  {isLoading ? "Sending..." : "Send SOS Alert"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
