"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Trophy,
  BarChart3,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Egzersizler",
    href: "/admin/exercises",
    icon: BookOpen,
  },
  {
    title: "Kullanıcılar",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Ödüller",
    href: "/admin/rewards",
    icon: Trophy,
  },
  {
    title: "Analitik",
    href: "/admin/analytics",
    icon: BarChart3,
  },
]

interface AdminSidebarProps {
  isCollapsed?: boolean
  onToggle?: () => void
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

export function AdminSidebar({
  isCollapsed = false,
  onToggle,
  isMobileOpen = false,
  onMobileClose,
}: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onMobileClose}
          data-testid="mobile-overlay"
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-64 transform border-r bg-background transition-transform duration-200 ease-in-out lg:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        data-testid="mobile-sidebar"
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b px-4">
            <Link
              href="/admin"
              className="flex items-center gap-2 font-heading text-lg font-semibold"
              onClick={onMobileClose}
            >
              <span className="text-primary">Hızlı Okuma</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={onMobileClose}
              aria-label="Menüyü kapat"
              className="cursor-pointer"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1 space-y-1 p-4" aria-label="Ana navigasyon">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onMobileClose}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  aria-current={isActive ? "page" : undefined}
                  data-testid={`nav-link-${item.href}`}
                >
                  <Icon className="h-5 w-5" />
                  {item.title}
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 hidden h-screen border-r bg-background transition-all duration-200 ease-in-out lg:block",
          isCollapsed ? "w-16" : "w-64"
        )}
        data-testid="desktop-sidebar"
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b px-4">
            {!isCollapsed && (
              <Link
                href="/admin"
                className="flex items-center gap-2 font-heading text-lg font-semibold"
              >
                <span className="text-primary">Hızlı Okuma</span>
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              aria-label={isCollapsed ? "Menüyü genişlet" : "Menüyü daralt"}
              className={cn("cursor-pointer", isCollapsed && "mx-auto")}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          <nav className="flex-1 space-y-1 p-2" aria-label="Ana navigasyon">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    isCollapsed && "justify-center px-2"
                  )}
                  aria-current={isActive ? "page" : undefined}
                  data-testid={`nav-link-${item.href}`}
                  title={isCollapsed ? item.title : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && item.title}
                </Link>
              )
            })}
          </nav>

          <div className="border-t p-4">
            {!isCollapsed && (
              <p className="text-xs text-muted-foreground">
                © 2024 Hızlı Okuma
              </p>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
