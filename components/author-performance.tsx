"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { DateRange } from "react-day-picker"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface AuthorPerformanceProps {
  dateRange: DateRange
  selectedMonth: string
}

type Author = {
  id: string
  name: string
  clicks: number
  impressions: number
  ctr: number
  articles: number
  avgClicksPerArticle: number
}

export function AuthorPerformance({ dateRange, selectedMonth }: AuthorPerformanceProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "clicks", desc: true }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  // This would be fetched from your API
  const data: Author[] = [
    {
      id: "1",
      name: "Ryan Smith",
      clicks: 394368,
      impressions: 2982664,
      ctr: 9.39,
      articles: 45,
      avgClicksPerArticle: 8763,
    },
    {
      id: "2",
      name: "Juan Ruiz",
      clicks: 98475,
      impressions: 1643562,
      ctr: 5.99,
      articles: 29,
      avgClicksPerArticle: 3396,
    },
    {
      id: "3",
      name: "Ethan Haque",
      clicks: 45166,
      impressions: 769520,
      ctr: 5.87,
      articles: 10,
      avgClicksPerArticle: 4517,
    },
    {
      id: "4",
      name: "Christine Krzyszton",
      clicks: 32767,
      impressions: 524503,
      ctr: 6.25,
      articles: 7,
      avgClicksPerArticle: 4681,
    },
    {
      id: "5",
      name: "Andrew Kunesh",
      clicks: 24412,
      impressions: 595222,
      ctr: 4.1,
      articles: 4,
      avgClicksPerArticle: 6103,
    },
    {
      id: "6",
      name: "Lori Zaino",
      clicks: 23144,
      impressions: 268309,
      ctr: 8.63,
      articles: 15,
      avgClicksPerArticle: 1543,
    },
    {
      id: "7",
      name: "Jemiel West",
      clicks: 19812,
      impressions: 371565,
      ctr: 5.33,
      articles: 12,
      avgClicksPerArticle: 1651,
    },
    {
      id: "8",
      name: "Carissa Rawson",
      clicks: 18960,
      impressions: 292949,
      ctr: 6.47,
      articles: 13,
      avgClicksPerArticle: 1458,
    },
  ]

  const columns: ColumnDef<Author>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <div className="text-left">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="justify-start px-0"
            >
              Author
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )
      },
      cell: ({ row }) => <div className="font-medium text-left">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "clicks",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full justify-center"
          >
            Clicks
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="text-center font-medium">{row.getValue<number>("clicks").toLocaleString()}</div>
      ),
    },
    {
      accessorKey: "impressions",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full justify-center"
          >
            Impressions
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="text-center font-medium">{row.getValue<number>("impressions").toLocaleString()}</div>
      ),
    },
    {
      accessorKey: "ctr",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full justify-center"
          >
            Avg CTR
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="text-center font-medium">{row.getValue<number>("ctr").toFixed(2)}%</div>,
    },
    {
      accessorKey: "articles",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full justify-center"
          >
            Articles
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="text-center font-medium">{row.getValue<number>("articles")}</div>,
    },
    {
      accessorKey: "avgClicksPerArticle",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full justify-center"
          >
            Avg Clicks / Article
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="text-center font-medium">{row.getValue<number>("avgClicksPerArticle").toLocaleString()}</div>
      ),
    },
  ]

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <CardTitle>Author Performance</CardTitle>
            <CardDescription>Performance metrics by author</CardDescription>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search authors..."
              value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
              onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className={header.id === "name" ? "text-left" : "text-center"}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className={cell.column.id === "name" ? "text-left" : "text-center"}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

