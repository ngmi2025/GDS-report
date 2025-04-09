import { NextRequest } from "next/server"

const SHEETS_SCRIPT_URL = process.env.GOOGLE_SHEETS_SCRIPT_URL

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const sheet = searchParams.get("sheet")

  // Log all request details
  console.log('API Request:', JSON.stringify({
    url: req.url,
    sheet,
    allParams: Object.fromEntries(searchParams.entries())
  }, null, 2))

  if (!sheet) {
    return Response.json({ 
      error: "Sheet parameter is required",
      message: "Please provide a sheet name parameter"
    }, { status: 400 })
  }

  if (!SHEETS_SCRIPT_URL) {
    console.error("Google Sheets Script URL not configured")
    return Response.json({ 
      error: "Configuration error",
      message: "Google Sheets Script URL not configured"
    }, { status: 500 })
  }

  try {
    const scriptUrl = `${SHEETS_SCRIPT_URL}?sheet=${encodeURIComponent(sheet)}`
    console.log('Fetching from Google Script:', {
      sheet,
      url: scriptUrl
    })
    
    const response = await fetch(scriptUrl)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Google Script error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      })
      return Response.json({ 
        error: "HTTP error",
        message: `Failed to fetch sheet data: ${response.statusText}`,
        details: errorText
      }, { status: response.status })
    }

    const rawData = await response.json()
    
    // Handle both array and object responses
    let data = rawData
    if (Array.isArray(rawData)) {
      data = { data: rawData }
    }
    
    // Log the processed response for debugging
    console.log('Google Script response:', JSON.stringify({
      sheet,
      hasError: !!data.error,
      rowCount: data.data ? data.data.length : 'unknown',
      response: data
    }, null, 2))
    
    // If we got an error response from the Google Script
    if (data.error) {
      console.error('Google Script error:', data)
      return Response.json(data, { status: 400 })
    }
    
    // Ensure we have a data array
    if (!data.data || !Array.isArray(data.data)) {
      console.error('Invalid data structure:', data)
      return Response.json({ 
        error: "Invalid data structure",
        message: "The response does not contain a valid data array"
      }, { status: 400 })
    }
    
    // Log success and return the data
    console.log(`Successfully fetched ${data.data.length} rows from sheet: ${sheet}`)
    return Response.json(data)
  } catch (error) {
    console.error("Error fetching sheet data:", {
      sheet,
      error: error instanceof Error ? error.message : error
    })
    return Response.json({ 
      error: "Internal error",
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
} 