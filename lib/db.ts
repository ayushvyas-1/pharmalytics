"use server"

import fs from 'fs'
import path from 'path'
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

// JSON file paths
const DATA_DIR = path.join(process.cwd(), 'data')
const DB_FILE = path.join(DATA_DIR, 'database.json')

// Use fixed IDs for presentations to ensure they never change
const PRESENTATION_1_ID = "presentation-1"
const PRESENTATION_2_ID = "presentation-2"

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

// Initial data for the database
const getInitialData = (): Database => {
  // Create doctor IDs
  const doctorId1 = "doctor-1"
  const doctorId2 = "doctor-2"

  // Create initial database with clean doctors (no sessions)
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

  return initialData
}

// Load database from JSON file
async function loadDatabase(): Promise<Database> {
  try {
    ensureDataDir()
    
    if (fs.existsSync(DB_FILE)) {
      const fileContent = fs.readFileSync(DB_FILE, 'utf8')
      return JSON.parse(fileContent) as Database
    } else {
      // Create initial database if file doesn't exist
      const initialData = getInitialData()
      await saveDatabase(initialData)
      return initialData
    }
  } catch (error) {
    console.error('Error loading database:', error)
    // Return initial data if there's an error
    return getInitialData()
  }
}

// Save database to JSON file
async function saveDatabase(data: Database): Promise<void> {
  try {
    ensureDataDir()
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8')
  } catch (error) {
    console.error('Error saving database:', error)
  }
}

// Get database
export async function getDatabase(): Promise<Database> {
  return await loadDatabase()
}

// Helper functions for database operations
export async function getDoctors(): Promise<Doctor[]> {
  const db = await getDatabase()
  return db.doctors
}

export async function getDoctor(id: string): Promise<Doctor | undefined> {
  const db = await getDatabase()
  return db.doctors.find((doctor) => doctor.id === id)
}

export async function getPresentations(): Promise<Presentation[]> {
  const db = await getDatabase()
  return db.presentations
}

export async function getPresentation(id: string): Promise<Presentation | undefined> {
  const db = await getDatabase()
  return db.presentations.find((presentation) => presentation.id === id)
}

export async function getSlidesByPresentation(presentationId: string): Promise<Slide[]> {
  const db = await getDatabase()
  return db.slides.filter((slide) => slide.presentationId === presentationId).sort((a, b) => a.order - b.order)
}

export async function createPresentation(presentation: Omit<Presentation, "id" | "createdAt">): Promise<Presentation> {
  const db = await getDatabase()
  const newPresentation: Presentation = {
    ...presentation,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  }
  db.presentations.push(newPresentation)
  await saveDatabase(db)
  return newPresentation
}

export async function createSlides(slides: Omit<Slide, "id">[]): Promise<Slide[]> {
  const db = await getDatabase()
  const newSlides = slides.map((slide) => ({
    ...slide,
    id: uuidv4(),
  }))
  db.slides.push(...newSlides)
  await saveDatabase(db)
  return newSlides
}

export async function startSession(doctorId: string, presentationId: string): Promise<Session> {
  const db = await getDatabase()
  const newSession: Session = {
    id: uuidv4(),
    doctorId,
    presentationId,
    startTime: new Date().toISOString(),
  }
  db.sessions.push(newSession)
  await saveDatabase(db)
  
  console.log("DB: Session started:", newSession)
  console.log("DB: Total sessions in database:", db.sessions.length)
  
  return newSession
}

export async function endSession(sessionId: string, slideAnalytics: Omit<SlideAnalytic, "id">[]): Promise<Session> {
  const db = await getDatabase()
  const session = db.sessions.find((s) => s.id === sessionId)

  console.log("DB: Ending session with ID:", sessionId)
  console.log("DB: Available sessions:", db.sessions.map((s) => ({ id: s.id, doctorId: s.doctorId })))
  console.log("DB: Found session:", session)
  console.log("DB: Received slide analytics:", slideAnalytics)

  if (!session) {
    console.error("DB: Session not found with ID:", sessionId)
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

  // Calculate average engagement based on actual time spent vs total session time
  const totalTimeSpent = newSlideAnalytics.reduce((sum, analytic) => sum + analytic.timeSpent, 0)
  session.avgEngagement = session.totalTime && session.totalTime > 0 
    ? Math.min(100, Math.round((totalTimeSpent / (session.totalTime * 1000)) * 100))
    : 0

  console.log("DB: Calculated engagement:", session.avgEngagement)

  // Update doctor stats with real calculations
  const doctor = db.doctors.find((d) => d.id === session.doctorId)
  if (doctor) {
    console.log("DB: Updating doctor stats for:", doctor.name)
    doctor.sessions += 1
    doctor.lastSession = session.endTime

    // Calculate real average engagement
    const allDoctorSessions = db.sessions.filter(s => s.doctorId === session.doctorId && s.avgEngagement !== undefined)
    const totalEngagement = allDoctorSessions.reduce((sum, s) => sum + (s.avgEngagement || 0), 0)
    doctor.avgEngagement = allDoctorSessions.length > 0 
      ? Math.round(totalEngagement / allDoctorSessions.length)
      : 0

    // Calculate real total time from all completed sessions
    const completedSessions = db.sessions.filter(s => s.doctorId === session.doctorId && s.totalTime)
    const totalSeconds = completedSessions.reduce((sum, s) => sum + (s.totalTime || 0), 0)
    const totalMinutes = Math.round(totalSeconds / 60)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    doctor.totalTime = `${hours}h ${minutes}m`

    console.log("DB: Updated doctor:", {
      sessions: doctor.sessions,
      avgEngagement: doctor.avgEngagement,
      totalTime: doctor.totalTime,
    })
  }

  // Update presentation stats with real calculations
  const presentation = db.presentations.find((p) => p.id === session.presentationId)
  if (presentation) {
    console.log("DB: Updating presentation stats for:", presentation.title)
    presentation.sessions += 1
    presentation.lastUsed = session.endTime

    // Calculate real average engagement for this presentation
    const allPresentationSessions = db.sessions.filter(s => s.presentationId === session.presentationId && s.avgEngagement !== undefined)
    const totalEngagement = allPresentationSessions.reduce((sum, s) => sum + (s.avgEngagement || 0), 0)
    presentation.avgEngagement = allPresentationSessions.length > 0 
      ? Math.round(totalEngagement / allPresentationSessions.length)
      : 0

    console.log("DB: Updated presentation:", {
      sessions: presentation.sessions,
      avgEngagement: presentation.avgEngagement,
    })
  }

  await saveDatabase(db)
  console.log("DB: Database saved successfully")

  return session
}

export async function getSessionsByDoctor(doctorId: string): Promise<Session[]> {
  const db = await getDatabase()
  return db.sessions.filter((session) => session.doctorId === doctorId)
}

export async function getSessionsByPresentation(presentationId: string): Promise<Session[]> {
  const db = await getDatabase()
  return db.sessions.filter((session) => session.presentationId === presentationId)
}

export async function getSlideAnalyticsBySession(sessionId: string): Promise<SlideAnalytic[]> {
  const db = await getDatabase()
  return db.slideAnalytics.filter((analytic) => analytic.sessionId === sessionId)
}

export async function getTopPerformingSlides(
  limit = 5,
): Promise<{ slide: Slide; avgTimeSpent: number; views: number; totalTimeSpent: number }[]> {
  const db = await getDatabase()

  console.log("DB: Getting top performing slides")
  console.log("DB: Total slide analytics:", db.slideAnalytics.length)

  if (db.slideAnalytics.length === 0) {
    console.log("DB: No slide analytics found")
    return []
  }

  // Group analytics by slide
  const slideStats = new Map<string, { timeSpent: number; count: number }>()

  db.slideAnalytics.forEach((analytic) => {
    const current = slideStats.get(analytic.slideId) || { timeSpent: 0, count: 0 }
    slideStats.set(analytic.slideId, {
      timeSpent: current.timeSpent + analytic.timeSpent,
      count: current.count + 1,
    })
  })

  console.log("DB: Slide stats map:", Array.from(slideStats.entries()))

  // Convert map to array and join with slide data
  const result = Array.from(slideStats.entries())
    .map(([slideId, stats]) => {
      const slide = db.slides.find((s) => s.id === slideId)
      if (!slide) {
        console.warn("DB: Slide not found for ID:", slideId)
        return null
      }

      return {
        slide,
        totalTimeSpent: stats.timeSpent,
        avgTimeSpent: stats.timeSpent / stats.count,
        views: stats.count,
      }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => b.avgTimeSpent - a.avgTimeSpent)
    .slice(0, limit)

  console.log("DB: Top performing slides result:", result)
  return result
}

export async function getRecentSessions(limit = 5): Promise<Array<{
  session: Session
  doctor: Doctor
  presentation: Presentation
  slides: number
  duration: number
}>> {
  const db = await getDatabase()

  console.log("DB: Getting recent sessions")
  console.log("DB: Total sessions:", db.sessions.length)
  console.log("DB: Sessions with endTime:", db.sessions.filter(s => s.endTime).length)

  const completedSessions = db.sessions.filter((session) => session.endTime)
  
  if (completedSessions.length === 0) {
    console.log("DB: No completed sessions found")
    return []
  }

  const result = completedSessions
    .sort((a, b) => new Date(b.endTime!).getTime() - new Date(a.endTime!).getTime())
    .slice(0, limit)
    .map((session) => {
      const doctor = db.doctors.find((d) => d.id === session.doctorId)
      const presentation = db.presentations.find((p) => p.id === session.presentationId)
      
      if (!doctor || !presentation) {
        console.warn('DB: Missing doctor or presentation for session:', session.id)
        return null
      }
      
      const analytics = db.slideAnalytics.filter((a) => a.sessionId === session.id)

      return {
        session,
        doctor,
        presentation,
        slides: new Set(analytics.map((a) => a.slideId)).size,
        duration: session.totalTime || 0,
      }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)

  console.log("DB: Recent sessions result:", result)
  return result
}

export async function formatTime(seconds: number): Promise<string> {
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

export async function getTimeAgo(dateString: string): Promise<string> {
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
export async function getDoctorPresentations(doctorId: string): Promise<Presentation[]> {
  const db = await getDatabase()
  const doctor = db.doctors.find((d) => d.id === doctorId)
  if (!doctor) return []

  // For simplicity in this demo, we'll return all presentations
  // In a real app, you'd have a relation between doctors and presentations
  return db.presentations
}

// Get the first presentation (for quick access)
export async function getFirstPresentation(): Promise<Presentation | undefined> {
  const db = await getDatabase()
  return db.presentations[0]
}

// Get the first doctor (for quick access)
export async function getFirstDoctor(): Promise<Doctor | undefined> {
  const db = await getDatabase()
  return db.doctors[0]
}

// Get the marketing presentation
export async function getMarketingPresentation(): Promise<Presentation | undefined> {
  const db = await getDatabase()
  return db.presentations.find((p) => p.id === PRESENTATION_1_ID)
}

// Get slide analytics for a specific slide
export async function getSlideAnalytics(slideId: string): Promise<SlideAnalytic[]> {
  const db = await getDatabase()
  return db.slideAnalytics.filter((analytic) => analytic.slideId === slideId)
}

// Get all slide analytics
export async function getAllSlideAnalytics(): Promise<SlideAnalytic[]> {
  const db = await getDatabase()
  console.log("DB: Getting all slide analytics, count:", db.slideAnalytics.length)
  return db.slideAnalytics
}