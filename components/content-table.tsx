"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { DateRange } from "react-day-picker"
import { Input } from "@/components/ui/input"
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
import { format } from "date-fns"

interface ContentTableProps {
  dateRange: DateRange
  selectedMonth: string
}

type Article = {
  id: string
  title: string
  url: string
  author: string
  publishedDate: Date
  impressions: number
  clicks: number
  ctr: number
  position: number
}

export function ContentTable({ dateRange, selectedMonth }: ContentTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  // This would be fetched from your API
  const data: Article[] = [
    {
      id: "1",
      title: "American Express Is Removing 3 Benefits Soon",
      url: "/news/american-express-removing-3-benefits/",
      author: "Ryan Smith",
      publishedDate: new Date("2025-03-14"),
      impressions: 1325788,
      clicks: 157821,
      ctr: 11.9,
      position: 2.1,
    },
    {
      id: "2",
      title: "Chase Adds Limited-Time Wellness Perks",
      url: "/news/chase-sapphire-limited-time-wellness-perks/",
      author: "Juan Ruiz",
      publishedDate: new Date("2025-03-05"),
      impressions: 1211525,
      clicks: 76387,
      ctr: 6.31,
      position: 2.3,
    },
    {
      id: "3",
      title: "Big Changes to Chase's United Airlines Personal Credit Card",
      url: "/news/united-airlines-personal-credit-card-changes/",
      author: "Ryan Smith",
      publishedDate: new Date("2025-02-19"),
      impressions: 353313,
      clicks: 25705,
      ctr: 7.28,
      position: 2.5,
    },
    {
      id: "4",
      title: "How I'm Spending 1 Million Amex Points",
      url: "/news/how-im-spending-1-million-amex-points/",
      author: "Ethan Haque",
      publishedDate: new Date("2025-02-28"),
      impressions: 352158,
      clicks: 31667,
      ctr: 9.0,
      position: 2.8,
    },
    {
      id: "5",
      title: "Hidden Gems in Amex Centurion Lounge Chicago",
      url: "/news/amex-centurion-lounge-chicago-hidden-gems/",
      author: "Andrew Kunesh",
      publishedDate: new Date("2025-03-01"),
      impressions: 325775,
      clicks: 15052,
      ctr: 4.62,
      position: 3.1,
    },
  ]

  const columns: ColumnDef<Article>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <div className="text-left">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="justify-start px-0"
            >
              Title
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )
      },
      cell: ({ row }) => (
        <div className="max-w-[400px] text-left font-medium">
          <a href={row.original.url} className="hover:underline text-primary">
            {row.getValue("title")}
          </a>
        </div>
      ),
    },
    {
      accessorKey: "author",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full justify-center"
          >
            Author
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue("author")}</div>,
    },
    {
      accessorKey: "publishedDate",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full justify-center"
          >
            Published Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = row.getValue<Date>("publishedDate")
        return <div>{format(date, "MMM dd, yyyy")}</div>
      },
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
      accessorKey: "ctr",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full justify-center"
          >
            CTR
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="text-center font-medium">{row.getValue<number>("ctr").toFixed(2)}%</div>,
    },
    {
      accessorKey: "position",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full justify-center"
          >
            Position
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="text-center font-medium">{row.getValue<number>("position").toFixed(1)}</div>,
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
            <CardTitle>Content Performance</CardTitle>
            <CardDescription>Performance metrics for individual articles</CardDescription>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
              onChange={(event) => table.getColumn("title")?.setFilterValue(event.target.value)}
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
                      <TableHead key={header.id} className={header.column.id === "title" ? "text-left" : "text-center"}>
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
                      <TableCell key={cell.id} className={cell.column.id === "title" ? "text-left" : "text-center"}>
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

