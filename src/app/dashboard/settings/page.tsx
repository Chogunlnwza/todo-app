"use client"

import { useSession, signOut } from "next-auth/react"
import { User, Mail, Shield, LogOut } from "lucide-react"
import Image from "next/image"

export default function SettingsPage() {
  const { data: session } = useSession()
  const user = session?.user

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U"

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
          <Shield size={24} className="text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]" />
          <span>ตั้งค่าระบบ</span>
        </h1>
        <p className="text-slate-400 text-sm mt-0.5 font-medium">จัดการข้อมูลบัญชีผู้ใช้และตรวจสอบรายละเอียดแอปพลิเคชัน</p>
      </div>

      {/* Profile Card */}
      <div className="glass-panel p-6 border-purple-500/10">
        <h2 className="text-[14px] font-bold text-slate-100 mb-5 flex items-center gap-2">
          <User size={15} className="text-purple-400" />
          <span>ข้อมูลผู้ใช้งานโปรไฟล์</span>
        </h2>
        <div className="flex items-center gap-4.5">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 shadow-lg ring-4 ring-purple-500/10">
            {user?.image ? (
              <Image src={user.image} alt={user.name || "avatar"} width={64} height={64} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-lg font-black">
                {initials}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-extrabold text-white text-[17px] truncate">{user?.name || "ผู้ใช้ระบบ"}</p>
            <p className="text-slate-400 text-[12.5px] flex items-center gap-1.5 mt-1 truncate">
              <Mail size={13} className="text-slate-500 flex-shrink-0" />
              <span>{user?.email}</span>
            </p>
          </div>
        </div>
      </div>

      {/* App Info Card */}
      <div className="glass-panel p-6 border-purple-500/10">
        <h2 className="text-[14px] font-bold text-slate-100 mb-5 flex items-center gap-2">
          <Shield size={15} className="text-purple-400" />
          <span>เกี่ยวกับแอปพลิเคชัน</span>
        </h2>
        <div className="space-y-1">
          {[
            { label: "ชื่อระบบหลัก", value: "TaskFlow Pro" },
            { label: "เวอร์ชันปัจจุบัน", value: "1.0.0 (Production)" },
            { label: "เทคโนโลยีของระบบ", value: "Next.js 16 + TypeScript + React 19" },
            { label: "สไตล์การตกแต่ง", value: "Vanilla CSS & Tailwind 4 (Glassmorphism)" },
            { label: "ระบบฐานข้อมูล", value: "PostgreSQL + Prisma ORM" },
          ].map((item) => (
            <div key={item.label} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
              <span className="text-[12.5px] font-medium text-slate-400">{item.label}</span>
              <span className="text-[13px] font-bold text-slate-200">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone / Log out */}
      <div className="glass-panel p-6 border-red-500/10">
        <h2 className="text-[14px] font-bold text-red-400 mb-2 flex items-center gap-2">
          <LogOut size={15} />
          <span>Danger Zone / จัดการระบบบัญชี</span>
        </h2>
        <p className="text-slate-400 text-[12.5px] mb-4.5 font-medium">หากต้องการออกจากระบบปัจจุบัน คุณสามารถกดปุ่มยืนยันออกจากระบบด้านล่างนี้ได้เลย</p>
        <button
          id="btn-settings-signout"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="btn btn-danger py-2.5 px-5 font-bold text-[13px] h-11 flex items-center gap-2"
        >
          <LogOut size={14} />
          <span>ออกจากระบบปัจจุบัน</span>
        </button>
      </div>
    </div>
  )
}
