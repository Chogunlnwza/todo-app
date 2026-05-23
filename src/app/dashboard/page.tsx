"use client"

import { useQuery } from "@tanstack/react-query"
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts"
import {
  CheckCircle2, Clock, AlertTriangle, Calendar,
  ArrowRight, Plus, Zap, Target, BarChart2
} from "lucide-react"
import Link from "next/link"
import { cn, formatDate, STATUS_LABELS } from "@/lib/utils"

const STATUS_COLORS: Record<string, string> = {
  TODO: "#a855f7",       // Purple
  IN_PROGRESS: "#3b82f6", // Blue
  IN_REVIEW: "#f59e0b",   // Amber
  DONE: "#10b981",        // Emerald
  CANCELLED: "#ef4444",   // Red
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/stats")
      if (!res.ok) throw new Error("Failed to fetch dashboard stats")
      return res.json()
    },
  })

  if (isLoading) return <DashboardSkeleton />

  const { stats, tasksByStatus, tasksByCategory, upcomingTasks } = data

  const statusChartData = tasksByStatus.map((t: { status: string; count: number }) => ({
    name: STATUS_LABELS[t.status] || t.status,
    value: t.count,
    color: STATUS_COLORS[t.status] || "#64748b",
  }))

  const categoryChartData = tasksByCategory
    .filter((c: { count: number }) => c.count > 0)
    .map((c: { name: string; count: number; color: string }) => ({
      name: c.name.length > 10 ? c.name.slice(0, 10) + "…" : c.name,
      count: c.count,
      fill: c.color,
    }))

  const totalTasks = statusChartData.reduce((s: number, d: { value: number }) => s + d.value, 0)

  return (
    <div className="max-w-7xl mx-auto space-y-7 animate-fade-up">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-extrabold text-white flex items-center gap-2.5">
            <BarChart2 size={24} className="text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]" /> 
            <span>แผงควบคุม</span>
          </h1>
          <p className="text-slate-400 text-[13px] mt-0.5 font-medium">สรุปภาพรวมและข้อมูลสถิติของงานทั้งหมดของคุณ</p>
        </div>
        <Link
          href="/dashboard/tasks?new=true"
          id="btn-dashboard-new-task"
          className="btn btn-primary btn-md self-start sm:self-auto"
        >
          <Plus size={16} /> 
          <span>เพิ่มงานใหม่</span>
        </Link>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        {[
          { label: "งานทั้งหมดในระบบ", value: stats.totalTasks, sub: "ทุกสถานะงาน", cls: "stat-indigo", icon: <Target size={20} className="text-purple-300" /> },
          { label: "เสร็จสิ้นแล้ววันนี้", value: stats.completedToday, sub: `สัปดาห์นี้เสร็จแล้ว ${stats.completedThisWeek} งาน`, cls: "stat-emerald", icon: <CheckCircle2 size={20} className="text-emerald-300" /> },
          { label: "กำลังดำเนินการ", value: stats.inProgressTasks, sub: "งานที่กำลังโฟกัสอยู่", cls: "stat-blue", icon: <Clock size={20} className="text-blue-300" /> },
          { label: "งานที่เกินกำหนดส่ง", value: stats.overdueTasks, sub: "ต้องรีบดำเนินการทันที", cls: "stat-red", icon: <AlertTriangle size={20} className="text-rose-300 animate-pulse" /> },
        ].map((s, i) => (
          <div key={i} className={cn("glass-panel p-5.5 relative overflow-hidden group hover:border-white/20 transition-all duration-300", s.cls)}>
            {/* Ambient gradients */}
            <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-white/3 blur-xl group-hover:scale-125 transition-all duration-500" />
            <div className="relative flex items-start gap-4">
              <div className="w-11 h-11 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm shadow-inner">
                {s.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-3xl font-extrabold text-white tracking-tight leading-none mb-1.5">{s.value}</p>
                <p className="text-[13px] font-bold text-slate-200">{s.label}</p>
                <p className="text-[11px] text-slate-400 mt-1 font-medium">{s.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Donut Status Chart */}
        <div className="glass-panel p-6 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-1.5 h-4.5 bg-purple-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
              <h2 className="text-[14px] font-bold text-slate-100 uppercase tracking-wider">สถานะงานทั้งหมด</h2>
            </div>
            {totalTasks > 0 ? (
              <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
                <div className="relative w-40 h-40 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%" cy="50%"
                        innerRadius={50} outerRadius={70}
                        paddingAngle={4} dataKey="value"
                        strokeWidth={0}
                      >
                        {statusChartData.map((entry: { color: string }, i: number) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Total Tasks Label in the Center */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-[24px] font-black text-white leading-none mb-0.5">{totalTasks}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">งานทั้งหมด</p>
                  </div>
                </div>
                {/* Legend list */}
                <div className="flex-1 space-y-2.5 w-full">
                  {statusChartData.map((d: { name: string; value: number; color: string }) => (
                    <div key={d.name} className="flex items-center justify-between py-0.5 border-b border-white/5 last:border-0">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color, boxShadow: `0 0 8px ${d.color}60` }} />
                        <span className="text-[12.5px] font-medium text-slate-300">{d.name}</span>
                      </div>
                      <span className="text-[13px] font-bold text-white bg-white/5 px-2 py-0.5 rounded-lg">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-44 flex flex-col items-center justify-center text-slate-500">
                <Zap size={32} className="mb-2 text-slate-600 stroke-[1.5]" />
                <p className="text-[12px] font-bold">ยังไม่มีข้อมูลในขณะนี้</p>
              </div>
            )}
          </div>
        </div>

        {/* Bar Categories Chart */}
        <div className="glass-panel p-6 lg:col-span-3">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-1.5 h-4.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
            <h2 className="text-[14px] font-bold text-slate-100 uppercase tracking-wider">จำนวนงานแยกตามหมวดหมู่</h2>
          </div>
          {categoryChartData.length > 0 ? (
            <div className="h-[210px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData} barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 500 }}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 500 }}
                    axisLine={false} tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(15, 12, 35, 0.9)",
                      backdropFilter: "blur(8px)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "12px",
                      fontSize: "12px",
                      color: "#f8fafc",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.4)"
                    }}
                    formatter={(v) => [`${v} งาน`, "งานในหมวดหมู่นี้"]}
                    cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={40}>
                    {categoryChartData.map((e: { fill: string }, i: number) => (
                      <Cell key={i} fill={e.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[210px] flex flex-col items-center justify-center text-slate-500">
              <BarChart2 size={32} className="mb-2 text-slate-600 stroke-[1.5]" />
              <p className="text-[12px] font-bold">ยังไม่มีข้อมูลหมวดหมู่ในระบบ</p>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Tasks Section */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-4.5 bg-purple-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
            <h2 className="text-[14px] font-bold text-slate-100 flex items-center gap-2 uppercase tracking-wider">
              <span>งานที่ใกล้ถึงกำหนดส่ง</span>
              <span className="text-[11px] font-medium text-slate-500 lowercase normal-case">(ภายใน 7 วันข้างหน้า)</span>
            </h2>
          </div>
          <Link
            href="/dashboard/tasks"
            className="flex items-center gap-1.5 text-[12px] text-purple-400 hover:text-purple-300 font-bold transition-colors group"
          >
            <span>ดูงานทั้งหมด</span>
            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {upcomingTasks?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {upcomingTasks.map((task: {
              id: string; title: string; dueDate: string;
              priority: string; category?: { name: string; color: string }
            }) => (
              <Link
                key={task.id}
                href={`/dashboard/tasks?id=${task.id}`}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/2 hover:bg-white/5 border border-white/5 hover:border-purple-500/20 transition-all duration-300 group"
              >
                {/* Priority Indicator Dot */}
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor:
                      task.priority === "URGENT" ? "#ef4444" :
                      task.priority === "HIGH" ? "#f97316" :
                      task.priority === "MEDIUM" ? "#3b82f6" : "#64748b",
                    boxShadow: `0 0 10px ${
                      task.priority === "URGENT" ? "#ef4444" :
                      task.priority === "HIGH" ? "#f97316" :
                      task.priority === "MEDIUM" ? "#3b82f6" : "#64748b"
                    }60`
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] font-bold text-slate-200 truncate group-hover:text-purple-400 transition-colors">
                    {task.title}
                  </p>
                  {task.category && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: task.category.color }} />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{task.category.name}</span>
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <span className="text-[10px] px-2.5 py-1.5 rounded-lg font-bold bg-white/5 text-slate-300 border border-white/5 flex items-center gap-1.5">
                    <Calendar size={11} className="text-purple-400" />
                    {formatDate(task.dueDate)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white/2 border border-dashed border-white/5 rounded-xl">
            <div className="w-14 h-14 bg-white/3 border border-white/5 rounded-2xl flex items-center justify-center mx-auto mb-3.5">
              <Calendar size={22} className="text-slate-500" />
            </div>
            <p className="text-[13px] text-slate-400 font-bold">ไม่มีงานที่ครบกำหนดส่งภายใน 7 วันนี้ 🎉</p>
          </div>
        )}
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-7">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="skeleton h-7 w-40 rounded-xl" />
          <div className="skeleton h-4.5 w-64 rounded-lg" />
        </div>
        <div className="skeleton h-10 w-28 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="skeleton h-72 rounded-2xl lg:col-span-2" />
        <div className="skeleton h-72 rounded-2xl lg:col-span-3" />
      </div>
      <div className="skeleton h-56 rounded-2xl" />
    </div>
  )
}
