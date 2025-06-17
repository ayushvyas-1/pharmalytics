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
import { Presentation, BarChart3, Users, Pill, Play, Home, User, Sparkles } from "lucide-react"
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
    <Sidebar className="border-r border-gray-200/60">
      <SidebarHeader className="p-6 border-b border-gray-200/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Pill className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg text-gray-900">MedRep</span>
            <div className="flex items-center gap-1 mt-0.5">
              <Sparkles className="h-3 w-3 text-blue-500" />
              <span className="text-xs text-gray-500 font-medium">Pro</span>
            </div>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Sales Rep Portal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={`
                      h-10 px-3 rounded-lg transition-all duration-200 hover:bg-gray-100
                      ${item.highlight 
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-sm" 
                        : "text-gray-700 hover:text-gray-900"
                      }
                    `}
                  >
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className={`h-4 w-4 ${item.highlight ? "text-white" : "text-gray-500"}`} />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-gray-200/60">
        <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-lg">
          <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">Sales Rep Portal</div>
            <div className="text-xs text-gray-500">Present & track engagement</div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}