import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Newspaper, Calendar, Gavel, BookOpen, AlertCircle } from 'lucide-react';
import { NewsTicker } from '@/components/news-ticker';
import { EventsGrid } from '@/components/events-grid';
import { LegislationTracker } from '@/components/legislation-tracker';
import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations();
  
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6">
              {t('app.title')}
            </h1>
            <p className="text-xl mb-8">
              Advancing blockchain technology and policy in the Commonwealth
            </p>
            <div className="space-x-4">
              <Button size="lg" variant="secondary">
                Join VBC
              </Button>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* News Ticker */}
      <NewsTicker />

      {/* Main Content Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Legislation Updates */}
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gavel className="h-6 w-6" />
                {t('legislation.title')}
              </CardTitle>
              <CardDescription>
                Track blockchain-related bills in the Virginia General Assembly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <LegislationTracker />
                <div className="text-center mt-4">
                  <Button variant="outline" asChild>
                    <a href="/bills">View All Legislation</a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Events Section */}
          <Card className="col-span-full md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-6 w-6" />
                {t('events.title')}
              </CardTitle>
              <CardDescription>
                Blockchain meetups and council events across Virginia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EventsGrid />
            </CardContent>
          </Card>

          {/* News & Resources */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Newspaper className="h-6 w-6" />
                Latest News
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* News items will be dynamically populated */}
                <p className="text-muted-foreground">Loading latest news...</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-6 w-6" />
                Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  White Papers
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  Job Board
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  Member Portal
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Alerts/CTA */}
          <Card className="bg-muted">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-6 w-6" />
                Get Involved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Make your voice heard in Virginia's blockchain future.
              </p>
              <Button className="w-full">Join VBC Today</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}