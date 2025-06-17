import { getDoctors, getPresentations } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const [doctors, presentations] = await Promise.all([
      getDoctors(),
      getPresentations()
    ])

    return NextResponse.json({
      doctors,
      presentations
    })
  } catch (error) {
    console.error('Start page API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch start page data' },
      { status: 500 }
    )
  }
}
