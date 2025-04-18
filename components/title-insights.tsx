"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function TitleInsights() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Title Pattern Analysis</CardTitle>
        <CardDescription>
          Coming soon! We're working on bringing you insights about the most effective title patterns and structures.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center text-muted-foreground py-8">
          Pattern analysis and recommendations will be available in a future update.
        </div>
      </CardContent>
    </Card>
  );
} 