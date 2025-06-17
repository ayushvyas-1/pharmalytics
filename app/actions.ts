"use server"

import { revalidatePath } from "next/cache"
import {
  createPresentation,
  createSlides,
  startSession,
  endSession,
  getSlidesByPresentation,
  getDoctors,
  getPresentations,
} from "@/lib/db"
import type { SlideAnalytic } from "@/lib/db"

export async function uploadPresentation(formData: FormData) {
  // In a real app, we would process the file here
  // For this MVP, we'll simulate file processing

  const title = formData.get("title") as string
  const description = formData.get("description") as string

  if (!title) {
    return { success: false, message: "Title is required" }
  }

  // Create a new presentation
  const newPresentation = await createPresentation({
    title,
    description,
    slides: 5, // Default for demo
    sessions: 0,
    avgEngagement: 0,
    status: "active",
  })

  // Create sample slides
  const slideContents = [
    {
      title: "Introduction to " + title,
      content: "Overview of medications and their mechanisms of action.",
    },
    {
      title: "Key Benefits",
      content: "Primary benefits and clinical outcomes.",
    },
    {
      title: "Dosage Information",
      content: "Recommended dosages and administration guidelines.",
    },
    {
      title: "Side Effects",
      content: "Potential side effects and contraindications.",
    },
    {
      title: "Clinical Studies",
      content: "Summary of clinical trial results and efficacy data.",
    },
  ]

  const slides = slideContents.map((slide, index) => ({
    presentationId: newPresentation.id,
    title: slide.title,
    content: slide.content,
    imageUrl: `/placeholder.svg?height=400&width=600&text=${encodeURIComponent(slide.title)}`,
    order: index,
  }))

  await createSlides(slides)

  revalidatePath("/presentations")
  return { success: true, presentationId: newPresentation.id }
}

export async function startPresentationSession(doctorId: string, presentationId: string) {
  try {
    // Get all doctors and presentations to make sure we have data
    const doctors = await getDoctors()
    const presentations = await getPresentations()

    // Find the specific doctor and presentation
    const doctor = doctors.find((d) => d.id === doctorId)
    const presentation = presentations.find((p) => p.id === presentationId)

    if (!doctor) {
      console.error(`Doctor not found with ID: ${doctorId}`)
      console.log(
        "Available doctors:",
        doctors.map((d) => ({ id: d.id, name: d.name })),
      )
      return { success: false, message: `Doctor not found with ID: ${doctorId}` }
    }

    if (!presentation) {
      console.error(`Presentation not found with ID: ${presentationId}`)
      console.log(
        "Available presentations:",
        presentations.map((p) => ({ id: p.id, title: p.title })),
      )
      return { success: false, message: `Presentation not found with ID: ${presentationId}` }
    }

    // If we have both doctor and presentation, start the session
    const session = await startSession(doctorId, presentationId)
    return { success: true, sessionId: session.id }
  } catch (error) {
    console.error("Error starting session:", error)
    return {
      success: false,
      message: "Failed to start session: " + (error instanceof Error ? error.message : String(error)),
    }
  }
}

export async function endPresentationSession(sessionId: string, slideAnalytics: Omit<SlideAnalytic, "id">[]) {
  try {
    console.log("Server: Ending session", sessionId, "with analytics:", slideAnalytics) // Debug log

    const session = await endSession(sessionId, slideAnalytics)

    console.log("Server: Session ended successfully", session) // Debug log

    revalidatePath("/analytics")
    revalidatePath("/doctors")
    revalidatePath("/presentations")
    return { success: true, session }
  } catch (error) {
    console.error("Error ending session:", error)
    return {
      success: false,
      message: "Failed to end session: " + (error instanceof Error ? error.message : String(error)),
    }
  }
}

export async function getPresentationData(presentationId: string) {
  try {
    // Get all presentations to make sure we have data
    const presentations = await getPresentations()
    const presentation = presentations.find((p) => p.id === presentationId)

    if (!presentation) {
      console.error(`Presentation not found with ID: ${presentationId}`)
      console.log(
        "Available presentations:",
        presentations.map((p) => ({ id: p.id, title: p.title })),
      )
      return { success: false, message: `Presentation not found with ID: ${presentationId}` }
    }

    const slides = await getSlidesByPresentation(presentationId)
    return { success: true, presentation, slides }
  } catch (error) {
    console.error("Error getting presentation data:", error)
    return { success: false, message: "Failed to get presentation data" }
  }
}