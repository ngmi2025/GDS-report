"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronLeft, ChevronRight, Medal, ChevronUp, ChevronDown, Search, Rocket, Zap, Pencil, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSheetData } from "@/lib/hooks/useSheetData"
import { Skeleton } from "@/components/ui/skeleton"
import { formatNumber } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Slider } from "@/components/ui/slider"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface AuthorPerformanceProps {
  sheetName: string;
}

interface AuthorStats {
  author: string;
  totalArticles: number;
  totalClicks: number;
  totalImpressions: number;
  averageCTR: number;
  avgClicksPerArticle: number;
}

interface AllTimeAuthorData {
  Author: string;
  "Total Clicks": number;
  "Total Impressions": number;
  "Average CTR (%)": number;
  "Number of Articles": number;
  "Avg Clicks / Article": number;
}

interface ContentAuthorData {
  Author: string;
  Clicks: number;
  Impressions: number;
  CTR: number;
}

type SortField = 'totalClicks' | 'totalImpressions' | 'averageCTR' | 'totalArticles' | 'avgClicksPerArticle';

interface SortConfig {
  field: SortField;
  direction: 'asc' | 'desc';
}

interface ThresholdFilters {
  minClicks: number;
  minCTR: number;
  minArticles: number;
}

interface FilterOption {
  id: string;
  label: string;
  icon: React.ReactElement;
  predicate: (author: AuthorStats) => boolean;
  tooltip: string;
}

export function AuthorPerformance({ sheetName }: AuthorPerformanceProps) {
  const { data, loading, error } = useSheetData<any>(sheetName)
  const [mounted, setMounted] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'totalClicks', direction: 'desc' })
  const [thresholds, setThresholds] = useState<ThresholdFilters>({
    minClicks: 0,
    minCTR: 0,
    minArticles: 0
  })
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  // Check if we're using the all-time author leaderboard format
  const isAllTimeFormat = useMemo(() => sheetName.toLowerCase().includes('all time'), [sheetName]);

  const filterOptions = useMemo(() => [
    {
      id: 'highImpact',
      label: 'High Impact',
      icon: <Rocket className="h-3.5 w-3.5" />,
      predicate: (author: AuthorStats) => author.avgClicksPerArticle >= 2000,
      tooltip: 'Authors averaging 2,000+ clicks per article'
    },
    {
      id: 'viral',
      label: 'Viral Content',
      icon: <Zap className="h-3.5 w-3.5" />,
      predicate: (author: AuthorStats) => author.averageCTR >= 8,
      tooltip: 'Authors with 8%+ CTR'
    },
    {
      id: 'prolific',
      label: 'Regular Contributors',
      icon: <Pencil className="h-3.5 w-3.5" />,
      predicate: (author: AuthorStats) => isAllTimeFormat 
        ? author.totalArticles >= 75
        : author.totalArticles >= 10,
      tooltip: isAllTimeFormat 
        ? 'Authors with 75+ articles overall'
        : 'Authors with 10+ articles this month'
    }
  ], [isAllTimeFormat]);

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Author Performance</CardTitle>
          <CardDescription>
            {window.location.pathname === "/" 
              ? <>Performance metrics by author <span className="font-bold">over the last 16 months</span></>
              : "Performance metrics by author"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Author</TableHead>
                <TableHead className="text-center">Articles</TableHead>
                <TableHead className="text-center">Total Clicks</TableHead>
                <TableHead className="text-center">Total Impressions</TableHead>
                <TableHead className="text-center">Average CTR</TableHead>
                <TableHead className="text-center">Avg Clicks / Article</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[60px] mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px] mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px] mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[60px] mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[60px] mx-auto" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Author Performance</CardTitle>
          <CardDescription>
            {window.location.pathname === "/" 
              ? <>Performance metrics by author <span className="font-bold">over the last 16 months</span></>
              : "Performance metrics by author"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">Error loading data: {error}</div>
        </CardContent>
      </Card>
    )
  }

  // Convert data to AuthorStats format - all author leaderboard sheets use the same format
  const authorStats: AuthorStats[] = (data as AllTimeAuthorData[]).map(row => {
    // Ensure all values are strings before parsing
    const numArticles = String(row["Number of Articles"] || '0');
    const totalClicks = String(row["Total Clicks"] || '0');
    const totalImpressions = String(row["Total Impressions"] || '0');
    const averageCTR = String(row["Average CTR (%)"] || '0');
    const avgClicksPerArticle = String(row["Avg Clicks / Article"] || '0');

    return {
      author: row["Author"],
      totalArticles: parseInt(numArticles, 10),
      totalClicks: parseInt(totalClicks, 10),
      totalImpressions: parseInt(totalImpressions, 10),
      averageCTR: parseFloat(averageCTR),  // CTR is already in percentage form
      avgClicksPerArticle: Math.round(parseFloat(avgClicksPerArticle))
    };
  });

  // Filter authors based on search query and active filters
  const filteredAuthors = authorStats.filter(author => {
    const matchesSearch = author.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilters = activeFilters.length === 0 || 
      activeFilters.every(filterId => 
        filterOptions.find(option => option.id === filterId)?.predicate(author)
      );
    
    return matchesSearch && matchesFilters;
  });

  // Sort authors based on current sort config
  const sortedAuthors = [...filteredAuthors].sort((a, b) => {
    const multiplier = sortConfig.direction === 'desc' ? -1 : 1;
    return (a[sortConfig.field] - b[sortConfig.field]) * multiplier;
  });

  // Calculate pagination
  const totalItems = sortedAuthors.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentAuthors = sortedAuthors.slice(startIndex, endIndex)

  // Handle sort change
  const handleSort = (field: SortField) => {
    setSortConfig(current => ({
      field,
      direction: current.field === field && current.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  // Handle items per page change
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value))
    setCurrentPage(1) // Reset to first page when changing items per page
  }

  // Toggle filter
  const toggleFilter = (filterId: string) => {
    setActiveFilters(current => 
      current.includes(filterId)
        ? current.filter(id => id !== filterId)
        : [...current, filterId]
    );
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const getMedalIcon = (index: number) => {
    if (index === 0) {
      return (
        <div className="flex items-center gap-1">
          <Medal className="h-5 w-5 text-yellow-400" aria-label="1st place" />
          <span className="text-xs font-semibold text-yellow-400">1st</span>
        </div>
      )
    }
    if (index === 1) {
      return (
        <div className="flex items-center gap-1">
          <Medal className="h-5 w-5 text-gray-400" aria-label="2nd place" />
          <span className="text-xs font-semibold text-gray-400">2nd</span>
        </div>
      )
    }
    if (index === 2) {
      return (
        <div className="flex items-center gap-1">
          <Medal className="h-5 w-5 text-amber-600" aria-label="3rd place" />
          <span className="text-xs font-semibold text-amber-600">3rd</span>
        </div>
      )
    }
    return null
  }

  // Performance badge checks
  const getPerformanceBadges = (stats: AuthorStats) => {
    const badges = [];
    
    if (stats.avgClicksPerArticle >= 2000) {
      badges.push({
        icon: <Rocket className="h-3.5 w-3.5 text-blue-500" />,
        label: 'High Impact',
        tooltip: 'Average 2,000+ clicks per article'
      });
    }
    
    if (stats.averageCTR >= 8) {
      badges.push({
        icon: <Zap className="h-3.5 w-3.5 text-yellow-500" />,
        label: 'Viral',
        tooltip: 'CTR 8%+'
      });
    }
    
    if ((isAllTimeFormat && stats.totalArticles >= 75) || (!isAllTimeFormat && stats.totalArticles >= 10)) {
      badges.push({
        icon: <Pencil className="h-3.5 w-3.5 text-purple-500" />,
        label: 'Prolific',
        tooltip: isAllTimeFormat 
          ? '75+ articles published overall'
          : '10+ articles published this month'
      });
    }
    
    return badges;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col space-y-2">
          <CardTitle>Author Performance</CardTitle>
          <CardDescription>
            {window.location.pathname === "/" 
              ? <>Performance metrics by author <span className="font-bold">over the last 16 months</span></>
              : "Performance metrics by author"
            }
          </CardDescription>
          <div className="space-y-4">
            <div className="relative w-full">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((filter) => (
                <TooltipProvider key={filter.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant={activeFilters.includes(filter.id) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/90 flex items-center gap-1.5"
                        onClick={() => toggleFilter(filter.id)}
                      >
                        {filter.icon}
                        {filter.label}
                        {activeFilters.includes(filter.id) && (
                          <X 
                            className="h-3 w-3 ml-1" 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFilter(filter.id);
                            }}
                          />
                        )}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{filter.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
              
              {activeFilters.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setActiveFilters([]);
                    setCurrentPage(1);
                  }}
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Author</TableHead>
              <TableHead className="text-center cursor-pointer" onClick={() => handleSort('totalArticles')}>
                Articles {sortConfig.field === 'totalArticles' && (
                  sortConfig.direction === 'desc' ? <ChevronDown className="inline h-4 w-4" /> : <ChevronUp className="inline h-4 w-4" />
                )}
              </TableHead>
              <TableHead className="text-center cursor-pointer" onClick={() => handleSort('totalClicks')}>
                Total Clicks {sortConfig.field === 'totalClicks' && (
                  sortConfig.direction === 'desc' ? <ChevronDown className="inline h-4 w-4" /> : <ChevronUp className="inline h-4 w-4" />
                )}
              </TableHead>
              <TableHead className="text-center cursor-pointer" onClick={() => handleSort('totalImpressions')}>
                Total Impressions {sortConfig.field === 'totalImpressions' && (
                  sortConfig.direction === 'desc' ? <ChevronDown className="inline h-4 w-4" /> : <ChevronUp className="inline h-4 w-4" />
                )}
              </TableHead>
              <TableHead className="text-center cursor-pointer" onClick={() => handleSort('averageCTR')}>
                Average CTR {sortConfig.field === 'averageCTR' && (
                  sortConfig.direction === 'desc' ? <ChevronDown className="inline h-4 w-4" /> : <ChevronUp className="inline h-4 w-4" />
                )}
              </TableHead>
              <TableHead className="text-center cursor-pointer" onClick={() => handleSort('avgClicksPerArticle')}>
                Avg Clicks / Article {sortConfig.field === 'avgClicksPerArticle' && (
                  sortConfig.direction === 'desc' ? <ChevronDown className="inline h-4 w-4" /> : <ChevronUp className="inline h-4 w-4" />
                )}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentAuthors.map((stats: AuthorStats, index: number) => (
              <TableRow key={stats.author + index}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {getMedalIcon(index)}
                    <span>{stats.author}</span>
                    <div className="flex gap-1 ml-2">
                      {getPerformanceBadges(stats).map((badge, i) => (
                        <TooltipProvider key={i}>
                          <Tooltip>
                            <TooltipTrigger>
                              {badge.icon}
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{badge.label}: {badge.tooltip}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">{formatNumber(stats.totalArticles)}</TableCell>
                <TableCell className="text-center">{formatNumber(stats.totalClicks)}</TableCell>
                <TableCell className="text-center">{formatNumber(stats.totalImpressions)}</TableCell>
                <TableCell className="text-center" suppressHydrationWarning>
                  {stats.averageCTR.toFixed(1)}%
                </TableCell>
                <TableCell className="text-center">{formatNumber(stats.avgClicksPerArticle)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Show:</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={handleItemsPerPageChange}
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground ml-4">
              Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} authors
            </span>
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

