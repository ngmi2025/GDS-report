import { google } from "googleapis"
import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || !session.accessToken) {
    return new Response("Unauthorized", { status: 401 })
  }

  const auth = new google.auth.OAuth2()
  auth.setCredentials({ access_token: session.accessToken })

  const searchconsole = google.searchconsole({ version: "v1", auth })
  
  // Get the site URL from environment variable or fallback
  const siteUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL || "https://upgradedpoints.com"
  
  // Calculate date ranges
  const now = new Date()
  const endDate = now.toISOString().split('T')[0]
  const startDate = new Date(now.setDate(now.getDate() - 30)).toISOString().split('T')[0]
  const previousStartDate = new Date(now.setDate(now.getDate() - 30)).toISOString().split('T')[0]

  try {
    // Fetch current period data
    const currentPeriod = await searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        type: 'discover',  // Specifically for Google Discover data
        dimensions: [],    // No dimensions for total aggregation
      },
    })

    // Fetch previous period data
    const previousPeriod = await searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: previousStartDate,
        endDate: startDate,
        type: 'discover',
        dimensions: [],
      },
    })

    // Calculate metrics and changes
    const current = currentPeriod.data.rows?.[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0 }
    const previous = previousPeriod.data.rows?.[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0 }

    const calculateChange = (current: number, previous: number) => {
      return previous === 0 ? 0 : ((current - previous) / previous) * 100
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
        change: calculateChange(previous.position || 0, current.position || 0) * -1 // Invert since lower is better
      }
    }

    return Response.json(metrics)
  } catch (error) {
    console.error("GSC KPI error:", error)
    return new Response("Error fetching Search Console KPI data", { status: 500 })
  }
} 