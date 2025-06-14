import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Toaster } from "@/components/ui/toaster"
import { initializeDatabase } from "@/lib/db"

// Initialize database on server start
initializeDatabase()

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Doctor Engagement Analytics",
  description: "Track doctor engagement with pharmaceutical presentations",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SidebarProvider>
          <div className="flex min-h-screen">
            <AppSidebar />
            <main className="flex-1">{children}</main>
          </div>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  )
}
