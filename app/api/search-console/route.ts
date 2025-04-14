import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Missing date parameters' }, { status: 400 })
    }

    // Fetch data from Google Search Console API
    const response = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL}/searchAnalytics/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate,
          endDate,
          dimensions: ['date'],
          type: 'discover',
          rowLimit: 10000,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      console.error('Search Console API error:', error)
      return NextResponse.json({ error: 'Failed to fetch data from Search Console' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching Search Console data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 