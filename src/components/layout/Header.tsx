"use client"

import { signOut } from "next-auth/react"
import { Bell, LogOut, Search, ChevronDown, Settings, User } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface HeaderProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function Header({ user }: HeaderProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [showMenu, setShowMenu] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/dashboard/tasks?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U"

  return (
    <header className="h-[65px] bg-indigo-950/45 backdrop-blur-md border-b border-white/5 px-4 md:px-6 flex items-center gap-4 flex-shrink-0 z-20">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-sm">
        <div className="relative group">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
          <input
            id="header-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหางานด่วน... (Enter)"
            className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/8 rounded-xl text-[13px] text-slate-200 placeholder-slate-500 outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 focus:bg-indigo-950/40 transition-all duration-300"
          />
        </div>
      </form>

      <div className="flex items-center gap-2 ml-auto">
        {/* Notifications Bell */}
        <button
          id="btn-notifications"
          className="relative w-9.5 h-9.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all flex items-center justify-center border border-transparent hover:border-white/5"
          title="การแจ้งเตือน"
        >
          <Bell size={16} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full animate-pulse-dot" />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-white/10 mx-1.5" />

        {/* User Account Menu */}
        <div className="relative">
          <button
            id="btn-user-menu"
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2.5 py-1.5 pl-1.5 pr-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all duration-200"
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-purple-500/20">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name || "avatar"}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-[11px] font-bold">
                  {initials}
                </div>
              )}
            </div>
            {/* User Details */}
            <div className="hidden sm:block text-left">
              <p className="text-[13px] font-bold text-slate-100 leading-tight">{user.name || "ผู้ใช้งาน"}</p>
              <p className="text-[10px] text-slate-400 leading-tight truncate max-w-[120px] mt-0.5">{user.email}</p>
            </div>
            <ChevronDown size={13} className="text-slate-400 hidden sm:block group-hover:text-slate-200 transition-colors" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-2.5 w-56 bg-indigo-950/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/10 py-2.5 z-40 animate-scale-up overflow-hidden">
                {/* Header User info */}
                <div className="px-4 py-3 border-b border-white/5">
                  <p className="text-[13px] font-bold text-white">{user.name}</p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{user.email}</p>
                </div>
                <div className="py-1.5">
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setShowMenu(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Settings size={14} className="text-slate-400" />
                    ตั้งค่าบัญชี
                  </Link>
                  <div className="h-px bg-white/5 my-1" />
                  <button
                    id="btn-signout"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left"
                  >
                    <LogOut size={14} />
                    ออกจากระบบ
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
