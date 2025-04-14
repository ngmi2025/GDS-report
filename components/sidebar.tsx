// components/sidebar.tsx
"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Menu, BarChart3, CalendarDays, ChevronDown, ChevronRight, LucideIcon } from "lucide-react"

// Custom CalendarYear icon component
function CalendarYear({ year, className }: { year: string, className?: string }) {
  return (
    <div className={cn("relative w-5 h-5 flex items-center justify-center", className)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <text
          x="12"
          y="16"
          textAnchor="middle"
          fill="currentColor"
          className="text-[8px] font-bold"
          style={{ stroke: "none" }}
        >
          {year}
        </text>
      </svg>
    </div>
  )
}

type NavItem = {
  label: string
  icon: LucideIcon
  href: string
}

type YearSection = {
  label: string
  items: NavItem[]
}

type NavItems = {
  overview: NavItem
  [key: number]: YearSection
}

type YearExpandedState = {
  [key: number]: boolean
}

const navItems: NavItems = {
  overview: { label: "Overview", icon: BarChart3, href: "/" },
  2025: {
    label: "2025",
    items: [
      { label: "Apr 25", icon: CalendarDays, href: "/apr-2025" },
      { label: "Mar 25", icon: CalendarDays, href: "/mar-2025" },
      { label: "Feb 25", icon: CalendarDays, href: "/feb-2025" },
      { label: "Jan 25", icon: CalendarDays, href: "/jan-2025" },
    ]
  },
  2024: {
    label: "2024",
    items: [
      { label: "Dec 24", icon: CalendarDays, href: "/dec-2024" },
      { label: "Nov 24", icon: CalendarDays, href: "/nov-2024" },
      { label: "Oct 24", icon: CalendarDays, href: "/oct-2024" },
      { label: "Sep 24", icon: CalendarDays, href: "/sep-2024" },
      { label: "Aug 24", icon: CalendarDays, href: "/aug-2024" }
    ]
  }
}

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(true)
  const [yearExpanded, setYearExpanded] = useState<YearExpandedState>({
    2025: true,
    2024: false
  })

  const toggleYear = (year: number) => {
    if (collapsed) {
      setCollapsed(false)
      setYearExpanded({
        2024: year === 2024,
        2025: year === 2025
      })
    } else {
      setYearExpanded(prev => ({
        2024: year === 2024 ? !prev[2024] : false,
        2025: year === 2025 ? !prev[2025] : false
      }))
    }
  }

  // Get current active year and month from pathname
  const activeYear = pathname.match(/\d{4}$/)?.[0]
    ? pathname.match(/\d{4}$/)?.[0]
    : null

  return (
    <aside
      className={cn(
        "sticky top-0 h-screen bg-[#1F2937] text-white flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Top toggle button */}
      <div className="flex items-center h-16 border-b border-gray-700 px-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-white focus:outline-none hover:bg-gray-600 rounded-md p-2 transition"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-6 w-6 text-white" />
        </button>
      </div>

      {/* Navigation links */}
      <div className="flex-1 px-2 pt-4 space-y-2">
        {/* Overview link */}
        <Link
          href={navItems.overview.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            pathname === navItems.overview.href
              ? "bg-gray-700 text-white"
              : "text-gray-400 hover:bg-gray-700 hover:text-white"
          )}
        >
          <navItems.overview.icon className="h-5 w-5" />
          {!collapsed && <span>{navItems.overview.label}</span>}
        </Link>

        {/* Year sections */}
        {Object.entries(navItems)
          .filter(([key]) => key !== 'overview')
          .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
          .map(([year, section]) => {
            const yearSection = section as YearSection
            const isActiveYear = activeYear === year
            const shortYear = year.slice(2) // Get last 2 digits (e.g., "25" from "2025")
            
            return (
              <div key={year} className="space-y-1">
                {/* Year header - always visible */}
                <button
                  onClick={() => toggleYear(Number(year))}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActiveYear
                      ? "bg-gray-700 text-white"
                      : "text-gray-400 hover:bg-gray-700 hover:text-white"
                  )}
                >
                  <CalendarYear year={shortYear} />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{yearSection.label}</span>
                      <div className="flex-shrink-0">
                        {yearExpanded[Number(year)] ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    </>
                  )}
                </button>
                
                {/* Expanded month list - only when sidebar is open and year is expanded */}
                {(!collapsed && yearExpanded[Number(year)]) && (
                  <div className="ml-2 space-y-1">
                    {yearSection.items.map((item: NavItem) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          pathname === item.href
                            ? "bg-gray-700 text-white"
                            : "text-gray-400 hover:bg-gray-700 hover:text-white"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
      </div>
    </aside>
  )
}
