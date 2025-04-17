'use client';

import * as React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { format, parseISO } from 'date-fns';

import { cn } from '@/lib/utils';
import { extractBillTimelineEvents, formatForRechartsTimeline, getTimelineEventColor, generatePredictedTimeline } from '@/lib/timeline-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BillTimelineProps {
  bill: any;
  className?: string;
}

export default function BillTimeline({ bill, className }: BillTimelineProps) {
  // Generate timeline data including predictions
  const timelineEvents = React.useMemo(() => 
    generatePredictedTimeline(bill), [bill]);
  
  // Format events for Recharts
  const chartData = React.useMemo(() => 
    formatForRechartsTimeline(timelineEvents), [timelineEvents]);
  
  // Find the current date for reference line
  const today = React.useMemo(() => new Date().getTime(), []);
  
  // Chart configuration for styling
  const chartConfig = React.useMemo(() => {
    const config: Record<string, { label: string; color: string }> = {};
    
    timelineEvents.forEach(event => {
      config[event.type] = {
        label: event.type.charAt(0).toUpperCase() + event.type.slice(1),
        color: getTimelineEventColor(event)
      };
    });
    
    return config;
  }, [timelineEvents]);

  if (!bill || chartData.length === 0) {
    return <div className="text-center p-4">No timeline data available</div>;
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="text-xl">Bill Timeline</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 10, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="formattedDate"
                tick={{ fontSize: 12 }}
                tickMargin={10}
              />
              <YAxis hide />
              
              {/* Reference line for today's date */}
              <ReferenceLine
                x={format(today, 'MMM d, yyyy')}
                stroke="#6b7280"
                strokeDasharray="3 3"
                label={{ value: 'Today', position: 'top', fill: '#6b7280', fontSize: 12 }}
              />
              
              {/* Timeline events as dots */}
              <Line
                type="monotone"
                dataKey="date"
                name="Event"
                stroke="#94a3b8"
                strokeWidth={2}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  const completed = payload.completed;
                  const eventType = payload.type;
                  const color = getTimelineEventColor({ 
                    type: eventType, 
                    completed: completed 
                  } as any);
                  
                  return (
                    <svg x={cx - 8} y={cy - 8} width={16} height={16} viewBox="0 0 16 16">
                      <circle
                        cx="8"
                        cy="8"
                        r="6"
                        fill={color}
                        stroke={completed ? "white" : "#e5e7eb"}
                        strokeWidth={2}
                        opacity={completed ? 1 : 0.7}
                      />
                    </svg>
                  );
                }}
                activeDot={{ r: 8, strokeWidth: 2, stroke: 'white' }}
                isAnimationActive={true}
              />
              
              {/* Custom tooltip */}
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white dark:bg-slate-800 p-3 shadow-lg rounded-md border border-slate-200 dark:border-slate-700">
                        <p className="font-semibold text-sm">{data.eventTitle}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{data.formattedDate}</p>
                        <p className="text-sm mt-2">{data.eventDescription}</p>
                        {!data.completed && (
                          <p className="text-xs italic text-slate-500 mt-1">Predicted date</p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 justify-center text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <span>Introduction</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
            <span>Committee</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-violet-500 mr-2"></div>
            <span>Amendment</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
            <span>Vote</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-600 mr-2"></div>
            <span>Passage</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-700 mr-2"></div>
            <span>Signed</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-gray-400 mr-2"></div>
            <span>Predicted</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}