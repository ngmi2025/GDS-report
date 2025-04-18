"use client";

import { useState, useEffect } from "react";
import { useSheetData, type ContentSheetData } from "@/lib/hooks/useSheetData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, Treemap } from 'recharts';
import { TrendingUp, TrendingDown, Users, Clock, Award, Target, ArrowUpDown, ArrowUp, ArrowDown, Search, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Download } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { TitleInsights } from "@/components/title-insights";
import { analyzeTitlesForCategory, type CategoryInsights } from '@/lib/services/title-analysis';

// Update the SortField type to remove lastClickDate
type SortField = 'clicks' | 'impressions' | 'ctr' | 'publishedDate' | 'lastUpdated';
type SortDirection = 'asc' | 'desc';

interface SortState {
  field: SortField;
  direction: SortDirection;
}

// Add SortIcon component
const SortIcon = ({ field, currentSort }: { field: SortField; currentSort: SortState }) => {
  if (currentSort.field !== field) {
    return <ArrowUpDown className="ml-2 h-4 w-4" />;
  }
  return currentSort.direction === 'asc' 
    ? <ArrowUp className="ml-2 h-4 w-4" />
    : <ArrowDown className="ml-2 h-4 w-4" />;
};

interface InsightsProps {
  sheetName: string;
}

// Define categories with their respective keywords
const CATEGORIES = {
  'Credit Cards': [
    'amex', 'american express', 'chase', 'sapphire', 'credit card', 'platinum card',
    'capital one', 'venture', 'business platinum', 'gold card', 'green card',
    'navy federal', 'citi', 'costco card', 'ritz-carlton card'
  ],
  'Airlines & Flights': [
    'airline', 'flight', 'business class', 'frontier', 'delta', 'united',
    'ana', 'japan airlines', 'hawaiian airlines', 'southwest', 'companion pass',
    'medallion status', 'sky club', 'first class', 'bulkhead', 'legroom'
  ],
  'Hotels & Resorts': [
    'hilton', 'hotel', 'resort', 'marriott', 'bonvoy', 'wyndham', 'mgm',
    'titanium elite', 'diamond status', 'elite status', 'all-inclusive',
    'punta cana', 'ritz-carlton'
  ],
  'Loyalty & Rewards': [
    'points', 'miles', 'rewards', 'status', 'membership rewards',
    'ultimate rewards', 'avios', 'transfer', 'welcome bonus', 'welcome offer',
    'bonus points', 'cash back', 'fast track'
  ],
  'Airport Experience': [
    'lounge', 'centurion lounge', 'priority pass', 'security lines',
    'global lounge', 'air canada lounges', 'sky club'
  ],
  'Travel Tips': [
    'guide', 'how to', 'tips', 'hack', 'review', 'best ways',
    'comparison', 'worth it', 'maximize', 'golden rules'
  ],
  'Travel Deals': [
    'sale', 'alert', 'availability', 'offer', 'flash sale',
    'award alert', 'status match', 'bonus categories'
  ],
  'Destinations': [
    'tokyo', 'london', 'amsterdam', 'europe', 'spain',
    'dominican republic', 'around the world', 'u.s.'
  ]
};

// Helper function to detect content category
const detectCategory = (title: string, url: string): string => {
  if (!title) return 'Other';
  
  const lowercaseTitle = title.toLowerCase();
  const lowercaseUrl = url.toLowerCase();
  
  // Check both title and URL against category keywords
  for (const [category, keywords] of Object.entries(CATEGORIES)) {
    if (keywords.some(keyword => 
      lowercaseTitle.includes(keyword) || lowercaseUrl.includes(keyword)
    )) {
      return category;
    }
  }
  
  return 'Other';
};

interface ContentMetrics {
  totalClicks: number;
  totalImpressions: number;
  averageCTR: number;
  topPerformingArticles: TopPerformerMetrics[];
  categoryDistribution: CategoryDistribution[];
}

interface AuthorMetrics {
  author: string;
  totalClicks: number;
  totalImpressions: number;
  averageCTR: number;
  articleCount: number;
  recentArticles: number; // articles in last 30 days
  needsUpdate: number; // articles older than 180 days
  topCategories: CategoryMetrics[];
  performance: {
    trend: 'up' | 'down' | 'stable';
    percentageChange: number;
    aboveAverageArticles: number;
  };
}

interface ContentHealth {
  title: string;
  author: string;
  publishedDate: string;
  clicks: number;
  impressions: number;
  ctr: number;
  isLoadingLastClick?: boolean;
  lastClickDate?: string;
  daysSinceUpdate: number;
  url: string;
  lastUpdated: string;
}

interface CategoryMetrics {
  category: string;
  articles: number;
  clicks: number;
  ctr: number;
  trend: 'up' | 'down' | 'stable';
}

interface TopPerformerMetrics {
  title: string;
  url: string;
  clicks: number;
  impressions: number;
  ctr: number;
  trend: 'up' | 'down' | 'stable';
  percentageChange: number;
}

// Update the Category Distribution interface
interface CategoryDistribution {
  category: string;
  count: number;
  percentage: number;
  clicks: number;
  impressions: number;
  ctr: number;
}

// Add new interfaces for enhanced author metrics
interface AuthorExpertise {
  category: string;
  articles: number;
  clicks: number;
  avgCTR: number;
  strength: 'strong' | 'moderate' | 'developing';
}

interface AuthorActivity {
  totalArticles: number;
  articlesLast30Days: number;
  averageUpdateFrequency: number;
  contentFreshnessScore: number;
}

interface EnhancedAuthorMetrics extends AuthorMetrics {
  expertise: AuthorExpertise[];
  activity: AuthorActivity;
  badges: string[];
}

// Add new interfaces for enhanced author metrics
interface AuthorPerformanceMetrics {
  name: string;
  totalArticles: number;
  articlesNeedingUpdate: number;  // 365+ days since last update
  last90Days: {
    clicks: number;
    articlesInDiscover: number;
    avgClicksPerArticle: number;
  }
  performanceLevel: 'below_average' | 'average' | 'above_average' | 'top_performer';
  topCategories: {
    category: string;
    articles: number;
    avgCTR: number;
    trend: 'up' | 'down' | 'stable';
  }[];
}

// Add date range type
type DateRange = '7d' | '28d' | '3m' | '16m';

// Helper function to parse dates in various formats
function parseDate(dateStr: string): Date {
  if (!dateStr) return new Date();

  // Try parsing ISO format first
  let date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date;
  }

  // Try parsing MM/DD/YYYY format
  const mmddyyyy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(dateStr);
  if (mmddyyyy) {
    const [_, month, day, year] = mmddyyyy;
    date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  // If all parsing fails, return current date
  console.warn(`Invalid date format: ${dateStr}`);
  return new Date();
}

// Helper function to safely format dates
function formatDate(date: Date | string | undefined): string {
  try {
    if (!date) return 'N/A';
    const parsedDate = typeof date === 'string' ? parseDate(date) : date;
    if (isNaN(parsedDate.getTime())) return 'N/A';
    return format(parsedDate, 'MMM d, yyyy');
  } catch (error) {
    console.warn(`Error formatting date: ${date}`, error);
    return 'N/A';
  }
}

// Add helper functions after the parseDate function
const calculateHealthScore = (
  daysSinceUpdate: number,
  ctr: number,
  categoryAvgCTR: number,
  impressions: number,
  categoryAvgImpressions: number
): number => {
  const timeScore = Math.max(0, 100 - (daysSinceUpdate / 2)); // Older content gets lower score
  const ctrScore = (ctr / categoryAvgCTR) * 100;
  const impressionScore = (impressions / categoryAvgImpressions) * 100;
  
  return Math.round((timeScore * 0.4) + (ctrScore * 0.3) + (impressionScore * 0.3));
};

const getPerformanceAlerts = (
  ctr: number,
  categoryAvgCTR: number,
  impressions: number,
  categoryAvgImpressions: number,
  daysSinceUpdate: number
): string[] => {
  const alerts: string[] = [];
  
  if (ctr < categoryAvgCTR * 0.7) {
    alerts.push("CTR significantly below category average");
  }
  if (impressions < categoryAvgImpressions * 0.5) {
    alerts.push("Low impression volume");
  }
  if (daysSinceUpdate > 90) {
    alerts.push("Content needs refresh");
  }
  if (ctr < categoryAvgCTR * 0.5 && impressions > categoryAvgImpressions) {
    alerts.push("High impressions but poor CTR - review title and content");
  }
  
  return alerts;
};

const transformContentData = (data: ContentSheetData[]): ContentHealth[] => {
  return data.map(article => {
    const publishDate = new Date(article["Published Date"]);
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      title: article.Title,
      author: article.Author,
      publishedDate: article["Published Date"],
      clicks: article.Clicks,
      impressions: article.Impressions,
      ctr: article.CTR,
      isLoadingLastClick: false,
      lastClickDate: article["Last Click Date"],
      daysSinceUpdate: daysDiff,
      url: article.URL || '',
      lastUpdated: article["Last Updated"] || article["Published Date"]
    };
  });
};

// Add helper function to get category from URL
const getCategoryFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    const travelIndex = pathParts.indexOf('travel');
    
    if (travelIndex !== -1 && travelIndex + 1 < pathParts.length) {
      const category = pathParts[travelIndex + 1];
      return category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ');
    }
    
    return 'Other';
  } catch {
    return 'Other';
  }
};

export function Insights({ sheetName }: InsightsProps) {
  const { data, loading: isLoading, error } = useSheetData<ContentSheetData>(sheetName);
  const [contentMetrics, setContentMetrics] = useState<ContentMetrics | null>(null);
  const [authorMetrics, setAuthorMetrics] = useState<AuthorMetrics[]>([]);
  const [contentHealth, setContentHealth] = useState<ContentHealth[]>([]);
  const [topContentPage, setTopContentPage] = useState(1);
  const [topContentSort, setTopContentSort] = useState<SortState>({
    field: 'clicks',
    direction: 'desc'
  });
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedMetric, setSelectedMetric] = useState<'clicks' | 'impressions' | 'ctr' | 'articles'>('clicks');
  const [healthTablePage, setHealthTablePage] = useState(1);
  const [healthRowsPerPage, setHealthRowsPerPage] = useState(10);
  const [healthTableSort, setHealthTableSort] = useState<SortState>({
    field: 'lastUpdated',
    direction: 'asc'
  });
  const [healthSearchQuery, setHealthSearchQuery] = useState('');
  const [selectedHealthAuthor, setSelectedHealthAuthor] = useState<string>("all");
  const [authorSearchQuery, setAuthorSearchQuery] = useState('');
  const [insights, setInsights] = useState<CategoryInsights[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'clicks' | 'ctr'>('clicks');
  const [categoryMetrics, setCategoryMetrics] = useState<CategoryMetrics[]>([]);

  // Add sorting handler
  const handleTopContentSort = (field: SortField) => {
    setTopContentSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  // Add new function to handle health table sorting
  const handleHealthTableSort = (field: SortField) => {
    setHealthTableSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  useEffect(() => {
    if (data) {
      const metrics: ContentMetrics = {
        totalClicks: 0,
        totalImpressions: 0,
        averageCTR: 0,
        topPerformingArticles: [],
        categoryDistribution: []
      };

      // Initialize author stats
      const authorStats: { [key: string]: AuthorMetrics } = {};

      // Calculate content health
      const healthMetrics: ContentHealth[] = [];

      // Initialize category metrics
      const categoryMetrics: { [key: string]: { clicks: number; impressions: number; articles: number } } = {};

      data.forEach(article => {
        // Content metrics
        metrics.totalClicks += article.Clicks;
        metrics.totalImpressions += article.Impressions;

        // Author metrics
        if (!authorStats[article.Author]) {
          authorStats[article.Author] = {
            author: article.Author,
            totalClicks: 0,
            totalImpressions: 0,
            averageCTR: 0,
            articleCount: 0,
            topCategories: [],
            performance: {
              trend: 'stable',
              percentageChange: 0,
              aboveAverageArticles: 0
            },
            recentArticles: 0,
            needsUpdate: 0
          };
        }

        const stats = authorStats[article.Author];
        stats.totalClicks += article.Clicks;
        stats.totalImpressions += article.Impressions;
        stats.articleCount += 1;

        // Calculate CTR for each author
        if (stats.totalImpressions > 0) {
          stats.averageCTR = (stats.totalClicks / stats.totalImpressions) * 100;
        }

        const category = detectCategory(article.Title, article["Final URL"]);

        // Update author's top categories
        const authorCats = stats.topCategories;
        const existingCat = authorCats.find(c => c.category === category);
        if (existingCat) {
          existingCat.clicks += article.Clicks;
          existingCat.articles += 1;
        } else {
          authorCats.push({
            category,
            articles: 1,
            clicks: article.Clicks,
            ctr: article.CTR,
            trend: 'stable'
          });
        }

        // Update author's performance
        stats.performance = {
          trend: article.CTR > stats.averageCTR ? 'up' : 'down',
          percentageChange: stats.averageCTR > 0 
            ? ((article.CTR - stats.averageCTR) / stats.averageCTR * 100)
            : 0,
          aboveAverageArticles: article.CTR > stats.averageCTR ? 1 : 0
        };

        // Update author's recent articles
        stats.recentArticles += 1;
        stats.needsUpdate += article.CTR < stats.averageCTR ? 1 : 0;

        // Content health
        const lastUpdated = parseDate(article["Updated Date"]);
        const daysSinceUpdate = Math.floor((new Date().getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
        
        healthMetrics.push({
          title: article.Title,
          author: article.Author,
          publishedDate: article["Published Date"],
          clicks: article.Clicks,
          impressions: article.Impressions,
          ctr: article.CTR,
          isLoadingLastClick: true,
          lastClickDate: article["Last Click Date"],
          daysSinceUpdate: daysSinceUpdate,
          url: article.URL || '',
          lastUpdated: article["Last Updated"] || article["Published Date"]
        });

        // Process category metrics
        if (!categoryMetrics[category]) {
          categoryMetrics[category] = { clicks: 0, impressions: 0, articles: 0 };
        }
        categoryMetrics[category].clicks += article.Clicks;
        categoryMetrics[category].impressions += article.Impressions;
        categoryMetrics[category].articles += 1;
      });

      // Calculate averages and sort data
      metrics.averageCTR = metrics.totalImpressions > 0 
        ? (metrics.totalClicks / metrics.totalImpressions) * 100 
        : 0;

      // Sort and get top performing articles
      metrics.topPerformingArticles = data
        .sort((a, b) => b.Clicks - a.Clicks)
        .slice(0, 100)
        .map(article => ({
          title: article.Title,
          url: article["Final URL"],
          clicks: article.Clicks,
          impressions: article.Impressions,
          ctr: article.CTR,
          trend: 'stable',
          percentageChange: 0
        }));

      // Calculate category distribution with performance metrics
      metrics.categoryDistribution = Object.entries(categoryMetrics)
        .map(([category, stats]) => ({
          category,
          count: stats.articles,
          percentage: (stats.articles / data.length) * 100,
          clicks: stats.clicks,
          impressions: stats.impressions,
          ctr: stats.impressions > 0 ? (stats.clicks / stats.impressions) * 100 : 0
        }))
        .sort((a, b) => b.clicks - a.clicks);

      // Sort categories by clicks for each author
      Object.values(authorStats).forEach(author => {
        author.topCategories.sort((a, b) => b.clicks - a.clicks);
      });

      // Sort authors by total clicks
      const sortedAuthorMetrics = Object.values(authorStats)
        .sort((a, b) => b.totalClicks - a.totalClicks);

      setContentMetrics(metrics);
      setAuthorMetrics(sortedAuthorMetrics);
      setContentHealth(healthMetrics.sort((a, b) => b.daysSinceUpdate - a.daysSinceUpdate));

      // Analyze titles
      const analyzeAllTitles = async () => {
        setLoading(true);
        try {
          const categoryInsights = await analyzeTitlesForCategory(data);
          setInsights(categoryInsights);
        } catch (err) {
          console.error('Error analyzing titles:', err);
        } finally {
          setLoading(false);
        }
      };

      analyzeAllTitles();
    }
  }, [data]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const categoryInsights = await analyzeTitlesForCategory(data);
      setInsights(categoryInsights);
    } catch (err) {
      console.error('Error analyzing titles:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredInsights = insights.filter(insight => 
    selectedCategory === 'all' || insight.category === selectedCategory
  );

  const sortedInsights = [...filteredInsights].sort((a, b) => {
    if (sortBy === 'clicks') {
      return b.patterns.reduce((sum, p) => sum + p.totalClicks, 0) - 
             a.patterns.reduce((sum, p) => sum + p.totalClicks, 0);
    } else {
      return b.patterns.reduce((sum, p) => sum + p.averageCTR, 0) - 
             a.patterns.reduce((sum, p) => sum + p.averageCTR, 0);
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-5 w-[400px]" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">Error loading insights: {error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Content Insights</h2>
        <p className="text-muted-foreground">Google Discover performance metrics over the last 16 months</p>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="authors">Authors</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
          <TabsTrigger value="titles">Title Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(contentMetrics?.totalClicks || 0)}</div>
                <div className="text-xs text-muted-foreground">
                  +20.1% from last month
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{contentMetrics?.totalImpressions.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average CTR</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{contentMetrics?.averageCTR.toFixed(2)}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.length.toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="mr-2 h-5 w-5" />
                  Top Performing Content
                </CardTitle>
                <CardDescription>Articles with highest engagement in Google Discover</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[400px]">Title</TableHead>
                        <TableHead className="text-center cursor-pointer hover:bg-muted/50" onClick={() => handleTopContentSort('clicks')}>
                          <div className="flex items-center justify-center">
                            Clicks
                            <SortIcon field="clicks" currentSort={topContentSort} />
                          </div>
                        </TableHead>
                        <TableHead className="text-center cursor-pointer hover:bg-muted/50" onClick={() => handleTopContentSort('impressions')}>
                          <div className="flex items-center justify-center">
                            Impressions
                            <SortIcon field="impressions" currentSort={topContentSort} />
                          </div>
                        </TableHead>
                        <TableHead className="text-center cursor-pointer hover:bg-muted/50" onClick={() => handleTopContentSort('ctr')}>
                          <div className="flex items-center justify-center">
                            CTR
                            <SortIcon field="ctr" currentSort={topContentSort} />
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contentMetrics?.topPerformingArticles
                        .slice((topContentPage - 1) * rowsPerPage, topContentPage * rowsPerPage)
                        .map((article, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <a 
                                href={article.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="font-medium hover:underline"
                              >
                                {article.title}
                              </a>
                            </TableCell>
                            <TableCell className="text-center">{formatNumber(article.clicks)}</TableCell>
                            <TableCell className="text-center">{formatNumber(article.impressions)}</TableCell>
                            <TableCell className="text-center">{article.ctr.toFixed(2)}%</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex items-center justify-between space-x-2 py-4">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-muted-foreground">
                      Show
                    </p>
                    <Select
                      value={rowsPerPage.toString()}
                      onValueChange={(value) => {
                        setRowsPerPage(Number(value));
                        setTopContentPage(1);
                      }}
                    >
                      <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue placeholder={rowsPerPage.toString()} />
                      </SelectTrigger>
                      <SelectContent side="top">
                        {[10, 25, 50, 100].map((value) => (
                          <SelectItem key={value} value={value.toString()}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      per page
                    </p>
                  </div>
                  <div className="flex-1 text-sm text-muted-foreground text-center">
                    Showing {((topContentPage - 1) * rowsPerPage) + 1} to {Math.min(topContentPage * rowsPerPage, contentMetrics?.topPerformingArticles.length || 0)} of {contentMetrics?.topPerformingArticles.length || 0} articles
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTopContentPage((prev) => Math.max(1, prev - 1))}
                      disabled={topContentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTopContentPage((prev) => prev + 1)}
                      disabled={topContentPage * rowsPerPage >= (contentMetrics?.topPerformingArticles.length || 0)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Target className="mr-2 h-5 w-5" />
                    <div>
                      <CardTitle>Category Distribution</CardTitle>
                      <CardDescription>Content performance by category</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={selectedMetric === 'clicks' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedMetric('clicks')}
                      className={cn("h-8", 
                        selectedMetric === 'clicks' ? "bg-blue-500 hover:bg-blue-600" : "hover:bg-blue-500/10"
                      )}
                    >
                      Clicks
                    </Button>
                    <Button
                      variant={selectedMetric === 'impressions' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedMetric('impressions')}
                      className={cn("h-8",
                        selectedMetric === 'impressions' ? "bg-purple-500 hover:bg-purple-600" : "hover:bg-purple-500/10"
                      )}
                    >
                      Impressions
                    </Button>
                    <Button
                      variant={selectedMetric === 'ctr' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedMetric('ctr')}
                      className={cn("h-8",
                        selectedMetric === 'ctr' ? "bg-gray-500 hover:bg-gray-600" : "hover:bg-gray-500/10"
                      )}
                    >
                      CTR
                    </Button>
                    <Button
                      variant={selectedMetric === 'articles' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedMetric('articles')}
                      className={cn("h-8",
                        selectedMetric === 'articles' ? "bg-blue-400 hover:bg-blue-500" : "hover:bg-blue-400/10"
                      )}
                    >
                      Articles
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={contentMetrics?.categoryDistribution
                        .sort((a, b) => {
                          const getValue = (item: CategoryDistribution) => {
                            switch (selectedMetric) {
                              case 'clicks': return item.clicks;
                              case 'impressions': return item.impressions;
                              case 'ctr': return item.ctr;
                              case 'articles': return item.count;
                              default: return item.clicks;
                            }
                          };
                          return getValue(b) - getValue(a);
                        })
                        .map(category => ({
                          name: category.category,
                          value: selectedMetric === 'clicks' ? category.clicks :
                                 selectedMetric === 'impressions' ? category.impressions :
                                 selectedMetric === 'ctr' ? category.ctr :
                                 category.count
                        }))}
                      margin={{ top: 20, right: 30, left: 40, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        interval={0}
                        tick={{ fill: '#888888' }}
                      />
                      <YAxis 
                        tickFormatter={(value) => new Intl.NumberFormat('en-US').format(value)}
                        tick={{ fill: '#888888' }}
                        width={80}
                      />
                      <Tooltip
                        formatter={(value: number) => [
                          selectedMetric === 'ctr' 
                            ? `${value.toFixed(2)}%`
                            : new Intl.NumberFormat('en-US').format(value),
                          selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)
                        ]}
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '6px',
                          padding: '8px 12px'
                        }}
                        labelStyle={{
                          color: '#e5e7eb',
                          fontWeight: 600,
                          marginBottom: '4px'
                        }}
                        itemStyle={{
                          color: '#9ca3af',
                          padding: '2px 0'
                        }}
                        cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                      />
                      <Bar
                        dataKey="value"
                        fill={
                          selectedMetric === 'clicks' ? "#3b82f6" :  // blue-500
                          selectedMetric === 'impressions' ? "#a855f7" :  // purple-500
                          selectedMetric === 'ctr' ? "#6b7280" :  // gray-500
                          "#60a5fa"  // blue-400
                        }
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="authors" className="space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Author Performance</CardTitle>
                <CardDescription>Content performance metrics and insights by author</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search authors..."
                    value={authorSearchQuery}
                    onChange={(e) => setAuthorSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Author</TableHead>
                      <TableHead className="text-center">Clicks</TableHead>
                      <TableHead className="text-center">Impressions</TableHead>
                      <TableHead className="text-center">CTR</TableHead>
                      <TableHead className="text-center">Articles</TableHead>
                      <TableHead className="text-center">Avg Article Clicks</TableHead>
                      <TableHead className="text-center bg-muted/50" colSpan={3}>
                        <div className="flex flex-col">
                          <span>Best Category Performance</span>
                          <div className="grid grid-cols-3 text-sm font-normal mt-1">
                            <span>Category</span>
                            <span>Clicks</span>
                            <span>Avg Clicks</span>
                          </div>
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {authorMetrics
                      .filter(author => 
                        author.author.toLowerCase().includes(authorSearchQuery.toLowerCase())
                      )
                      .map((author, index) => {
                        const bestCategory = author.topCategories
                          .sort((a, b) => b.clicks - a.clicks)
                          .find(cat => cat.category !== 'Other') || author.topCategories[0];

                        const avgArticleClicks = Math.round(author.totalClicks / author.articleCount);
                        const avgCategoryClicks = Math.round((bestCategory?.clicks || 0) / (bestCategory?.articles || 1));

                        return (
                          <TableRow key={index}>
                            <TableCell>
                              <span className="font-medium">{author.author}</span>
                            </TableCell>
                            <TableCell className="text-center">
                              {formatNumber(author.totalClicks)}
                            </TableCell>
                            <TableCell className="text-center">
                              {formatNumber(author.totalImpressions)}
                            </TableCell>
                            <TableCell className="text-center">
                              {author.totalImpressions > 0 
                                ? (author.totalClicks / author.totalImpressions * 100).toFixed(2) 
                                : '0.00'}%
                            </TableCell>
                            <TableCell className="text-center">
                              {author.articleCount}
                            </TableCell>
                            <TableCell className="text-center">
                              {formatNumber(avgArticleClicks)}
                            </TableCell>
                            <TableCell className="text-center bg-muted/10">
                              <Badge variant="outline" className="text-xs">
                                {bestCategory?.category || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center bg-muted/10">
                              {formatNumber(bestCategory?.clicks || 0)}
                            </TableCell>
                            <TableCell className="text-center bg-muted/10">
                              {formatNumber(avgCategoryClicks)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Freshness & Performance</CardTitle>
              <CardDescription>Track article updates and engagement metrics to maintain content relevance</CardDescription>
              
              {/* Add search and filter controls */}
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search articles..."
                      value={healthSearchQuery}
                      onChange={(e) => setHealthSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <div className="w-[200px] flex-shrink-0">
                    <Select
                      value={selectedHealthAuthor}
                      onValueChange={setSelectedHealthAuthor}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Authors" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Authors</SelectItem>
                        {Array.from(new Set(contentHealth.map(item => item.author))).sort().map((author) => (
                          <SelectItem key={author} value={author}>
                            {author}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[400px]">Title</TableHead>
                        <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleHealthTableSort('publishedDate')}>
                          <div className="flex items-center">
                            Published Date
                            <SortIcon field="publishedDate" currentSort={healthTableSort} />
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleHealthTableSort('lastUpdated')}>
                          <div className="flex items-center">
                            Last Updated
                            <SortIcon field="lastUpdated" currentSort={healthTableSort} />
                          </div>
                        </TableHead>
                        <TableHead className="text-center">Update Status</TableHead>
                        <TableHead className="text-center cursor-pointer hover:bg-muted/50" onClick={() => handleHealthTableSort('clicks')}>
                          <div className="flex items-center justify-center">
                            Clicks
                            <SortIcon field="clicks" currentSort={healthTableSort} />
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center">
                            Last Click
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contentHealth
                        .filter(article => {
                          const matchesSearch = article.title.toLowerCase().includes(healthSearchQuery.toLowerCase());
                          const matchesAuthor = selectedHealthAuthor === "all" || article.author === selectedHealthAuthor;
                          return matchesSearch && matchesAuthor;
                        })
                        .sort((a, b) => {
                          const multiplier = healthTableSort.direction === 'asc' ? 1 : -1;
                          if (healthTableSort.field === 'publishedDate') {
                            return (new Date(a.publishedDate).getTime() - new Date(b.publishedDate).getTime()) * multiplier;
                          }
                          if (healthTableSort.field === 'lastUpdated') {
                            return (b.daysSinceUpdate - a.daysSinceUpdate) * multiplier;
                          }
                          return (a.ctr - b.ctr) * multiplier;
                        })
                        .slice(
                          (healthTablePage - 1) * healthRowsPerPage,
                          healthTablePage * healthRowsPerPage
                        )
                        .map((article, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">
                              <a 
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                              >
                                {article.title}
                              </a>
                            </TableCell>
                            <TableCell>{formatDate(article.publishedDate)}</TableCell>
                            <TableCell>{formatDate(article.lastUpdated)}</TableCell>
                            <TableCell className="text-center">
                              <Badge 
                                variant="outline"
                                className={cn(
                                  "font-medium",
                                  article.daysSinceUpdate <= 100
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                    : article.daysSinceUpdate <= 180
                                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                )}
                              >
                                {article.daysSinceUpdate} days
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">{Math.round(article.clicks)}</TableCell>
                            <TableCell>
                              <span className="text-muted-foreground italic">Coming soon</span>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-muted-foreground">
                      Show
                    </p>
                    <Select
                      value={healthRowsPerPage.toString()}
                      onValueChange={(value) => {
                        setHealthRowsPerPage(Number(value));
                        setHealthTablePage(1);
                      }}
                    >
                      <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue placeholder={healthRowsPerPage.toString()} />
                      </SelectTrigger>
                      <SelectContent side="top">
                        {[10, 20, 30, 50, 100].map((value) => (
                          <SelectItem key={value} value={value.toString()}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      per page
                    </p>
                  </div>
                  <div className="flex-1 text-sm text-muted-foreground text-center">
                    Showing {((healthTablePage - 1) * healthRowsPerPage) + 1} to {Math.min(healthTablePage * healthRowsPerPage, contentHealth.length)} of {contentHealth.length} articles
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setHealthTablePage((prev) => Math.max(1, prev - 1))}
                      disabled={healthTablePage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setHealthTablePage((prev) => prev + 1)}
                      disabled={healthTablePage * healthRowsPerPage >= contentHealth.length}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="titles" className="space-y-4">
          <TitleInsights />
        </TabsContent>
      </Tabs>
    </div>
  );
} 