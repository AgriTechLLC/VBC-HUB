"use client";

import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';

export function NewsTicker() {
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  
  // Placeholder news items - will be replaced with API data
  const newsItems = [
    "New blockchain legislation introduced in VA Senate",
    "VBC hosts successful tech summit in Richmond",
    "Partnership announced with major tech company",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentNewsIndex((prev) => (prev + 1) % newsItems.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-secondary py-2 border-y border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 text-secondary-foreground">
          <ArrowRight className="h-4 w-4" />
          <p className="font-medium">{newsItems[currentNewsIndex]}</p>
        </div>
      </div>
    </div>
  );
}