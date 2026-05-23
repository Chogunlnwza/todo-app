"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, CheckSquare, Tags, FolderOpen, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home", exact: true },
  { href: "/dashboard/tasks", icon: CheckSquare, label: "Tasks" },
  { href: "/dashboard/categories", icon: FolderOpen, label: "Categories" },
  { href: "/dashboard/tags", icon: Tags, label: "Tags" },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-indigo-950/70 backdrop-blur-lg border-t border-white/5 pb-safe">
      <div className="flex items-center justify-around px-3 py-2.5">
        {navItems.slice(0, 2).map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all duration-300",
                isActive ? "text-purple-400 font-bold scale-105" : "text-slate-400 hover:text-slate-300"
              )}
            >
              <item.icon size={19} className={cn("mb-1", isActive && "text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]")} />
              <span className="text-[9px] font-medium tracking-wide">{item.label}</span>
            </Link>
          )
        })}

        {/* Center Floating Glow Button */}
        <div className="relative -top-5">
          <Link
            href="/dashboard/tasks?new=true"
            className="flex items-center justify-center w-13 h-13 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/40 border-4 border-indigo-950 hover:scale-110 active:scale-95 transition-all duration-300"
          >
            <Plus size={22} className="stroke-[2.5]" />
          </Link>
        </div>

        {navItems.slice(2, 4).map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all duration-300",
                isActive ? "text-purple-400 font-bold scale-105" : "text-slate-400 hover:text-slate-300"
              )}
            >
              <item.icon size={19} className={cn("mb-1", isActive && "text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]")} />
              <span className="text-[9px] font-medium tracking-wide">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
