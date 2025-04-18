"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { format } from "date-fns";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { simplifyChambername } from "@/lib/legiscan-utils";

// Define the interface for vote data
interface VoteData {
  hasVotes: boolean;
  totalVotes: number;
  yesVotes: number;
  noVotes: number;
  otherVotes: number;
  passed: boolean;
  date: string;
  chamber: string;
  desc: string;
  partyBreakdown: {
    democratic: { yes: number; no: number; other: number };
    republican: { yes: number; no: number; other: number };
    independent: { yes: number; no: number; other: number };
  };
  chartData: {
    name: string;
    yes: number;
    no: number;
    other: number;
  }[];
}

// Define the props for the component
interface VoteDonutProps {
  billId: string;
  className?: string;
}

// Colors for the chart
const COLORS = {
  yes: "#4ade80", // green
  no: "#f87171",  // red
  other: "#a1a1aa" // gray
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function VoteDonut({ billId, className }: VoteDonutProps) {
  const { data, error, isLoading } = useSWR<VoteData>(
    `/api/bills/${billId}/votes`,
    fetcher
  );

  const [simplePieData, setSimplePieData] = useState<Array<{ name: string; value: number }>>([]);

  useEffect(() => {
    if (data?.hasVotes) {
      setSimplePieData([
        { name: "Yes", value: data.yesVotes },
        { name: "No", value: data.noVotes },
        { name: "Other", value: data.otherVotes }
      ]);
    }
  }, [data]);

  // Format the vote summary (e.g., "Passed 65-35")
  const getVoteSummary = () => {
    if (!data?.hasVotes) return "";
    
    const result = data.passed ? "Passed" : "Failed";
    return `${result} ${data.yesVotes}-${data.noVotes}`;
  };

  // Format the date
  const getFormattedDate = () => {
    if (!data?.date) return "";
    try {
      return format(new Date(data.date), "MMM d, yyyy");
    } catch (e) {
      return data.date;
    }
  };

  if (isLoading) {
    return (
      <Card className={cn("w-full h-64 flex items-center justify-center", className)}>
        <CardContent>Loading vote data...</CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle>Vote Data</CardTitle>
          <CardDescription>Error loading vote data</CardDescription>
        </CardHeader>
        <CardContent>Failed to load vote data. Please try again later.</CardContent>
      </Card>
    );
  }

  if (!data || !data.hasVotes) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle>Vote Data</CardTitle>
          <CardDescription>No votes recorded</CardDescription>
        </CardHeader>
        <CardContent>No vote data is available for this legislation.</CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>Vote Results</CardTitle>
        <CardDescription>
          {simplifyChambername(data.chamber)} • {getFormattedDate()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="w-full md:w-1/2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={simplePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {simplePieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.name === "Yes" ? COLORS.yes : entry.name === "No" ? COLORS.no : COLORS.other} 
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="w-full md:w-1/2">
            <div className="text-center md:text-left mb-4">
              <h3 className="text-xl font-bold">{getVoteSummary()}</h3>
              <p className="text-sm text-muted-foreground">{data.desc}</p>
            </div>
            
            {data.partyBreakdown && (
              <div className="space-y-2">
                <h4 className="font-medium">Party Breakdown</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Democratic</span>
                    <span>
                      {data.partyBreakdown.democratic.yes}-{data.partyBreakdown.democratic.no}
                      {data.partyBreakdown.democratic.other > 0 && ` (${data.partyBreakdown.democratic.other} other)`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Republican</span>
                    <span>
                      {data.partyBreakdown.republican.yes}-{data.partyBreakdown.republican.no}
                      {data.partyBreakdown.republican.other > 0 && ` (${data.partyBreakdown.republican.other} other)`}
                    </span>
                  </div>
                  {data.partyBreakdown.independent.yes + data.partyBreakdown.independent.no + data.partyBreakdown.independent.other > 0 && (
                    <div className="flex justify-between">
                      <span>Independent</span>
                      <span>
                        {data.partyBreakdown.independent.yes}-{data.partyBreakdown.independent.no}
                        {data.partyBreakdown.independent.other > 0 && ` (${data.partyBreakdown.independent.other} other)`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        Total votes: {data.totalVotes}
      </CardFooter>
    </Card>
  );
}