// Add this at the top of the file, before any other code
// Ensure we're not using Node.js specific modules in client components
if (typeof window !== "undefined") {
  // We're in the browser, no Node.js modules should be imported
}

import { v4 as uuidv4 } from "uuid"

// Define types for our data model
export type Doctor = {
  id: string
  name: string
  specialty: string
  email: string
  phone: string
  sessions: number
  avgEngagement: number
  lastSession?: string
  totalTime: string
  status: "active" | "inactive"
}

export type Slide = {
  id: string
  presentationId: string
  title: string
  content: string
  imageUrl: string
  order: number
}

export type Presentation = {
  id: string
  title: string
  description: string
  slides: number
  sessions: number
  avgEngagement: number
  lastUsed?: string
  status: "active" | "draft"
  createdAt: string
}

export type Session = {
  id: string
  doctorId: string
  presentationId: string
  startTime: string
  endTime?: string
  totalTime?: number
  avgEngagement?: number
}

export type SlideAnalytic = {
  id: string
  sessionId: string
  slideId: string
  timeSpent: number
}

export type Database = {
  doctors: Doctor[]
  presentations: Presentation[]
  slides: Slide[]
  sessions: Session[]
  slideAnalytics: SlideAnalytic[]
}

// In-memory database for serverless environment
let inMemoryDb: Database | null = null

// Use fixed IDs for presentations to ensure they never change
const PRESENTATION_1_ID = "presentation-1"
const PRESENTATION_2_ID = "presentation-2"

// Initial data for the database
const getInitialData = (): Database => {
  // Create doctor IDs
  const doctorId1 = "doctor-1"
  const doctorId2 = "doctor-2"

  // Create initial database with just two doctors
  const initialData: Database = {
    doctors: [
      {
        id: doctorId1,
        name: "Dr. Sarah Smith",
        specialty: "Cardiology",
        email: "sarah.smith@hospital.com",
        phone: "+1 (555) 123-4567",
        sessions: 0,
        avgEngagement: 0,
        lastSession: undefined,
        totalTime: "0h 0m",
        status: "active",
      },
      {
        id: doctorId2,
        name: "Dr. Michael Johnson",
        specialty: "Endocrinology",
        email: "m.johnson@clinic.com",
        phone: "+1 (555) 234-5678",
        sessions: 0,
        avgEngagement: 0,
        lastSession: undefined,
        totalTime: "0h 0m",
        status: "active",
      },
    ],
    presentations: [
      {
        id: PRESENTATION_1_ID,
        title: "Cardiomax Treatment Protocol",
        description: "New cardiovascular medication protocol for hypertension patients",
        slides: 6,
        sessions: 0,
        avgEngagement: 0,
        lastUsed: undefined,
        status: "active",
        createdAt: new Date().toISOString(),
      },
      {
        id: PRESENTATION_2_ID,
        title: "Glucobalance Therapy",
        description: "Latest diabetes management medication and treatment guidelines",
        slides: 6,
        sessions: 0,
        avgEngagement: 0,
        lastUsed: undefined,
        status: "active",
        createdAt: new Date().toISOString(),
      },
    ],
    slides: [],
    sessions: [],
    slideAnalytics: [],
  }

  // Add the provided slides to both presentations
  const slideImages = [
    "/slides/title.png",
    "/slides/agenda.png",
    "/slides/about-us.png",
    "/slides/product-overview.png",
    "/slides/product-benefits.png",
    "/slides/market-overview.png",
  ]

  // Medical slide titles for Cardiomax with numbers
  const cardioSlideTitles = [
    "Slide 1: Cardiomax Overview",
    "Slide 2: Clinical Indications",
    "Slide 3: Mechanism of Action",
    "Slide 4: Dosage Guidelines",
    "Slide 5: Side Effects Profile",
    "Slide 6: Patient Outcomes",
  ]

  // Medical slide content for Cardiomax
  const cardioSlideContent = [
    "Cardiomax is a next-generation ACE inhibitor for hypertension management",
    "Primary indications include hypertension, heart failure, and post-MI treatment",
    "Selectively blocks angiotensin II receptors with higher binding affinity",
    "Starting dose: 5mg daily, may increase to 10mg after 2 weeks",
    "Common side effects include dry cough (3%), dizziness (2%), and headache (1%)",
    "Clinical trials show 24% reduction in cardiovascular events over 5 years",
  ]

  // Medical slide titles for Glucobalance with numbers
  const glucoSlideTitles = [
    "Slide 1: Glucobalance Introduction",
    "Slide 2: Treatment Indications",
    "Slide 3: Pharmacodynamics",
    "Slide 4: Administration Protocol",
    "Slide 5: Adverse Reactions",
    "Slide 6: Clinical Efficacy Data",
  ]

  // Medical slide content for Glucobalance
  const glucoSlideContent = [
    "Glucobalance is a dual SGLT2/GLP-1 inhibitor for type 2 diabetes",
    "Indicated for adults with T2DM with inadequate control on metformin",
    "Increases glucose excretion and improves insulin sensitivity",
    "Once-daily oral tablet, 25mg with or without food",
    "Monitor for hypoglycemia (2%), UTIs (4%), and dehydration (1%)",
    "HbA1c reduction of 1.8% at 6 months compared to 0.9% with standard therapy",
  ]

  // Add slides for Cardiomax presentation
  slideImages.forEach((imageUrl, index) => {
    initialData.slides.push({
      id: `slide-1-${index}`,
      presentationId: PRESENTATION_1_ID,
      title: cardioSlideTitles[index],
      content: cardioSlideContent[index],
      imageUrl: imageUrl,
      order: index,
    })
  })

  // Add different slides for Glucobalance presentation (using different placeholder images)
  const glucoSlideImages = [
    "/placeholder.svg?height=600&width=800&text=Glucobalance+Title",
    "/placeholder.svg?height=600&width=800&text=Treatment+Agenda",
    "/placeholder.svg?height=600&width=800&text=Company+Profile",
    "/placeholder.svg?height=600&width=800&text=Drug+Mechanism",
    "/placeholder.svg?height=600&width=800&text=Clinical+Benefits",
    "/placeholder.svg?height=600&width=800&text=Market+Analysis",
  ]

  glucoSlideImages.forEach((imageUrl, index) => {
    initialData.slides.push({
      id: `slide-2-${index}`,
      presentationId: PRESENTATION_2_ID,
      title: glucoSlideTitles[index],
      content: glucoSlideContent[index],
      imageUrl: imageUrl,
      order: index,
    })
  })

  // No sample sessions or analytics - start fresh
  return initialData
}

// Initialize database
export function initializeDatabase() {
  if (!inMemoryDb) {
    inMemoryDb = getInitialData()
  }
}

// Get database
export function getDatabase(): Database {
  if (!inMemoryDb) {
    initializeDatabase()
  }
  return inMemoryDb as Database
}

// Save database
export function saveDatabase(data: Database) {
  inMemoryDb = data
}

// Helper functions for database operations
export function getDoctors(): Doctor[] {
  const db = getDatabase()
  return db.doctors
}

export function getDoctor(id: string): Doctor | undefined {
  const db = getDatabase()
  return db.doctors.find((doctor) => doctor.id === id)
}

export function getPresentations(): Presentation[] {
  const db = getDatabase()
  return db.presentations
}

export function getPresentation(id: string): Presentation | undefined {
  const db = getDatabase()
  return db.presentations.find((presentation) => presentation.id === id)
}

export function getSlidesByPresentation(presentationId: string): Slide[] {
  const db = getDatabase()
  return db.slides.filter((slide) => slide.presentationId === presentationId).sort((a, b) => a.order - b.order)
}

export function createPresentation(presentation: Omit<Presentation, "id" | "createdAt">): Presentation {
  const db = getDatabase()
  const newPresentation: Presentation = {
    ...presentation,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  }
  db.presentations.push(newPresentation)
  saveDatabase(db)
  return newPresentation
}

export function createSlides(slides: Omit<Slide, "id">[]): Slide[] {
  const db = getDatabase()
  const newSlides = slides.map((slide) => ({
    ...slide,
    id: uuidv4(),
  }))
  db.slides.push(...newSlides)
  saveDatabase(db)
  return newSlides
}

export function startSession(doctorId: string, presentationId: string): Session {
  const db = getDatabase()
  const newSession: Session = {
    id: uuidv4(),
    doctorId,
    presentationId,
    startTime: new Date().toISOString(),
  }
  db.sessions.push(newSession)
  saveDatabase(db)
  return newSession
}

export function endSession(sessionId: string, slideAnalytics: Omit<SlideAnalytic, "id">[]): Session {
  const db = getDatabase()
  const session = db.sessions.find((s) => s.id === sessionId)

  console.log("DB: Finding session with ID:", sessionId)
  console.log(
    "DB: Available sessions:",
    db.sessions.map((s) => ({ id: s.id, doctorId: s.doctorId })),
  )
  console.log("DB: Found session:", session)
  console.log("DB: Received slide analytics:", slideAnalytics)

  if (!session) {
    throw new Error("Session not found")
  }

  // Update session
  session.endTime = new Date().toISOString()

  // Calculate total time
  const startTime = new Date(session.startTime).getTime()
  const endTime = new Date(session.endTime).getTime()
  session.totalTime = (endTime - startTime) / 1000 // in seconds

  console.log("DB: Session total time:", session.totalTime)

  // Add slide analytics
  const newSlideAnalytics = slideAnalytics.map((analytic) => ({
    ...analytic,
    id: uuidv4(),
  }))

  console.log("DB: Adding slide analytics:", newSlideAnalytics)

  db.slideAnalytics.push(...newSlideAnalytics)

  console.log("DB: Total slide analytics in database:", db.slideAnalytics.length)
  console.log("DB: All slide analytics:", db.slideAnalytics)

  // Calculate average engagement
  const totalTimeSpent = newSlideAnalytics.reduce((sum, analytic) => sum + analytic.timeSpent, 0)
  session.avgEngagement = Math.round((totalTimeSpent / (session.totalTime * 1000)) * 100)

  console.log("DB: Calculated engagement:", session.avgEngagement)

  // Update doctor stats
  const doctor = db.doctors.find((d) => d.id === session.doctorId)
  if (doctor) {
    console.log("DB: Updating doctor stats for:", doctor.name)
    doctor.sessions += 1
    doctor.lastSession = session.endTime

    // Update average engagement (simple average for demo)
    doctor.avgEngagement = Math.round(
      (doctor.avgEngagement * (doctor.sessions - 1) + session.avgEngagement!) / doctor.sessions,
    )

    // Update total time (simplified for demo)
    const totalMinutes = Math.round(
      Number.parseInt(doctor.totalTime.split("h")[0] || "0") * 60 +
        Number.parseInt(doctor.totalTime.split("h ")[1]?.split("m")[0] || "0") +
        session.totalTime / 60,
    )

    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    doctor.totalTime = `${hours}h ${minutes}m`

    console.log("DB: Updated doctor:", {
      sessions: doctor.sessions,
      avgEngagement: doctor.avgEngagement,
      totalTime: doctor.totalTime,
    })
  }

  // Update presentation stats
  const presentation = db.presentations.find((p) => p.id === session.presentationId)
  if (presentation) {
    console.log("DB: Updating presentation stats for:", presentation.title)
    presentation.sessions += 1
    presentation.lastUsed = session.endTime

    // Update average engagement
    presentation.avgEngagement = Math.round(
      (presentation.avgEngagement * (presentation.sessions - 1) + session.avgEngagement!) / presentation.sessions,
    )

    console.log("DB: Updated presentation:", {
      sessions: presentation.sessions,
      avgEngagement: presentation.avgEngagement,
    })
  }

  saveDatabase(db)
  console.log("DB: Database saved successfully")

  return session
}

export function getSessionsByDoctor(doctorId: string): Session[] {
  const db = getDatabase()
  return db.sessions.filter((session) => session.doctorId === doctorId)
}

export function getSessionsByPresentation(presentationId: string): Session[] {
  const db = getDatabase()
  return db.sessions.filter((session) => session.presentationId === presentationId)
}

export function getSlideAnalyticsBySession(sessionId: string): SlideAnalytic[] {
  const db = getDatabase()
  return db.slideAnalytics.filter((analytic) => analytic.sessionId === sessionId)
}

export function getTopPerformingSlides(
  limit = 5,
): { slide: Slide; avgTimeSpent: number; views: number; totalTimeSpent: number }[] {
  const db = getDatabase()

  // Group analytics by slide
  const slideStats = new Map<string, { timeSpent: number; count: number }>()

  db.slideAnalytics.forEach((analytic) => {
    const current = slideStats.get(analytic.slideId) || { timeSpent: 0, count: 0 }
    slideStats.set(analytic.slideId, {
      timeSpent: current.timeSpent + analytic.timeSpent,
      count: current.count + 1,
    })
  })

  // Convert map to array and join with slide data
  const result = Array.from(slideStats.entries())
    .map(([slideId, stats]) => {
      const slide = db.slides.find((s) => s.id === slideId)
      if (!slide) return null

      return {
        slide,
        totalTimeSpent: stats.timeSpent,
        avgTimeSpent: stats.timeSpent / stats.count,
        views: stats.count,
      }
    })
    .filter(Boolean)
    .sort((a, b) => b!.avgTimeSpent - a!.avgTimeSpent)
    .slice(0, limit) as { slide: Slide; avgTimeSpent: number; views: number; totalTimeSpent: number }[]

  return result
}

export function getRecentSessions(limit = 5): Array<{
  session: Session
  doctor: Doctor
  presentation: Presentation
  slides: number
  duration: number
}> {
  const db = getDatabase()

  return db.sessions
    .filter((session) => session.endTime) // Only completed sessions
    .sort((a, b) => new Date(b.endTime!).getTime() - new Date(a.endTime!).getTime())
    .slice(0, limit)
    .map((session) => {
      const doctor = db.doctors.find((d) => d.id === session.doctorId)!
      const presentation = db.presentations.find((p) => p.id === session.presentationId)!
      const analytics = db.slideAnalytics.filter((a) => a.sessionId === session.id)

      return {
        session,
        doctor,
        presentation,
        slides: new Set(analytics.map((a) => a.slideId)).size,
        duration: session.totalTime || 0,
      }
    })
}

export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00"
  }

  // Calculate hours, minutes, and seconds
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = Math.floor(seconds % 60)

  // Format with leading zeros
  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`
  } else {
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }
}

export function getTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return "just now"

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`

  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} day${days !== 1 ? "s" : ""} ago`

  const months = Math.floor(days / 30)
  if (months < 12) return `${months} month${months !== 1 ? "s" : ""} ago`

  const years = Math.floor(months / 12)
  return `${years} year${years !== 1 ? "s" : ""} ago`
}

// Get doctor presentations
export function getDoctorPresentations(doctorId: string): Presentation[] {
  const db = getDatabase()
  const doctor = db.doctors.find((d) => d.id === doctorId)
  if (!doctor) return []

  // For simplicity in this demo, we'll return all presentations
  // In a real app, you'd have a relation between doctors and presentations
  return db.presentations
}

// Get the first presentation (for quick access)
export function getFirstPresentation(): Presentation | undefined {
  const db = getDatabase()
  return db.presentations[0]
}

// Get the first doctor (for quick access)
export function getFirstDoctor(): Doctor | undefined {
  const db = getDatabase()
  return db.doctors[0]
}

// Get the marketing presentation
export function getMarketingPresentation(): Presentation | undefined {
  const db = getDatabase()
  return db.presentations.find((p) => p.id === PRESENTATION_1_ID)
}

// Get slide analytics for a specific slide
export function getSlideAnalytics(slideId: string): SlideAnalytic[] {
  const db = getDatabase()
  return db.slideAnalytics.filter((analytic) => analytic.slideId === slideId)
}

// Get all slide analytics
export function getAllSlideAnalytics(): SlideAnalytic[] {
  const db = getDatabase()
  return db.slideAnalytics
}
