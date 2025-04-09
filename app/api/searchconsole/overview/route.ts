import { google } from "googleapis"
import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function GET(req: NextRequest) {
  try {
    console.log('Fetching Search Console data...')
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      console.error('No access token found in session:', session)
      return new Response(
        JSON.stringify({ error: "No access token found. Please sign in again." }),
        { status: 401 }
      )
    }

    const auth = new google.auth.OAuth2()
    auth.setCredentials({ access_token: session.accessToken })

    const searchconsole = google.searchconsole({ version: "v1", auth })
    
    // Get site URL from environment variable
    const siteUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL
    if (!siteUrl) {
      console.error('No site URL configured')
      return new Response(
        JSON.stringify({ error: "Search Console site URL not configured" }),
        { status: 500 }
      )
    }

    console.log('Using site URL:', siteUrl)

    // Calculate date ranges (last 30 days vs previous 30 days)
    const now = new Date()
    const endDate = now.toISOString().split('T')[0]
    const startDate = new Date(now.setDate(now.getDate() - 30)).toISOString().split('T')[0]
    const previousStartDate = new Date(now.setDate(now.getDate() - 30)).toISOString().split('T')[0]

    console.log('Date ranges:', { startDate, endDate, previousStartDate })

    // Fetch current period data
    console.log('Fetching current period data...')
    const currentPeriod = await searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: [],
        searchType: "discover",
        dataState: "all"
      },
    })

    // Fetch previous period data
    console.log('Fetching previous period data...')
    const previousPeriod = await searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: previousStartDate,
        endDate: startDate,
        dimensions: [],
        searchType: "discover",
        dataState: "all"
      },
    })

    console.log('Data received:', {
      current: currentPeriod.data.rows?.[0],
      previous: previousPeriod.data.rows?.[0]
    })

    // Extract metrics
    const current = currentPeriod.data.rows?.[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0 }
    const previous = previousPeriod.data.rows?.[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0 }

    // Calculate percentage changes
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return 0
      return ((current - previous) / previous) * 100
    }

    const metrics = {
      clicks: {
        value: current.clicks || 0,
        change: calculateChange(current.clicks || 0, previous.clicks || 0)
      },
      impressions: {
        value: current.impressions || 0,
        change: calculateChange(current.impressions || 0, previous.impressions || 0)
      },
      ctr: {
        value: (current.ctr || 0) * 100,
        change: calculateChange((current.ctr || 0) * 100, (previous.ctr || 0) * 100)
      },
      position: {
        value: current.position || 0,
        change: calculateChange(previous.position || 0, current.position || 0) * -1
      }
    }

    console.log('Returning metrics:', metrics)
    return Response.json(metrics)
  } catch (error) {
    console.error("Error fetching Search Console data:", error)
    return new Response(
      JSON.stringify({ 
        error: "Failed to fetch Search Console data",
        details: error instanceof Error ? error.message : String(error)
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
} 