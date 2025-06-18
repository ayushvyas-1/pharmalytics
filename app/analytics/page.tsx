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
import { Users, Download, Clock, Presentation, TrendingUp, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Move utility functions to client-side (remove server dependency)
function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  // Calculate hours, minutes, and seconds
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  // Format with leading zeros
  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  } else {
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days !== 1 ? "s" : ""} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? "s" : ""} ago`;

  const years = Math.floor(months / 12);
  return `${years} year${years !== 1 ? "s" : ""} ago`;
}

// Client-side helper functions
function getSlidesByPresentation(presentationId: string, slides: any[]) {
  return slides
    .filter((slide) => slide.presentationId === presentationId)
    .sort((a, b) => a.order - b.order);
}

function getSessionsByPresentation(presentationId: string, sessions: any[]) {
  return sessions.filter((session) => session.presentationId === presentationId);
}

export default function AnalyticsPage() {
  const [selectedDoctor, setSelectedDoctor] = useState<string>("all");
  const [selectedPresentation, setSelectedPresentation] = useState<string>("all");
  const [data, setData] = useState<{
    doctors: any[];
    presentations: any[];
    recentSessions: any[];
    topSlides: any[];
    allSlideAnalytics: any[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch("/api/analytics", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (isMounted) {
          console.log("Analytics data loaded:", result);
          setData(result);
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
        if (isMounted) {
          setError(error instanceof Error ? error.message : "Failed to fetch analytics");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []); // Keep empty dependency array

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-8">
            <SidebarTrigger />
            <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-8">
            <SidebarTrigger />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Admin Analytics
              </h1>
              <p className="text-gray-500 mt-1">Track presentation performance and engagement</p>
            </div>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-red-500 font-medium mb-2">Error loading analytics</p>
              <p className="text-sm text-gray-500">{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4"
                variant="outline"
              >
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-8">
            <SidebarTrigger />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Admin Analytics
              </h1>
              <p className="text-gray-500 mt-1">Track presentation performance and engagement</p>
            </div>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No data available</p>
            </div>
          </div>
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

  // Calculate real summary stats from actual data
  const totalSessions = recentSessions.length;
  const activeDoctors = doctors.filter((d) => d.status === "active").length;

  // Calculate total time spent across all sessions (real data)
  const totalTimeSpent =
    allSlideAnalytics.reduce((sum, analytic) => sum + analytic.timeSpent, 0) /
    1000; // Convert to seconds

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
    const slides = getSlidesByPresentation(presentationId, data?.presentations.find(p => p.id === presentationId)?.slides || []);
    const sessions = getSessionsByPresentation(presentationId, recentSessions);

    // Create a map to store time spent per slide
    const slideTimeMap = new Map<string, { timeSpent: number; views: number }>();

    // Initialize map with all slides from the data
    const allSlides = presentations.reduce((acc, pres) => {
      if (pres.id === presentationId) {
        // Find slides for this presentation from topSlides or create from available data
        const presentationSlides = topSlides.filter(slide => slide.slide.presentationId === presentationId);
        return [...acc, ...presentationSlides.map(item => item.slide)];
      }
      return acc;
    }, []);

    allSlides.forEach((slide: { id: string; }) => {
      slideTimeMap.set(slide.id, { timeSpent: 0, views: 0 });
    });

    // Aggregate time spent from all sessions
    sessions.forEach((session) => {
      const analytics = allSlideAnalytics.filter(
        (a) => a.sessionId === session.session.id
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
    return allSlides
      .map((slide: { id: string; }) => {
        const stats = slideTimeMap.get(slide.id) || { timeSpent: 0, views: 0 };
        return {
          slide,
          totalTimeSpent: stats.timeSpent,
          avgTimeSpent: stats.views > 0 ? stats.timeSpent / stats.views : 0,
          views: stats.views,
        };
      })
      .sort((a: { totalTimeSpent: number; }, b: { totalTimeSpent: number; }) => b.totalTimeSpent - a.totalTimeSpent);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Admin Analytics
              </h1>
              <p className="text-gray-500 mt-1">Track presentation performance and engagement</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 h-9"
            >
              <Download className="h-4 w-4" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="stat-card group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Sessions</CardTitle>
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-1">{totalSessions}</div>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Presentations delivered
              </p>
              <Select
                value={selectedDoctor}
                onValueChange={setSelectedDoctor}
              >
                <SelectTrigger className="mt-3 h-9">
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

          <Card className="stat-card group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Engagement Time</CardTitle>
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {formatTime(totalTimeSpent)}
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Time spent on slides
              </p>
              <Select
                value={selectedPresentation}
                onValueChange={setSelectedPresentation}
              >
                <SelectTrigger className="mt-3 h-9">
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

          <Card className="stat-card group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Session Time</CardTitle>
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                <Presentation className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-1">{avgSessionTime}</div>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Per presentation
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="action-card">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">Recent Sessions</CardTitle>
              <CardDescription className="text-gray-500">Latest presentation sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredSessions.length > 0 ? (
                  filteredSessions.slice(0, 8).map((session, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {session.doctor.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{session.doctor.name}</p>
                          <p className="text-sm text-gray-500 truncate max-w-48">{session.presentation.title}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatTime(session.duration)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {session.session.endTime
                            ? getTimeAgo(session.session.endTime)
                            : "In progress"}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <BarChart3 className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium mb-2">No sessions recorded yet</p>
                    <p className="text-sm text-gray-400">
                      Sessions will appear here after doctors complete presentations
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="action-card">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">Slide Engagement</CardTitle>
              <CardDescription className="text-gray-500">Time spent on each slide</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {slideAnalytics.length > 0 ? (
                  slideAnalytics.slice(0, 8).map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                          <Presentation className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{item.slide.title}</p>
                          <p className="text-sm text-gray-500 truncate">
                            {
                              presentations.find(
                                (p) => p.id === item.slide.presentationId
                              )?.title
                            }
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
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
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Presentation className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium mb-2">No slide analytics yet</p>
                    <p className="text-sm text-gray-400">
                      Slide engagement data will appear after presentations are completed
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs content */}
        <Tabs defaultValue="overview" className="mt-8">
          <TabsList className="mb-6 bg-white shadow-sm border border-gray-200">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Overview</TabsTrigger>
            <TabsTrigger value="slides" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Slide Analytics</TabsTrigger>
            <TabsTrigger value="sessions" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Session History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="action-card">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900">Recent Sessions</CardTitle>
                  <CardDescription className="text-gray-500">Latest presentation sessions</CardDescription>
                </CardHeader>
                <CardContent className="px-0 sm:px-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Doctor</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Presentation</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSessions.length > 0 ? (
                          filteredSessions.slice(0, 5).map((session, index) => (
                            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4 font-medium text-gray-900">
                                {session.doctor.name}
                              </td>
                              <td className="py-3 px-4 text-gray-600 truncate max-w-48">
                                {session.presentation.title}
                              </td>
                              <td className="py-3 px-4 text-gray-600">
                                {session.session.endTime
                                  ? getTimeAgo(session.session.endTime)
                                  : "In progress"}
                              </td>
                              <td className="py-3 px-4 text-gray-600">
                                {formatTime(session.duration)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={4}
                              className="py-8 text-center text-gray-500"
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

              <Card className="action-card">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900">Top Performing Slides</CardTitle>
                  <CardDescription className="text-gray-500">
                    Slides with highest engagement time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {slideAnalytics.length > 0 ? (
                      slideAnalytics.slice(0, 5).map((item, index) => (
                        <div
                          key={index}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50/50 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <div className="mb-2 sm:mb-0 flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{item.slide.title}</p>
                            <p className="text-sm text-gray-500 truncate">
                              {
                                presentations.find(
                                  (p) => p.id === item.slide.presentationId
                                )?.title
                              }
                            </p>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-4">
                            <p className="text-sm font-medium text-gray-900">
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
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Presentation className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium mb-2">No slide analytics yet</p>
                        <p className="text-sm text-gray-400">
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
            <Card className="action-card">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">Slide Time Analytics</CardTitle>
                <CardDescription className="text-gray-500">
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
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Slide</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Presentation</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Views</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Avg Time</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Total Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {slideAnalytics.length > 0 ? (
                        slideAnalytics.map((item, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium text-gray-900 truncate max-w-48">
                              {item.slide.title}
                            </td>
                            <td className="py-3 px-4 text-gray-600 truncate max-w-48">
                              {
                                presentations.find(
                                  (p) => p.id === item.slide.presentationId
                                )?.title
                              }
                            </td>
                            <td className="py-3 px-4 text-gray-600">{item.views}</td>
                            <td className="py-3 px-4 text-gray-600">
                              {formatTime(item.avgTimeSpent / 1000)}
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {formatTime(item.totalTimeSpent / 1000)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-8 text-center text-gray-500"
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
            <Card className="action-card">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">Session History</CardTitle>
                <CardDescription className="text-gray-500">
                  Complete history of presentation sessions
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0 sm:px-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Doctor</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Specialty</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Presentation</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Duration</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Slides Viewed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSessions.length > 0 ? (
                        filteredSessions.map((session, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium text-gray-900">
                              {session.doctor.name}
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {session.doctor.specialty}
                            </td>
                            <td className="py-3 px-4 text-gray-600 truncate max-w-48">
                              {session.presentation.title}
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {session.session.endTime
                                ? getTimeAgo(session.session.endTime)
                                : "In progress"}
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {formatTime(session.duration)}
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {session.slides} of {session.presentation.slides}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={6}
                            className="py-8 text-center text-gray-500"
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
    </div>
  );
}