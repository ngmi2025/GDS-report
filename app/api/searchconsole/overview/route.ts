import { google } from "googleapis"
import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      return new Response("Unauthorized", { status: 401 })
    }

    const auth = new google.auth.OAuth2()
    auth.setCredentials({ access_token: session.accessToken })

    const searchconsole = google.searchconsole({ version: "v1", auth })
    
    // Get site URL from environment variable
    const siteUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL

    // Calculate date ranges (last 30 days vs previous 30 days)
    const now = new Date()
    const endDate = now.toISOString().split('T')[0]
    const startDate = new Date(now.setDate(now.getDate() - 30)).toISOString().split('T')[0]
    const previousStartDate = new Date(now.setDate(now.getDate() - 30)).toISOString().split('T')[0]

    // Fetch current period data
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
        value: (current.ctr || 0) * 100, // Convert to percentage
        change: calculateChange((current.ctr || 0) * 100, (previous.ctr || 0) * 100)
      },
      position: {
        value: current.position || 0,
        // For position, a decrease is actually better
        change: calculateChange(previous.position || 0, current.position || 0) * -1
      }
    }

    return Response.json(metrics)
  } catch (error) {
    console.error("Error fetching Search Console overview:", error)
    return new Response(
      JSON.stringify({ error: "Failed to fetch Search Console data" }),
      { status: 500 }
    )
  }
} 