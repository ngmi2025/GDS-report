import { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const response = await fetch("https://script.google.com/macros/s/AKfycbykko6EP2hc6QXisfVmHyUeEQPkRBuhJNshs9troTxjpcjlzQbGSBAKL56Y2rPrYsLa/exec")
    if (!response.ok) throw new Error("Failed to fetch data")

    const data = await response.json()

    // Optional: Filter or format for content performance if needed
    return Response.json(data)
  } catch (error) {
    console.error("Content Performance API error:", error)
    return new Response("Failed to fetch content data", { status: 500 })
  }
}
