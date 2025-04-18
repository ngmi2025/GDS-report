import { type ContentSheetData } from '@/lib/hooks/useSheetData';

// Define the categories to match the Content Performance section
export const CONTENT_CATEGORIES = [
  'Credit Cards',
  'Airlines & Flights',
  'Hotels & Resorts',
  'Loyalty & Rewards',
  'Airport Experience',
  'Travel Tips',
  'Travel Deals',
  'Destinations'
] as const;

export type ContentCategory = typeof CONTENT_CATEGORIES[number] | 'All';

export interface TitlePattern {
  pattern: string;
  examples: Array<{
    title: string;
    clicks: number;
    impressions: number;
    ctr: number;
  }>;
  totalClicks: number;
  totalImpressions: number;
  averageCTR: number;
}

export interface CategoryInsights {
  category: string;
  patterns: TitlePattern[];
  recommendations: string[];
  elements: {
    commonPrefixes: string[];
    commonFormats: string[];
    lengthStats: {
      optimal: number;
      range: string;
    };
  };
}

// Common title patterns to analyze
const TITLE_PATTERNS = [
  "How to",
  "Best",
  "Top",
  "Review",
  "Guide",
  "vs",
  "Ultimate",
  "Complete",
  "[0-9]+ Things",
  "What to",
  "Where to",
  "When to"
];

export async function analyzeTitlesForCategory(articles: ContentSheetData[], selectedCategory: ContentCategory = 'All') {
  try {
    // Filter articles by category if a specific one is selected
    let categoryArticles = articles;
    if (selectedCategory !== 'All') {
      categoryArticles = articles
        .filter(article => detectContentCategory(article.Title, article["Final URL"]) === selectedCategory)
        .sort((a, b) => b.Clicks - a.Clicks)
        .slice(0, 100); // Take top 100 articles for analysis
    }

    const response = await fetch('/api/analyze-titles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        articles: categoryArticles,
        category: selectedCategory 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to analyze titles');
    }

    const insights = await response.json();
    return insights.insights || [];
  } catch (error) {
    console.error('Error analyzing titles:', error);
    throw error;
  }
}

// Helper function to detect content category
function detectContentCategory(title: string, url: string): ContentCategory {
  const lowercaseTitle = title.toLowerCase();
  const lowercaseUrl = url.toLowerCase();

  // Check URL first as it's more reliable
  if (url.includes('/credit-cards/')) return 'Credit Cards';
  if (url.includes('/airlines/') || url.includes('/flights/')) return 'Airlines & Flights';
  if (url.includes('/hotels/') || url.includes('/resorts/')) return 'Hotels & Resorts';
  if (url.includes('/rewards/') || url.includes('/points/') || url.includes('/miles/')) return 'Loyalty & Rewards';
  if (url.includes('/airport/') || url.includes('/lounge/')) return 'Airport Experience';
  if (url.includes('/tips/') || url.includes('/guide/') || url.includes('/how-to/')) return 'Travel Tips';
  if (url.includes('/deals/') || url.includes('/sale/') || url.includes('/offer/')) return 'Travel Deals';
  if (url.includes('/destinations/')) return 'Destinations';

  // Fallback to title analysis if URL doesn't match
  if (lowercaseTitle.includes('credit card') || lowercaseTitle.includes('amex') || lowercaseTitle.includes('chase')) return 'Credit Cards';
  if (lowercaseTitle.includes('airline') || lowercaseTitle.includes('flight') || lowercaseTitle.includes('business class')) return 'Airlines & Flights';
  if (lowercaseTitle.includes('hotel') || lowercaseTitle.includes('resort') || lowercaseTitle.includes('stay')) return 'Hotels & Resorts';
  if (lowercaseTitle.includes('points') || lowercaseTitle.includes('miles') || lowercaseTitle.includes('rewards')) return 'Loyalty & Rewards';
  if (lowercaseTitle.includes('airport') || lowercaseTitle.includes('lounge')) return 'Airport Experience';
  if (lowercaseTitle.includes('guide') || lowercaseTitle.includes('how to') || lowercaseTitle.includes('tips')) return 'Travel Tips';
  if (lowercaseTitle.includes('deal') || lowercaseTitle.includes('sale') || lowercaseTitle.includes('offer')) return 'Travel Deals';
  if (lowercaseTitle.includes('destination') || lowercaseTitle.includes('city') || lowercaseTitle.includes('country')) return 'Destinations';

  return 'All';
}

function matchesPattern(title: string, pattern: string): boolean {
  try {
    // Escape special regex characters and handle spaces properly
    const escapedPattern = pattern
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\s+/g, '\\s+');
    
    // Create regex that matches case insensitive
    const regex = new RegExp(escapedPattern, 'i');
    
    return regex.test(title);
  } catch (error) {
    console.error('Invalid pattern:', pattern, error);
    return false;
  }
}

function calculateAverageCTR(articles: ContentSheetData[]): number {
  if (articles.length === 0) return 0;
  const totalClicks = articles.reduce((sum, article) => sum + article.Clicks, 0);
  const totalImpressions = articles.reduce((sum, article) => sum + article.Impressions, 0);
  return totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
} 