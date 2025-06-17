import { NextResponse } from 'next/server'
import {
  getDoctors,
  getPresentations,
  getRecentSessions,
  getTopPerformingSlides,
  getAllSlideAnalytics,
} from '@/lib/db'

export async function GET() {
  try {
    const doctors = await getDoctors()
    const presentations = await getPresentations()
    const recentSessions = await getRecentSessions(50)
    const topSlides = await getTopPerformingSlides(20)
    const allSlideAnalytics = await getAllSlideAnalytics()

    console.log('API Analytics Data:')
    console.log('- Doctors:', doctors.length)
    console.log('- Presentations:', presentations.length)
    console.log('- Sessions:', recentSessions.length)
    console.log('- Slide Analytics:', allSlideAnalytics.length)
    console.log('- Top Slides:', topSlides.length)


    return NextResponse.json({
      doctors,
      presentations,
      recentSessions,
      topSlides,
      allSlideAnalytics,
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}