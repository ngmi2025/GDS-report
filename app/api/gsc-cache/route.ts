import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { addMonths, subMonths, startOfMonth, endOfMonth, format, subDays } from 'date-fns';
import fs from 'fs/promises';

const CACHE_PATH = '/tmp/gsc-cache.json';
const SITE_URL = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL;

// Define preset ranges and months
const PRESETS = [
  { key: 'last-7-days', label: 'Last 7 days', days: 7 },
  { key: 'last-28-days', label: 'Last 28 days', days: 28 },
  { key: 'last-3-months', label: 'Last 3 months', days: 90 },
  { key: 'last-16-months', label: 'Last 16 months', days: 485 },
];

function getMonthsList() {
  const months = [];
  const today = new Date();
  for (let i = 0; i < 12; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    months.push({
      key: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM yyyy'),
      from: startOfMonth(date),
      to: endOfMonth(date),
    });
  }
  return months;
}

async function fetchGscData(from: Date, to: Date) {
  // Use OAuth2 client credentials from environment
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN; // You need to generate and add this to your env
  const siteUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL;

  if (!clientId || !clientSecret || !refreshToken || !siteUrl) {
    throw new Error('Missing Google API credentials or site URL in environment variables');
  }

  const auth = new google.auth.OAuth2(clientId, clientSecret);
  auth.setCredentials({ refresh_token: refreshToken });

  const searchconsole = google.searchconsole({ version: 'v1', auth });

  try {
    const response = await searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: from.toISOString().slice(0, 10),
        endDate: to.toISOString().slice(0, 10),
        dimensions: ['date'],
        type: 'discover',
        rowLimit: 10000,
      },
    });
    return response.data;
  } catch (error) {
    console.error('GSC error:', error);
    throw new Error('Error fetching Search Console data');
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const range = searchParams.get('range');
  try {
    const cacheRaw = await fs.readFile(CACHE_PATH, 'utf-8');
    const cache = JSON.parse(cacheRaw);
    if (range && cache[range]) {
      return NextResponse.json(cache[range]);
    }
    return NextResponse.json(cache);
  } catch (e) {
    return NextResponse.json({ error: 'No cache available' }, { status: 404 });
  }
}

export async function POST() {
  // Fetch and cache all preset ranges and months
  const cache: Record<string, any> = {};
  // Presets
  for (const preset of PRESETS) {
    const to = new Date();
    const from = subDays(to, preset.days);
    cache[preset.key] = await fetchGscData(from, to);
  }
  // Months
  for (const month of getMonthsList()) {
    cache[month.key] = await fetchGscData(month.from, month.to);
  }
  await fs.writeFile(CACHE_PATH, JSON.stringify(cache), 'utf-8');
  return NextResponse.json({ status: 'ok', updated: new Date().toISOString() });
} 