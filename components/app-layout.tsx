import type React from "react"
import BottomNavigation from "./bottom-navigation"

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <main className="relative">{children}</main>
      <BottomNavigation />
    </div>
  )
}
