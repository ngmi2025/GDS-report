import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

interface GSCRow {
  clicks: string;
  date: string;
  keys: string[];
}

interface GSCResponse {
  rows?: GSCRow[];
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { urls } = await req.json();

    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: 'Invalid URLs provided' }, { status: 400 });
    }

    // Get the OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXTAUTH_URL + '/api/auth/callback/google'
    );

    // Set the credentials
    oauth2Client.setCredentials({
      access_token: session.accessToken,
      refresh_token: session.refreshToken,
    });

    // Create the Search Console client
    const searchconsole = google.searchconsole({
      version: 'v1',
      auth: oauth2Client,
    });

    // Calculate date range (last 7 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    // Format dates for API
    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = endDate.toISOString().split('T')[0];

    // Fetch data for each URL
    const results: Record<string, string> = {};
    
    for (const url of urls) {
      try {
        const response = await searchconsole.searchanalytics.query({
          siteUrl: process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL,
          requestBody: {
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            dimensions: ['date', 'page'],
            dimensionFilterGroups: [{
              filters: [{
                dimension: 'page',
                operator: 'equals',
                expression: url
              }]
            }],
            rowLimit: 1000,
            startRow: 0
          }
        });

        const rows = response.data.rows || [];
        if (rows.length > 0) {
          // Sort by date to get the most recent click
          const sortedRows = rows.sort((a, b) => {
            const dateA = a.keys?.[0] ? new Date(a.keys[0]).getTime() : 0;
            const dateB = b.keys?.[0] ? new Date(b.keys[0]).getTime() : 0;
            return dateB - dateA;
          });
          
          if (sortedRows[0]?.keys?.[0]) {
            results[url] = sortedRows[0].keys[0];
          }
        }
      } catch (error) {
        console.error(`Error fetching data for URL ${url}:`, error);
        // Continue with next URL even if one fails
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error in gsc-last-clicks:', error);
    return NextResponse.json({ error: 'Failed to fetch last click data' }, { status: 500 });
  }
} 