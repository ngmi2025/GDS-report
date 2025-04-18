import { NextResponse } from 'next/server';
import { CONTENT_CATEGORIES, type ContentCategory } from '@/lib/services/title-analysis';

interface Article {
  Title: string;
  "Final URL": string;
  Clicks: number;
  Impressions: number;
}

interface TitleExample {
  title: string;
  clicks: number;
  impressions: number;
  ctr: number;
}

interface PatternInsight {
  pattern: string;
  examples: TitleExample[];
  totalClicks: number;
  totalImpressions: number;
  averageCTR: number;
}

interface CategoryInsight {
  category: string;
  patterns: PatternInsight[];
  recommendations: string[];
  elements: {
    commonPrefixes: string[];
    commonFormats: string[];
    lengthStats: {
      optimal: string;
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

function matchesPattern(title: string, pattern: string): boolean {
  try {
    // Handle special patterns
    if (pattern === "[0-9]+ Things") {
      return /\d+\s+(things|ways|tips|tricks|reasons|spots|places|destinations)/i.test(title);
    }

    // Convert pattern to a simple word/phrase match
    const normalizedPattern = pattern.toLowerCase();
    const normalizedTitle = title.toLowerCase();

    // For "vs" pattern, check for "vs", "vs.", "versus"
    if (pattern === "vs") {
      return /\bvs\.?\b|\bversus\b/i.test(normalizedTitle);
    }

    // For other patterns, do a simple includes check
    return normalizedTitle.includes(normalizedPattern);
  } catch (error) {
    console.error('Error matching pattern:', pattern, error);
    return false;
  }
}

function calculateAverageCTR(articles: Article[]): number {
  if (articles.length === 0) return 0;
  const totalCTR = articles.reduce((sum, article) => 
    sum + (article.Clicks / article.Impressions * 100), 0
  );
  return totalCTR / articles.length;
}

export async function POST(request: Request) {
  try {
    // Validate request body
    const body = await request.json();
    if (!body?.articles || !Array.isArray(body.articles)) {
      return NextResponse.json(
        { error: 'Invalid request body. Expected { articles: Article[] }' },
        { status: 400 }
      );
    }

    const { articles, category = 'All' } = body as { articles: Article[], category: ContentCategory };

    // Sort articles by clicks first
    const sortedArticles = [...articles].sort((a, b) => b.Clicks - a.Clicks);

    // Analyze patterns
    const patterns: PatternInsight[] = TITLE_PATTERNS.map(pattern => {
      const matchingArticles = sortedArticles.filter(article => matchesPattern(article.Title, pattern));
      
      return {
        pattern,
        examples: matchingArticles.map(article => ({
          title: article.Title,
          clicks: article.Clicks,
          impressions: article.Impressions,
          ctr: (article.Clicks / article.Impressions) * 100
        })),
        totalClicks: 0,
        totalImpressions: 0,
        averageCTR: 0
      };
    });

    // Calculate metrics for each pattern
    patterns.forEach(pattern => {
      if (pattern.examples.length > 0) {
        pattern.totalClicks = pattern.examples.reduce((sum, ex) => sum + ex.clicks, 0);
        pattern.totalImpressions = pattern.examples.reduce((sum, ex) => sum + ex.impressions, 0);
        pattern.averageCTR = pattern.examples.reduce((sum, ex) => sum + ex.ctr, 0) / pattern.examples.length;
      }
    });

    // Filter out patterns with no examples and sort by avg clicks per article, then CTR
    const validPatterns = patterns
      .filter(p => p.examples.length > 0)
      .sort((a, b) => {
        // Calculate avg clicks per article
        const aAvgClicks = a.totalClicks / a.examples.length;
        const bAvgClicks = b.totalClicks / b.examples.length;
        
        // If avg clicks are significantly different, sort by that
        if (Math.abs(aAvgClicks - bAvgClicks) > 100) {
          return bAvgClicks - aAvgClicks;
        }
        
        // If avg clicks are similar, use CTR as a tiebreaker
        return b.averageCTR - a.averageCTR;
      });

    // Generate insights
    const categoryInsight: CategoryInsight = {
      category,
      patterns: validPatterns,
      recommendations: validPatterns
        .slice(0, 3)
        .map(p => {
          const avgClicks = Math.round(p.totalClicks / p.examples.length);
          return `Titles using "${p.pattern}" pattern average ${avgClicks.toLocaleString()} clicks with ${p.averageCTR.toFixed(1)}% CTR (${p.examples.length} articles)`;
        }),
      elements: {
        commonPrefixes: validPatterns.slice(0, 3).map(p => p.pattern),
        commonFormats: [
          "Question format (What, How, Why)",
          "List format (Top X, Best X)",
          "Guide format (Complete Guide, Ultimate Guide)"
        ],
        lengthStats: {
          optimal: "60-100 characters",
          range: "40-120 characters"
        }
      }
    };

    return NextResponse.json({ insights: [categoryInsight] });
  } catch (error) {
    console.error('Error analyzing titles:', error);
    return NextResponse.json(
      { error: 'Failed to analyze titles', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 