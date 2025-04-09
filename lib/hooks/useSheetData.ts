import { useState, useEffect } from 'react';
import { parse, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';

// Base interface for common fields
interface BaseSheetData {
  "Clicks": number;
  "Impressions": number;
  "CTR": number;
  [key: string]: any;
}

// Interface for content data
export interface ContentSheetData extends BaseSheetData {
  "Original URL": string;
  "Shortened URL": string;
  "Final URL": string;
  "Title": string;
  "Author": string;
  "Published Date": string;
  "Updated Date": string;
  "Position": number;
  "Date": string;
}

// Interface for author data
export interface AuthorSheetData extends BaseSheetData {
  "Author": string;
  "Total Clicks": number;
  "Total Impressions": number;
  "Average CTR (%)": number;
  "Number of Articles": number;
  "Avg Clicks / Article": number;
}

export type SheetData = ContentSheetData | AuthorSheetData;

export function useSheetData<T extends SheetData = SheetData>(sheetName?: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // If no sheet name is provided, return early
      if (!sheetName) {
        setLoading(false);
        setError('No sheet name provided');
        return;
      }

      try {
        console.log(`Fetching data for sheet: ${sheetName}`);
        setLoading(true);
        const response = await fetch(`/api/sheets?sheet=${encodeURIComponent(sheetName)}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`HTTP error! status: ${response.status}, response: ${errorText}`);
          throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
        }
        
        const jsonData = await response.json();
        
        // Check if we got an error response from the Google Script
        if (jsonData.error) {
          console.error(`Sheet error: ${jsonData.error}`, jsonData);
          throw new Error(jsonData.message || jsonData.error);
        }
        
        // Ensure we have the expected data structure
        if (!jsonData.data || !Array.isArray(jsonData.data)) {
          console.error('Invalid data structure:', jsonData);
          throw new Error('Invalid data structure received from API');
        }

        let rows = jsonData.data;
        const isMonthlySheet = !sheetName.toLowerCase().includes('all time');
        const isContentSheet = sheetName.toLowerCase().includes('google discover');
        const isAuthorSheet = sheetName.toLowerCase().includes('author');

        // Parse numeric values for author sheets
        if (isAuthorSheet) {
          rows = rows.map((row: Record<string, any>) => {
            // First ensure we have valid strings or numbers to parse
            const totalClicks = (row["Total Clicks"] || '0').toString();
            const totalImpressions = (row["Total Impressions"] || '0').toString();
            const averageCTR = (row["Average CTR (%)"] || '0').toString();
            const numArticles = (row["Number of Articles"] || '0').toString();
            const avgClicksPerArticle = (row["Avg Clicks / Article"] || '0').toString();

            return {
              ...row,
              "Total Clicks": parseInt(totalClicks, 10),
              "Total Impressions": parseInt(totalImpressions, 10),
              "Average CTR (%)": parseFloat(averageCTR) * 100, // Multiply by 100 to convert decimal to percentage
              "Number of Articles": parseInt(numArticles, 10),
              "Avg Clicks / Article": parseFloat(avgClicksPerArticle)
            };
          });
        }
        
        // Parse numeric values for content sheets
        if (isContentSheet) {
          rows = rows.map((row: Record<string, any>) => {
            // First ensure we have valid strings or numbers to parse
            const clicks = (row["Clicks"] || '0').toString();
            const impressions = (row["Impressions"] || '0').toString();
            const ctr = (row["CTR"] || '0').toString();

            return {
              ...row,
              "Clicks": parseInt(clicks, 10),
              "Impressions": parseInt(impressions, 10),
              "CTR": parseFloat(ctr) * 100 // Multiply by 100 to convert decimal to percentage
            };
          });
        }
        
        // Validate the data matches our expected format based on sheet type
        if (rows.length > 0) {
          const firstRow = rows[0];
          let requiredFields: string[];
          
          if (isAuthorSheet) {
            // Author sheet validation
            requiredFields = ['Author', 'Total Clicks', 'Total Impressions', 'Average CTR (%)', 'Number of Articles', 'Avg Clicks / Article'];
          } else {
            // Content sheet validation
            requiredFields = ['Title', 'Author', 'Clicks', 'Impressions', 'CTR'];
          }
          
          const missingFields = requiredFields.filter(field => !(field in firstRow));
          if (missingFields.length > 0) {
            throw new Error(`Data is missing required fields: ${missingFields.join(', ')}`);
          }
        }
        
        console.log(`Successfully fetched ${rows.length} rows for sheet: ${sheetName}`);
        setData(rows as T[]);
        setError(null);
      } catch (e) {
        console.error(`Error fetching data for sheet ${sheetName}:`, e);
        setError(e instanceof Error ? e.message : 'An error occurred while fetching data');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sheetName]);

  return { data, loading, error };
} 