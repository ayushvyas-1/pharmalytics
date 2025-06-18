// page.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Maximize, Minimize, Home } from "lucide-react"
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

  // Handle fullscreen and keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "f" || e.key === "F") {
        toggleFullscreen()
      } else if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault()
        nextSlide()
      } else if (e.key === "ArrowLeft") {
        e.preventDefault()
        prevSlide()
      } else if (e.key === "Escape" && fullscreen) {
        setFullscreen(false)
      } else if (e.key === "Home") {
        e.preventDefault()
        recordSlideTime(currentSlide)
        setCurrentSlide(0)
      } else if (e.key === "End") {
        e.preventDefault()
        recordSlideTime(currentSlide)
        setCurrentSlide(slides.length - 1)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [fullscreen, currentSlide, slides.length])

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
      setTimeout(() => {
        router.push("/analytics")
      }, 500)
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center p-8">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading presentation...</h2>
          <p className="text-gray-600">Please wait while we prepare your slides</p>
        </div>
      </div>
    )
  }

  if (error || slides.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-100">
        <Card className="w-full max-w-lg shadow-xl border-0">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-3">Unable to Load Presentation</h1>
              <p className="text-gray-600">{error || "No slides found for this presentation"}</p>
            </div>

            {presentations.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">Available Presentations:</h2>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {presentations.map((presentation) => (
                    <Button
                      key={presentation.id}
                      variant="outline"
                      className="w-full justify-start p-3 h-auto text-left hover:bg-blue-50 border-gray-200"
                      onClick={() =>
                        router.push(`/viewer/${presentation.id}${doctorId ? `?doctorId=${doctorId}` : ""}`)
                      }
                    >
                      <div>
                        <div className="font-medium">{presentation.title}</div>
                        {presentation.description && (
                          <div className="text-sm text-gray-500 mt-1">{presentation.description}</div>
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={() => router.push("/presentations")} className="w-full bg-blue-600 hover:bg-blue-700">
              <Home className="h-4 w-4 mr-2" />
              Return to Presentations
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!sessionStarted) {
    const selectedDoctor = doctors.find(d => d.id === doctorId)
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Play className="h-10 w-10 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-3">Ready to Present</h1>
              <p className="text-gray-600">Start your presentation session when you're ready</p>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                <h2 className="font-semibold text-xl mb-2 text-gray-800">{presentation?.title || "Presentation"}</h2>
                <p className="text-gray-600 mb-4">{presentation?.description || "Medical presentation for patient education"}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                    {slides.length} slides
                  </span>
                  <span className="text-gray-500">
                    Est. {Math.ceil(slides.length * 2)} min
                  </span>
                </div>
              </div>

              <Button onClick={startSession} className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 shadow-lg">
                <Play className="h-5 w-5 mr-3" />
                Start Presentation
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Keyboard shortcuts:</p>
                <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-400">
                  <span className="px-2 py-1 bg-gray-100 rounded">← → Navigate</span>
                  <span className="px-2 py-1 bg-gray-100 rounded">F Fullscreen</span>
                  <span className="px-2 py-1 bg-gray-100 rounded">Space Next</span>
                </div>
              </div>
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
      className={`${fullscreen ? "fixed inset-0 z-50 bg-black" : "min-h-screen bg-gray-900"} text-white transition-all duration-300`}
      ref={presentationRef}
    >
      {/* Enhanced Header */}
      <div
        className={`bg-gray-800/95 backdrop-blur-sm border-b border-gray-700 p-3 sm:p-4 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 ${
          fullscreen ? "hidden" : ""
        }`}
      >
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-400 font-medium">LIVE</span>
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm sm:text-base text-white font-semibold truncate">{presentation?.title || "Presentation"}</h1>
            <p className="text-xs text-gray-400">
              Slide {currentSlide + 1} of {slides.length} • {currentSlideData.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsPresenting(!isPresenting)}
            className="text-white hover:bg-gray-700"
          >
            {isPresenting ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span className="ml-2 hidden sm:inline">{isPresenting ? "Pause" : "Resume"}</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleFullscreen}
            className="text-white hover:bg-gray-700"
          >
            {fullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={resetSession}
            className="text-white hover:bg-gray-700"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={endSession}
            className="bg-red-600 hover:bg-red-700"
          >
            End Session
          </Button>
        </div>
      </div>

      {/* Enhanced Progress bar */}
      <div className={`h-1 bg-gray-800 ${fullscreen ? "hidden" : ""}`}>
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500 ease-out shadow-sm" 
          style={{ width: `${slideProgress}%` }}
        ></div>
      </div>

      {/* Enhanced Main Slide Area */}
      <div className="flex-1 flex items-center justify-center p-2 sm:p-4 md:p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-6xl w-full">
          {isExternalImage ? (
            <div className="relative w-full bg-white rounded-lg shadow-2xl overflow-hidden" style={{ height: fullscreen ? "85vh" : "75vh" }}>
              <Image
                src={currentSlideData.imageUrl || "/placeholder.svg"}
                alt={currentSlideData.title}
                fill
                style={{ objectFit: "contain" }}
                priority
                className="transition-opacity duration-300"
              />
            </div>
          ) : (
            <Card className="bg-white text-black shadow-2xl border-0 overflow-hidden">
              <CardContent className="p-6 sm:p-10">
                <div className="text-center">
                  <div className="relative mb-6 sm:mb-8 rounded-xl overflow-hidden shadow-lg bg-gray-50">
                    <img
                      src={currentSlideData.imageUrl || "/placeholder.svg"}
                      alt={currentSlideData.title}
                      className="w-full h-64 sm:h-96 object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-6 text-gray-800 leading-tight">
                    {currentSlideData.title}
                  </h2>
                  <p className="text-base sm:text-xl text-gray-600 leading-relaxed max-w-4xl mx-auto">
                    {currentSlideData.content}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Enhanced Navigation */}
      <div
        className={`bg-gray-800/95 backdrop-blur-sm border-t border-gray-700 p-3 sm:p-4 flex items-center justify-between ${
          fullscreen ? "fixed bottom-0 left-0 right-0" : ""
        }`}
      >
        <Button 
          variant="outline" 
          onClick={prevSlide} 
          disabled={currentSlide === 0} 
          className="text-white border-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4 mr-0 sm:mr-2" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        <div className="flex gap-1 sm:gap-2 px-4 max-w-xs sm:max-w-none overflow-x-auto">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                recordSlideTime(currentSlide)
                setCurrentSlide(index)
              }}
              className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-200 flex-shrink-0 ${
                index === currentSlide 
                  ? "bg-blue-500 scale-125 shadow-lg" 
                  : index < currentSlide 
                    ? "bg-blue-300 hover:bg-blue-400" 
                    : "bg-gray-600 hover:bg-gray-500"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <Button
          variant="outline"
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="text-white border-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="hidden sm:inline">Next</span>
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4 ml-0 sm:ml-2" />
        </Button>
      </div>
    </div>
  )
}