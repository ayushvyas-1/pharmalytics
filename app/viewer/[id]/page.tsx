// page.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Maximize, Minimize } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter, useSearchParams, useParams } from "next/navigation"
import { getPresentationData, startPresentationSession, endPresentationSession } from "@/app/actions"
import { getDoctors, getPresentations, getFirstDoctor, getFirstPresentation } from "@/lib/db"
import type { Slide } from "@/lib/db"
import Image from "next/image"

// Declare formatTime function
const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}

export default function ViewerPage({ params }: { params: { id: string } }) {
  const routerParams = useParams() as { id: string }
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPresenting, setIsPresenting] = useState(false)
  const [doctorId, setDoctorId] = useState("")
  const [sessionStarted, setSessionStarted] = useState(false)
  const [slideStartTime, setSlideStartTime] = useState<number>(0)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessionData, setSessionData] = useState<Array<{ slideId: string; timeSpent: number }>>([])
  const [slides, setSlides] = useState<Slide[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [presentationId, setPresentationId] = useState<string>(routerParams.id)
  const [totalSessionTime, setTotalSessionTime] = useState(0)
  const [sessionInterval, setSessionInterval] = useState<NodeJS.Timeout | null>(null)
  const [currentSlideTimeSpent, setCurrentSlideTimeSpent] = useState(0)
  const [slideTimeInterval, setSlideTimeInterval] = useState<NodeJS.Timeout | null>(null)
  const [presentation, setPresentation] = useState<any>(null)
  const [doctors, setDoctors] = useState<any[]>([])
  const [presentations, setPresentations] = useState<any[]>([])

  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const slideStartTimeRef = useRef<number>(0)
  const presentationRef = useRef<HTMLDivElement>(null)
  const totalSessionTimeRef = useRef<number>(0)

  // Load doctors and presentations once
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [doctorsData, presentationsData] = await Promise.all([
          getDoctors(),
          getPresentations()
        ])
        setDoctors(doctorsData)
        setPresentations(presentationsData)
      } catch (error) {
        console.error('Error loading initial data:', error)
      }
    }
    loadInitialData()
  }, [])

  // Check if the presentation ID exists, if not, use the first presentation
  useEffect(() => {
    if (presentations.length === 0) return

    const presentationExists = presentations.some((p) => p.id === routerParams.id)

    if (!presentationExists && presentations.length > 0) {
      const firstPresentation = presentations[0]
      setPresentationId(firstPresentation.id)

      toast({
        title: "Presentation not found",
        description: `Using ${firstPresentation.title} instead`,
        variant: "destructive",
      })
    } else {
      setPresentationId(routerParams.id)
    }
  }, [routerParams.id, presentations, toast])

  // Check for doctorId in query params
  useEffect(() => {
    if (doctors.length === 0) return

    const queryDoctorId = searchParams.get("doctorId")
    if (queryDoctorId) {
      setDoctorId(queryDoctorId)
    } else if (doctors.length > 0) {
      setDoctorId(doctors[0].id)
    }
  }, [searchParams, doctors])

  // Fetch presentation data
  useEffect(() => {
    if (!presentationId) return

    async function fetchData() {
      setLoading(true)
      try {
        const result = await getPresentationData(presentationId)

        if (result.success) {
          setSlides(result.slides)
          setPresentation(result.presentation)
          setError(null)
        } else {
          const firstPresentation = await getFirstPresentation()
          if (firstPresentation && firstPresentation.id !== presentationId) {
            setPresentationId(firstPresentation.id)
            toast({
              title: "Using default presentation",
              description: `Switched to ${firstPresentation.title}`,
              variant: "destructive",
            })
          } else {
            setError(result.message || "Failed to load presentation")
            toast({
              title: "Error",
              description: result.message || "Failed to load presentation",
              variant: "destructive",
            })
          }
        }
      } catch (error) {
        console.error('Error fetching presentation:', error)
        setError('Failed to load presentation')
      }

      setLoading(false)
    }

    fetchData()
  }, [presentationId, toast])

  // Track slide viewing time with precise timing
  useEffect(() => {
    if (sessionStarted && isPresenting && slides.length > 0) {
      setCurrentSlideTimeSpent(0)
      const now = Date.now()
      slideStartTimeRef.current = now
      setSlideStartTime(now)

      if (slideTimeInterval) {
        clearInterval(slideTimeInterval)
      }

      const interval = setInterval(() => {
        const elapsed = (Date.now() - slideStartTimeRef.current) / 1000
        setCurrentSlideTimeSpent(elapsed)
      }, 100)

      setSlideTimeInterval(interval)

      return () => {
        clearInterval(interval)
      }
    }
  }, [currentSlide, sessionStarted, isPresenting, slides.length])

  // Track total session time with precise timing
  useEffect(() => {
    if (sessionStarted && isPresenting) {
      if (sessionInterval) clearInterval(sessionInterval)

      const interval = setInterval(() => {
        totalSessionTimeRef.current += 0.1
        setTotalSessionTime(totalSessionTimeRef.current)
      }, 100)

      setSessionInterval(interval)

      return () => {
        clearInterval(interval)
      }
    } else if (sessionInterval) {
      clearInterval(sessionInterval)
    }
  }, [sessionStarted, isPresenting])

  // Handle fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "f" || e.key === "F") {
        toggleFullscreen()
      } else if (e.key === "ArrowRight") {
        nextSlide()
      } else if (e.key === "ArrowLeft") {
        prevSlide()
      } else if (e.key === "Escape" && fullscreen) {
        setFullscreen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [fullscreen, currentSlide])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sessionInterval) clearInterval(sessionInterval)
      if (slideTimeInterval) clearInterval(slideTimeInterval)
    }
  }, [sessionInterval, slideTimeInterval])

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen)
  }

  const recordSlideTime = (slideIndex: number) => {
    if (slideStartTimeRef.current > 0 && slides.length > slideIndex && slides[slideIndex]) {
      const timeSpent = Date.now() - slideStartTimeRef.current
      const slideId = slides[slideIndex].id

      console.log(`Recording time for slide ${slideIndex} (${slideId}): ${timeSpent}ms`)

      setSessionData((prev) => {
        const existingIndex = prev.findIndex((item) => item.slideId === slideId)

        if (existingIndex >= 0) {
          const updated = [...prev]
          updated[existingIndex] = {
            slideId: slideId,
            timeSpent: prev[existingIndex].timeSpent + timeSpent,
          }
          console.log(`Updated existing slide data:`, updated[existingIndex])
          return updated
        } else {
          const newEntry = { slideId: slideId, timeSpent }
          console.log(`Added new slide data:`, newEntry)
          return [...prev, newEntry]
        }
      })
    }
  }

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      recordSlideTime(currentSlide)
      setCurrentSlide(currentSlide + 1)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      recordSlideTime(currentSlide)
      setCurrentSlide(currentSlide - 1)
    }
  }

  const startSession = async () => {
    if (!doctorId) {
      const firstDoctor = await getFirstDoctor()
      if (firstDoctor) {
        setDoctorId(firstDoctor.id)
      } else {
        toast({
          title: "Doctor selection required",
          description: "No doctors available",
          variant: "destructive",
        })
        return
      }
    }

    const doctorExists = doctors.some((d) => d.id === doctorId)
    if (!doctorExists) {
      const firstDoctor = await getFirstDoctor()
      if (firstDoctor) {
        setDoctorId(firstDoctor.id)
      } else {
        toast({
          title: "Error",
          description: "No valid doctors found",
          variant: "destructive",
        })
        return
      }
    }

    const result = await startPresentationSession(doctorId, presentationId)

    if (result.success) {
      setSessionId(result.sessionId)
      setSessionStarted(true)
      setIsPresenting(true)
      totalSessionTimeRef.current = 0
      setTotalSessionTime(0)
      setSessionData([])
      slideStartTimeRef.current = Date.now()
      setCurrentSlideTimeSpent(0)

      const doctor = doctors.find((d) => d.id === doctorId)

      toast({
        title: "Session started",
        description: `Presentation session started for ${doctor?.name || "doctor"}`,
      })
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to start session",
        variant: "destructive",
      })
    }
  }

  const endSession = async () => {
    if (!sessionId) return

    console.log("Starting endSession process...")
    recordSlideTime(currentSlide)

    await new Promise((resolve) => setTimeout(resolve, 200))

    setIsPresenting(false)

    if (sessionInterval) {
      clearInterval(sessionInterval)
      setSessionInterval(null)
    }

    if (slideTimeInterval) {
      clearInterval(slideTimeInterval)
      setSlideTimeInterval(null)
    }

    const finalSessionData = [...sessionData]
    const currentSlideTime = Date.now() - slideStartTimeRef.current
    if (currentSlideTime > 0 && slides[currentSlide]) {
      const currentSlideId = slides[currentSlide].id
      const existingIndex = finalSessionData.findIndex((item) => item.slideId === currentSlideId)

      if (existingIndex >= 0) {
        finalSessionData[existingIndex].timeSpent += currentSlideTime
      } else {
        finalSessionData.push({
          slideId: currentSlideId,
          timeSpent: currentSlideTime,
        })
      }
    }

    const slideAnalytics = finalSessionData.map((data) => ({
      sessionId,
      slideId: data.slideId,
      timeSpent: data.timeSpent,
    }))

    const result = await endPresentationSession(sessionId, slideAnalytics)

    if (result.success) {
      toast({
        title: "Presentation completed",
        description: `Analytics recorded for ${slideAnalytics.length} slides`,
      })

      setTimeout(() => {
        router.push("/analytics")
      }, 1500)
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to end presentation",
        variant: "destructive",
      })
    }
  }

  const resetSession = () => {
    setCurrentSlide(0)
    setIsPresenting(false)
    setSessionStarted(false)
    setDoctorId("")
    setSessionData([])
    slideStartTimeRef.current = 0
    setSessionId(null)
    totalSessionTimeRef.current = 0
    setTotalSessionTime(0)
    setCurrentSlideTimeSpent(0)

    if (sessionInterval) {
      clearInterval(sessionInterval)
      setSessionInterval(null)
    }

    if (slideTimeInterval) {
      clearInterval(slideTimeInterval)
      setSlideTimeInterval(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading presentation...</p>
        </div>
      </div>
    )
  }

  if (error || slides.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold mb-2">Error Loading Presentation</h1>
              <p className="text-muted-foreground">{error || "No slides found for this presentation"}</p>
            </div>

            {presentations.length > 0 && (
              <div className="mb-4">
                <h2 className="text-lg font-medium mb-2">Available Presentations:</h2>
                <div className="space-y-2">
                  {presentations.map((presentation) => (
                    <Button
                      key={presentation.id}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() =>
                        router.push(`/viewer/${presentation.id}${doctorId ? `?doctorId=${doctorId}` : ""}`)
                      }
                    >
                      {presentation.title}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={() => router.push("/presentations")} className="w-full">
              Return to Presentations
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!sessionStarted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold mb-2">Start Presentation</h1>
              <p className="text-muted-foreground">Ready to present to your patient?</p>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h2 className="font-medium text-lg mb-1">{presentation?.title || "Presentation"}</h2>
                <p className="text-sm text-muted-foreground">{presentation?.description || "Medical presentation"}</p>
                <p className="text-sm mt-2">{slides.length} slides</p>
              </div>

              <Button onClick={startSession} className="w-full">
                <Play className="h-4 w-4 mr-2" />
                Start Presentation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentSlideData = slides[currentSlide]
  const isExternalImage = currentSlideData.imageUrl.startsWith("/slides/")
  const slideProgress = ((currentSlide + 1) / slides.length) * 100

  return (
    <div
      className={`${fullscreen ? "fixed inset-0 z-50 bg-gray-900" : "min-h-screen bg-gray-900"} text-white`}
      ref={presentationRef}
    >
      {/* Header */}
      <div
        className={`bg-gray-800 p-2 sm:p-4 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 ${
          fullscreen ? "hidden" : ""
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="text-sm sm:text-base text-white font-medium">{presentation?.title || "Presentation"}</span>
          <span className="text-xs sm:text-sm text-gray-400">
            Slide {currentSlide + 1} of {slides.length}
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 justify-end">
          <Button variant="default" size="sm" onClick={() => setIsPresenting(!isPresenting)}>
            {isPresenting ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button variant="default" size="sm" onClick={toggleFullscreen}>
            {fullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
          <Button variant="default" size="sm" onClick={resetSession}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button variant="destructive" size="sm" onClick={endSession}>
            End
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className={`h-1 bg-gray-800 ${fullscreen ? "hidden" : ""}`}>
        <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${slideProgress}%` }}></div>
      </div>

      {/* Main Slide Area - Full width presentation */}
      <div className="flex-1 flex items-center justify-center p-2 sm:p-4 md:p-8">
        <div className="max-w-5xl w-full">
          {isExternalImage ? (
            <div className="relative w-full" style={{ height: fullscreen ? "85vh" : "70vh" }}>
              <Image
                src={currentSlideData.imageUrl || "/placeholder.svg"}
                alt={currentSlideData.title}
                fill
                style={{ objectFit: "contain" }}
                priority
              />
            </div>
          ) : (
            <Card className="bg-white text-black">
              <CardContent className="p-4 sm:p-8">
                <div className="text-center">
                  <img
                    src={currentSlideData.imageUrl || "/placeholder.svg"}
                    alt={currentSlideData.title}
                    className="w-full h-64 sm:h-96 object-cover rounded-lg mb-4 sm:mb-6"
                  />
                  <h2 className="text-xl sm:text-3xl font-bold mb-2 sm:mb-4">{currentSlideData.title}</h2>
                  <p className="text-sm sm:text-lg text-muted-foreground">{currentSlideData.content}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div
        className={`bg-gray-800 p-2 sm:p-4 flex items-center justify-between ${
          fullscreen ? "fixed bottom-0 left-0 right-0" : ""
        }`}
      >
        <Button variant="outline" onClick={prevSlide} disabled={currentSlide === 0} className="text-xs sm:text-sm">
          <ChevronLeft className="h-4 w-4 mr-0 sm:mr-2" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        <div className="flex gap-1 sm:gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                recordSlideTime(currentSlide)
                setCurrentSlide(index)
              }}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${index === currentSlide ? "bg-blue-500" : "bg-gray-600"}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <Button
          variant="outline"
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="text-xs sm:text-sm"
        >
          <span className="hidden sm:inline bg-white">Next</span>
          <ChevronRight className="h-4 w-4 ml-0 sm:ml-2" />
        </Button>
      </div>
    </div>
  )
}