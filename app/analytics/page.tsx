"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Users, Download, Clock, Presentation } from "lucide-react";
import {
  formatTime,
  getTimeAgo,
  getSlidesByPresentation,
  getSessionsByPresentation,
  initializeDatabase,
} from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AnalyticsPage() {
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>("all");
  const [selectedPresentation, setSelectedPresentation] = useState<
    string
  >("all");
  const [data, setData] = useState<{
    doctors: any[];
    presentations: any[];
    recentSessions: any[];
    topSlides: any[];
    allSlideAnalytics: any[];
  } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/analytics");
        const result = await response.json();
        console.log(result);
        setData(result);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setIsLoaded(true);
      }
    }
    fetchData();
  }, []);

  // Initialize database when component mounts
  useEffect(() => {
    initializeDatabase();
    setIsLoaded(true);
  }, []);

  // Don't render until database is loaded
  if (!isLoaded) {
    return (
      <div className="p-4 md:p-6 bg-gray-50">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 md:p-6 bg-gray-50">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No DATA FEtched...</p>
        </div>
      </div>
    );
  }

  // Get data from our database
  const doctors = data.doctors;
  const presentations = data.presentations;
  const recentSessions = data.recentSessions;
  const topSlides = data.topSlides;
  const allSlideAnalytics = data.allSlideAnalytics;

  // Add debugging
  console.log("Analytics Debug:");
  console.log("- Doctors:", doctors.length);
  console.log("- Presentations:", presentations.length);
  console.log("- Recent sessions:", recentSessions.length);
  console.log("- All slide analytics:", allSlideAnalytics.length);
  console.log("- Top slides:", topSlides.length);

  console.log("Recent sessions data:", recentSessions);
  console.log("All slide analytics data:", allSlideAnalytics);

  // Calculate real summary stats from actual data
  const totalSessions = recentSessions.length;
  const activeDoctors = doctors.filter((d) => d.status === "active").length;

  // Calculate total time spent across all sessions (real data)
  const totalTimeSpent =
    allSlideAnalytics.reduce((sum, analytic) => sum + analytic.timeSpent, 0) /
    1000; // Convert to seconds

  console.log("Calculated stats:", {
    totalSessions,
    activeDoctors,
    totalTimeSpent,
  });

  // Get filtered sessions based on selected doctor and presentation
  const getFilteredSessions = () => {
    let sessions = recentSessions;

    if (selectedDoctor !== "all") {
      sessions = sessions.filter((s) => s.doctor.id === selectedDoctor);
    }

    if (selectedPresentation !== "all") {
      sessions = sessions.filter(
        (s) => s.presentation.id === selectedPresentation
      );
    }

    return sessions;
  };

  // Get slide analytics for a specific presentation
  const getSlideAnalyticsForPresentation = (presentationId: string) => {
    const slides = getSlidesByPresentation(presentationId);
    const sessions = getSessionsByPresentation(presentationId);

    // Create a map to store time spent per slide
    const slideTimeMap = new Map<
      string,
      { timeSpent: number; views: number }
    >();

    // Initialize map with all slides
    slides.forEach((slide) => {
      slideTimeMap.set(slide.id, { timeSpent: 0, views: 0 });
    });

    // Aggregate time spent from all sessions
    sessions.forEach((session) => {
      const analytics = allSlideAnalytics.filter(
        (a) => a.sessionId === session.id
      );

      analytics.forEach((analytic) => {
        const current = slideTimeMap.get(analytic.slideId);
        if (current) {
          slideTimeMap.set(analytic.slideId, {
            timeSpent: current.timeSpent + analytic.timeSpent,
            views: current.views + 1,
          });
        }
      });
    });

    // Convert map to array and join with slide data
    return slides
      .map((slide) => {
        const stats = slideTimeMap.get(slide.id) || { timeSpent: 0, views: 0 };
        return {
          slide,
          totalTimeSpent: stats.timeSpent,
          avgTimeSpent: stats.views > 0 ? stats.timeSpent / stats.views : 0,
          views: stats.views,
        };
      })
      .sort((a, b) => b.totalTimeSpent - a.totalTimeSpent);
  };

  // Get slide analytics for the selected presentation or all presentations
  const slideAnalytics =
    selectedPresentation !== "all"
      ? getSlideAnalyticsForPresentation(selectedPresentation)
      : topSlides;

  const filteredSessions = getFilteredSessions();

  // Calculate average session time from real data
  const calculateAvgSessionTime = () => {
    if (filteredSessions.length === 0) return "00:00";
    const totalDuration = filteredSessions.reduce(
      (sum, s) => sum + s.duration,
      0
    );
    return formatTime(totalDuration / filteredSessions.length);
  };

  const avgSessionTime = calculateAvgSessionTime();

  return (
    <div className="p-4 md:p-6 bg-gray-50">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <h1 className="text-2xl md:text-3xl font-bold">Admin Analytics</h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4 mr-1" />
            Export Data
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              Total Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              Presentations delivered
            </p>
            <Select
              value={selectedDoctor || "all"}
              onValueChange={(value) => setSelectedDoctor(value || "all")}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Filter by doctor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Doctors</SelectItem>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              Total Engagement Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatTime(totalTimeSpent)}
            </div>
            <p className="text-xs text-muted-foreground">
              Time spent on slides
            </p>
            <Select
              value={selectedPresentation || "all"}
              onValueChange={(value) => setSelectedPresentation(value || "all")}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Filter by presentation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Presentations</SelectItem>
                {presentations.map((presentation) => (
                  <SelectItem key={presentation.id} value={presentation.id}>
                    {presentation.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Presentation className="h-4 w-4 text-blue-500" />
              Avg Session Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSessionTime}</div>
            <p className="text-xs text-muted-foreground">Per presentation</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
            <CardDescription>Latest presentation sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredSessions.length > 0 ? (
                filteredSessions.slice(0, 8).map((session, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium">{session.doctor.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {session.presentation.title}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {formatTime(session.duration)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session.session.endTime
                          ? getTimeAgo(session.session.endTime)
                          : "In progress"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    No sessions recorded yet
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Sessions will appear here after doctors complete
                    presentations
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Slide Engagement</CardTitle>
            <CardDescription>Time spent on each slide</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {slideAnalytics.length > 0 ? (
                slideAnalytics.slice(0, 8).map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium">{item.slide.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {
                          presentations.find(
                            (p) => p.id === item.slide.presentationId
                          )?.title
                        }
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {formatTime(item.avgTimeSpent / 1000)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.views} views
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    No slide analytics yet
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Slide engagement data will appear after presentations are
                    completed
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs content */}
      <Tabs defaultValue="overview" className="mt-8">
        <TabsList className="mb-4 bg-white shadow-sm">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="slides">Slide Analytics</TabsTrigger>
          <TabsTrigger value="sessions">Session History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Recent Sessions</CardTitle>
                <CardDescription>Latest presentation sessions</CardDescription>
              </CardHeader>
              <CardContent className="px-0 sm:px-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Doctor</th>
                        <th className="text-left py-2 px-4">Presentation</th>
                        <th className="text-left py-2 px-4">Date</th>
                        <th className="text-left py-2 px-4">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSessions.length > 0 ? (
                        filteredSessions.slice(0, 5).map((session, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">
                              {session.doctor.name}
                            </td>
                            <td className="py-3 px-4">
                              {session.presentation.title}
                            </td>
                            <td className="py-3 px-4">
                              {session.session.endTime
                                ? getTimeAgo(session.session.endTime)
                                : "In progress"}
                            </td>
                            <td className="py-3 px-4">
                              {formatTime(session.duration)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="py-8 text-center text-muted-foreground"
                          >
                            No sessions found. Complete a presentation to see
                            data here.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Top Performing Slides</CardTitle>
                <CardDescription>
                  Slides with highest engagement time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {slideAnalytics.length > 0 ? (
                    slideAnalytics.slice(0, 5).map((item, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="mb-2 sm:mb-0">
                          <p className="font-medium">{item.slide.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {
                              presentations.find(
                                (p) => p.id === item.slide.presentationId
                              )?.title
                            }
                          </p>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4">
                          <p className="text-sm font-medium">
                            {formatTime(item.avgTimeSpent / 1000)}
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            {item.views} views
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">
                        No slide analytics yet
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Complete presentations to see top performing slides
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="slides">
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Slide Time Analytics</CardTitle>
              <CardDescription>
                Time spent on each slide
                {selectedPresentation !== "all" &&
                  ` for ${
                    presentations.find((p) => p.id === selectedPresentation)
                      ?.title
                  }`}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 sm:px-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Slide</th>
                      <th className="text-left py-2 px-4">Presentation</th>
                      <th className="text-left py-2 px-4">Views</th>
                      <th className="text-left py-2 px-4">Avg Time</th>
                      <th className="text-left py-2 px-4">Total Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slideAnalytics.length > 0 ? (
                      slideAnalytics.map((item, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">
                            {item.slide.title}
                          </td>
                          <td className="py-3 px-4">
                            {
                              presentations.find(
                                (p) => p.id === item.slide.presentationId
                              )?.title
                            }
                          </td>
                          <td className="py-3 px-4">{item.views}</td>
                          <td className="py-3 px-4">
                            {formatTime(item.avgTimeSpent / 1000)}
                          </td>
                          <td className="py-3 px-4">
                            {formatTime(item.totalTimeSpent / 1000)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-8 text-center text-muted-foreground"
                        >
                          No slide analytics available yet. Complete
                          presentations to see detailed slide metrics.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Session History</CardTitle>
              <CardDescription>
                Complete history of presentation sessions
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 sm:px-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Doctor</th>
                      <th className="text-left py-2 px-4">Specialty</th>
                      <th className="text-left py-2 px-4">Presentation</th>
                      <th className="text-left py-2 px-4">Date</th>
                      <th className="text-left py-2 px-4">Duration</th>
                      <th className="text-left py-2 px-4">Slides Viewed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSessions.length > 0 ? (
                      filteredSessions.map((session, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">
                            {session.doctor.name}
                          </td>
                          <td className="py-3 px-4">
                            {session.doctor.specialty}
                          </td>
                          <td className="py-3 px-4">
                            {session.presentation.title}
                          </td>
                          <td className="py-3 px-4">
                            {session.session.endTime
                              ? getTimeAgo(session.session.endTime)
                              : "In progress"}
                          </td>
                          <td className="py-3 px-4">
                            {formatTime(session.duration)}
                          </td>
                          <td className="py-3 px-4">
                            {session.slides} of {session.presentation.slides}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-8 text-center text-muted-foreground"
                        >
                          No sessions found. Session history will appear after
                          doctors complete presentations.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
