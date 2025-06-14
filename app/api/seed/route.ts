import { NextResponse } from "next/server"
import { getMarketingPresentation } from "@/lib/db"

export async function GET() {
  try {
    // Get the marketing presentation
    const presentation = getMarketingPresentation()

    return NextResponse.json({
      success: true,
      message: "Sample presentation retrieved successfully",
      presentation,
    })
  } catch (error) {
    console.error("Error retrieving sample presentation:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve sample presentation",
      },
      { status: 500 },
    )
  }
}
