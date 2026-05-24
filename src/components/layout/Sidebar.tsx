"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, CheckSquare, Tags, FolderOpen,
  Settings, ChevronLeft, ChevronRight, Zap, Plus, Star
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { href: "/dashboard/tasks", icon: CheckSquare, label: "งานทั้งหมด" },
  { href: "/dashboard/categories", icon: FolderOpen, label: "หมวดหมู่" },
  { href: "/dashboard/tags", icon: Tags, label: "แท็ก" },
  { href: "/dashboard/settings", icon: Settings, label: "ตั้งค่า" },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r border-white/8 transition-all duration-300 ease-in-out relative z-30 flex-shrink-0",
        "sidebar-gradient backdrop-blur-md",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 px-5 py-5 border-b border-white/5",
        collapsed && "justify-center px-0"
      )}>
        <div className="w-10 h-10 bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/20 shadow-lg shadow-indigo-500/20">
          <Zap size={18} className="text-white animate-float" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden animate-fade-in">
            <p className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-purple-200 text-[16px] leading-tight whitespace-nowrap">
              TaskFlow
            </p>
            <p className="text-indigo-400/60 text-[9px] whitespace-nowrap tracking-widest uppercase font-bold">
              Productivity
            </p>
          </div>
        )}
      </div>

      {/* Toggle button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        id="btn-toggle-sidebar"
        className="absolute -right-3.5 top-[22px] w-7 h-7 bg-indigo-950 border border-white/10 hover:border-purple-500 rounded-full flex items-center justify-center shadow-lg text-slate-400 hover:text-white transition-all z-40"
      >
        {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </button>

      {/* Quick Add */}
      {!collapsed && (
        <div className="px-4 pt-5 pb-2">
          <Link
            href="/dashboard/tasks?new=true"
            id="btn-quick-add"
            className="flex items-center gap-2.5 w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-[13px] font-bold rounded-xl transition-all duration-300 border border-white/10 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 hover:-translate-y-0.5 group"
          >
            <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Plus size={13} />
            </div>
            <span>สร้างงานใหม่</span>
          </Link>
        </div>
      )}

      {collapsed && (
        <div className="px-2 pt-5 pb-2 flex justify-center">
          <Link
            href="/dashboard/tasks?new=true"
            id="btn-quick-add-collapsed"
            className="w-11 h-11 bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl flex items-center justify-center transition-all border border-white/10 shadow-md shadow-indigo-500/20 hover:scale-105"
            data-tooltip="สร้างงานใหม่"
          >
            <Plus size={18} />
          </Link>
        </div>
      )}

      {/* Nav */}
      <nav className={cn("flex-1 py-4 space-y-1.5", collapsed ? "px-2.5" : "px-4")}>
        {/* Label */}
        {!collapsed && (
          <p className="text-indigo-400/40 text-[9px] uppercase tracking-widest font-extrabold px-3.5 py-1 mb-2">
            Main Menu
          </p>
        )}
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              id={`nav-${item.label}`}
              data-tooltip={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3.5 rounded-xl text-[13px] font-medium transition-all duration-300 group relative",
                collapsed ? "w-11 h-11 justify-center mx-auto" : "py-3 px-3.5",
                isActive
                  ? "bg-white/10 text-white border border-white/5 shadow-inner"
                  : "text-indigo-200/50 hover:bg-white/5 hover:text-white"
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-purple-400 to-indigo-400 rounded-r-full shadow-glow" />
              )}
              <item.icon
                size={18}
                className={cn("flex-shrink-0 transition-colors duration-300", isActive ? "text-purple-400" : "text-indigo-400/70 group-hover:text-purple-300")}
              />
              {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Bottom tip */}
      {!collapsed && (
        <div className="px-4 pb-6">
          <div className="bg-white/3 border border-white/5 rounded-2xl p-4 shadow-md backdrop-blur-sm relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-purple-500/5 rounded-full blur-xl" />
            <div className="flex items-center gap-2 mb-2">
              <Star size={12} className="text-amber-400 fill-amber-400 animate-float" />
              <p className="text-[11px] font-bold text-white/80 uppercase tracking-wide">Quick Tip</p>
            </div>
            <p className="text-[11px] text-indigo-200/50 leading-relaxed">
              กดปุ่ม <kbd className="bg-white/10 text-white px-1.5 py-0.5 rounded text-[9px] font-semibold border border-white/10">C</kbd> เพื่อสร้างงานใหม่ได้เลย!
              <br/>ไปที่หน้างานทั้งหมด
            </p>
          </div>
        </div>
      )}
    </aside>
  )
}
