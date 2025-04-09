"use client";

import { useState, useEffect, useMemo } from "react";
import { useSheetData, type ContentSheetData } from "@/lib/hooks/useSheetData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Star, Sparkles, Search, X, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ContentPerformanceProps {
  sheetName: string;
}

interface SheetRow extends ContentSheetData {
  "Title": string;
  "Author": string;
  "Clicks": number;
  "Impressions": number;
  "CTR": number;
  "Published Date": string;
  "Final URL": string;
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
}

// Add new types for sorting
type SortField = 'Clicks' | 'Impressions' | 'CTR' | 'Published Date';
type SortDirection = 'asc' | 'desc';

interface SortState {
  field: SortField;
  direction: SortDirection;
}

const getAchievementIcon = (clicks: number) => {
  if (clicks >= 100000) {
    return (
      <div className="flex items-center gap-1 relative group">
        <div className="relative">
          <Star className="h-5 w-5 fill-yellow-400 text-yellow-500" aria-label="100k+ clicks" />
          <Sparkles className="h-4 w-4 absolute -top-2 -right-2 text-yellow-400" />
        </div>
        <span className="text-xs font-semibold text-yellow-500 group-hover:opacity-100 opacity-90">100k+</span>
      </div>
    );
  }
  if (clicks >= 50000) {
    return (
      <div className="flex items-center gap-1 group">
        <Star className="h-5 w-5 fill-gray-300 text-gray-400" aria-label="50k+ clicks" />
        <span className="text-xs font-semibold text-gray-500 group-hover:opacity-100 opacity-90">50k+</span>
      </div>
    );
  }
  if (clicks >= 25000) {
    return (
      <div className="flex items-center gap-1 group">
        <Star className="h-5 w-5 fill-amber-600 text-amber-700" aria-label="25k+ clicks" />
        <span className="text-xs font-semibold text-amber-700 group-hover:opacity-100 opacity-90">25k+</span>
      </div>
    );
  }
  return null;
};

export function ContentPerformance({ sheetName }: ContentPerformanceProps) {
  const { data, loading: isLoading, error } = useSheetData<ContentSheetData>(sheetName);
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sort, setSort] = useState<SortState>({ field: 'Clicks', direction: 'desc' });
  const [selectedAuthor, setSelectedAuthor] = useState<string>("all");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Function to detect categories from article title
  const detectCategories = (title: string) => {
    const lowercaseTitle = title.toLowerCase()
    return Object.entries(CATEGORIES).filter(([_, keywords]) =>
      keywords.some(keyword => lowercaseTitle.includes(keyword))
    ).map(([category]) => category)
  }

  // Get unique authors from the data
  const uniqueAuthors = useMemo(() => {
    if (!data) return [];
    const authors = new Set(data.map(item => item.Author));
    return Array.from(authors).sort();
  }, [data]);

  // Update the filter function to include author filtering
  const filterAndSortArticles = (articles: ContentSheetData[]) => {
    if (!articles) return [];
    
    let filtered = articles.filter(article => {
      const matchesSearch = article.Title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesAuthor = selectedAuthor === "all" || article.Author === selectedAuthor;
      const articleCategories = detectCategories(article.Title);
      const matchesCategories = selectedCategories.length === 0 || 
        articleCategories.some(cat => selectedCategories.includes(cat));
      return matchesSearch && matchesCategories && matchesAuthor;
    });

    // Sort the filtered data
    return filtered.sort((a, b) => {
      const multiplier = sort.direction === 'asc' ? 1 : -1;
      
      if (sort.field === 'Published Date') {
        const dateA = new Date(a[sort.field]).getTime();
        const dateB = new Date(b[sort.field]).getTime();
        return (dateA - dateB) * multiplier;
      }
      
      return (a[sort.field] - b[sort.field]) * multiplier;
    });
  };

  // Update the filteredData memo to use the new sort function
  const filteredData = useMemo(() => {
    return filterAndSortArticles(data || []);
  }, [data, searchQuery, selectedCategories, sort, selectedAuthor]);

  // Calculate pagination
  const totalPages = Math.ceil((filteredData?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData?.slice(startIndex, startIndex + itemsPerPage) || [];

  // Handle items per page change
  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Add sort handler
  const handleSort = (field: SortField) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Add sort icon component
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sort.field !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sort.direction === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4" />
      : <ArrowDown className="ml-2 h-4 w-4" />;
  };

  if (!mounted) {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Content Performance</CardTitle>
          <CardDescription>
            {window.location.pathname === "/" 
              ? <>Performance metrics for individual articles <span className="font-bold">over the last 16 months</span></>
              : "Performance metrics for individual articles"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead className="text-center">Clicks</TableHead>
                <TableHead className="text-center">Impressions</TableHead>
                <TableHead className="text-center">CTR</TableHead>
                <TableHead>Published Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[60px] mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px] mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[60px] mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Content Performance</CardTitle>
          <CardDescription>
            {window.location.pathname === "/" 
              ? <>Performance metrics for individual articles <span className="font-bold">over the last 16 months</span></>
              : "Performance metrics for individual articles"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">Error loading data: {error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-3">
      <CardHeader>
        <div className="flex flex-col space-y-2">
          <CardTitle>Content Performance</CardTitle>
          <CardDescription>
            {window.location.pathname === "/" 
              ? <>Performance metrics for individual articles <span className="font-bold">over the last 16 months</span></>
              : "Performance metrics for individual articles"
            }
          </CardDescription>
          
          {/* Search and Filter Section */}
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  type="search"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <div className="w-[200px]">
                <Select
                  value={selectedAuthor}
                  onValueChange={setSelectedAuthor}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by author" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Authors</SelectItem>
                    {uniqueAuthors.map((author) => (
                      <SelectItem key={author} value={author}>
                        {author}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {Object.keys(CATEGORIES).map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategories.includes(category) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedCategories(prev =>
                      prev.includes(category)
                        ? prev.filter(c => c !== category)
                        : [...prev, category]
                    )
                  }}
                >
                  {category}
                  {selectedCategories.includes(category) && (
                    <X className="ml-1 h-3 w-3" onClick={(e) => {
                      e.stopPropagation()
                      setSelectedCategories(prev => prev.filter(c => c !== category))
                    }} />
                  )}
                </Badge>
              ))}
              {selectedCategories.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategories([])}
                  className="h-6 px-2 text-xs"
                >
                  Clear all
                </Button>
              )}
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
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead 
                    className="text-right cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('Clicks')}
                  >
                    <div className="flex items-center justify-end">
                      Clicks
                      <SortIcon field="Clicks" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-right cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('Impressions')}
                  >
                    <div className="flex items-center justify-end">
                      Impressions
                      <SortIcon field="Impressions" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-right cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('CTR')}
                  >
                    <div className="flex items-center justify-end">
                      CTR
                      <SortIcon field="CTR" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('Published Date')}
                  >
                    <div className="flex items-center">
                      Published Date
                      <SortIcon field="Published Date" />
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((row) => {
                  const articleCategories = detectCategories(row.Title);
                  return (
                    <TableRow key={row.Title}>
                      <TableCell className="max-w-[400px]">
                        <div className="flex items-start gap-2">
                          {getAchievementIcon(row.Clicks)}
                          <span className="font-medium">{row.Title}</span>
                        </div>
                      </TableCell>
                      <TableCell>{row.Author}</TableCell>
                      <TableCell className="text-right">{formatNumber(row.Clicks)}</TableCell>
                      <TableCell className="text-right">{formatNumber(row.Impressions)}</TableCell>
                      <TableCell className="text-right">{row.CTR.toFixed(2)}%</TableCell>
                      <TableCell>
                        {format(new Date(row["Published Date"]), "MMM d, yyyy")}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of{" "}
                {filteredData.length} entries
              </p>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => handleItemsPerPageChange(Number(value))}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={itemsPerPage.toString()} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((value) => (
                    <SelectItem key={value} value={value.toString()}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 