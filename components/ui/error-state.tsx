import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * Reusable error state component for handling API errors
 */
export function ErrorState({
  title = "Something went wrong",
  message = "There was a problem loading the data. Please try again.",
  onRetry,
  className = ""
}: ErrorStateProps) {
  return (
    <Card className={`border-red-200 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-red-700 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{message}</p>
      </CardContent>
      {onRetry && (
        <CardFooter>
          <Button 
            variant="outline" 
            onClick={onRetry} 
            size="sm"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

/**
 * Small inline error display for use in forms or smaller components
 */
export function InlineError({
  message,
  onRetry,
  className = ""
}: {
  message: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={`text-red-600 text-sm flex items-center gap-2 ${className}`}>
      <AlertTriangle className="h-4 w-4" />
      <span>{message}</span>
      {onRetry && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-red-600 hover:text-red-700"
          onClick={onRetry}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Retry
        </Button>
      )}
    </div>
  );
}