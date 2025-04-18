import { ContentPerformance } from "@/components/content-performance";
import { DiscoverPerformance } from "@/components/discover-performance";
import { Insights } from "@/components/insights";

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <DiscoverPerformance sheetName="Google Discover All Time" className="col-span-4" />
        <ContentPerformance sheetName="Google Discover All Time" className="col-span-3" />
      </div>
      <div className="grid gap-4">
        <Insights sheetName="Google Discover All Time" />
      </div>
    </div>
  );
} 