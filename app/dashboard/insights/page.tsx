import { Insights } from "@/components/insights";

export default function InsightsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="grid gap-4">
        <Insights sheetName="Google Discover All Time" />
      </div>
    </div>
  );
} 