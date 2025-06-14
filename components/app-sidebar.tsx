import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Presentation, BarChart3, Users, Pill, Play, Home, User } from "lucide-react"
import Link from "next/link"

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Start Presentation",
    url: "/start",
    icon: Play,
    highlight: true,
  },
  {
    title: "Doctors",
    url: "/doctors",
    icon: Users,
  },
  {
    title: "Presentations",
    url: "/presentations",
    icon: Presentation,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <Pill className="h-6 w-6 text-blue-600" />
          <span className="font-semibold text-lg">MedRep</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Sales Rep Portal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={item.highlight ? "bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700" : ""}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Sales Rep Portal</span>
          </div>
          <div className="text-xs text-muted-foreground">Present to doctors and track engagement</div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
