import { getDoctors, getPresentations, getRecentSessions } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const [doctors, presentations, recentSessions] = await Promise.all([
      getDoctors(),
      getPresentations(),
      getRecentSessions(4)
    ])

    return NextResponse.json({
      doctors,
      presentations,
      totalSessions: recentSessions.length
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}