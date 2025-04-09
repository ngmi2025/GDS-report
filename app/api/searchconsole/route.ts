import { google } from "googleapis"
import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"

export async function GET(req: NextRequest) {
  // Get the session from NextAuth
  const session = await getServerSession(authOptions)

  if (!session || !session.accessToken) {
    return new Response("Unauthorized", { status: 401 })
  }

  // Set credentials using the access token
  const auth = new google.auth.OAuth2()
  auth.setCredentials({ access_token: session.accessToken })

  // Access the Search Console API
  const searchconsole = google.searchconsole({
    version: "v1",
    auth,
  })

  // Replace with your verified site URL in Search Console
  const siteUrl = "https://upgradedpoints.com"

  try {
    const response = await searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: "2024-03-01",
        endDate: "2024-04-01",
        dimensions: ["page"],
        rowLimit: 10,
      },
    })

    return Response.json(response.data)
  } catch (error) {
    console.error("GSC error:", error)
    return new Response("Error fetching Search Console data", {
      status: 500,
    })
  }
}
