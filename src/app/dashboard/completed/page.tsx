"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState, useMemo } from "react"
import {
  CheckCircle2, Calendar, Trash2, ChevronDown, ChevronUp,
  Search, Filter, RotateCcw, Clock
} from "lucide-react"
import { formatDateTime } from "@/lib/utils"
import { TaskModal } from "@/components/tasks/TaskModal"
import { cn } from "@/lib/utils"

interface Task {
  id: string
  title: string
  description?: string | null
  priority: string
  completedAt?: string | null
  dueDate?: string | null
  category?: { name: string; color: string } | null
  assignees?: Array<{ user: { id: string; name: string; image: string | null } }>
  tags?: Array<{ tag: { name: string; color: string } }>
  subtasks?: Array<{ isDone: boolean }>
}

const PRIORITY_DOT: Record<string, string> = {
  LOW: "#64748b",
  MEDIUM: "#3b82f6",
  HIGH: "#f97316",
  URGENT: "#ef4444",
}
const PRIORITY_LABEL: Record<string, string> = {
  LOW: "ต่ำ", MEDIUM: "ปานกลาง", HIGH: "สูง", URGENT: "เร่งด่วน",
}

function groupByDate(tasks: Task[]): Record<string, Task[]> {
  const groups: Record<string, Task[]> = {}
  tasks.forEach((task) => {
    const date = task.completedAt ? new Date(task.completedAt) : new Date()
    const key = date.toLocaleDateString("th-TH", {
      year: "numeric", month: "long", day: "numeric",
    })
    if (!groups[key]) groups[key] = []
    groups[key].push(task)
  })
  return groups
}

export default function CompletedTasksPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  const { data, isLoading } = useQuery({
    queryKey: ["tasks-completed"],
    queryFn: async () => {
      const res = await fetch("/api/tasks?status=DONE")
      if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ")
      return res.json()
    },
  })
  const { data: catData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await fetch("/api/categories")).json(),
  })
  const categories = catData?.categories || []

  const { data: tagData } = useQuery({
    queryKey: ["tags"],
    queryFn: async () => (await fetch("/api/tags")).json(),
  })
  const tags = tagData?.tags || []


  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/tasks/${id}`, { method: "DELETE" })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks-completed"] }),
  })

  const revertMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "TODO" }),
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks-completed"] }),
  })

  const tasks: Task[] = data?.tasks ?? []

  const filtered = useMemo(() => {
    if (!search.trim()) return tasks
    return tasks.filter((t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase())
    )
  }, [tasks, search])

  // เรียงตาม completedAt ล่าสุดก่อน
  const sorted = useMemo(() =>
    [...filtered].sort((a, b) => {
      const da = a.completedAt ? new Date(a.completedAt).getTime() : 0
      const db = b.completedAt ? new Date(b.completedAt).getTime() : 0
      return db - da
    }), [filtered])

  const grouped = useMemo(() => groupByDate(sorted), [sorted])
  const groupKeys = Object.keys(grouped)

  const toggleGroup = (key: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
              <CheckCircle2 size={20} className="text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">งานที่เสร็จแล้ว</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {tasks.length} งาน · เรียงตามวันที่เสร็จ
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหางาน..."
            className="input input-sm pl-9 w-64"
          />
        </div>
      </div>

      {/* Stats bar */}
      <div className="glass-panel p-4 flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span className="text-sm text-slate-300">
            เสร็จแล้วทั้งหมด <strong className="text-white">{tasks.length}</strong> งาน
          </span>
        </div>
        <div className="h-4 w-px bg-white/10" />
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-indigo-400" />
          <span className="text-sm text-slate-300">
            แบ่งเป็น <strong className="text-white">{groupKeys.length}</strong> วัน
          </span>
        </div>
        {search && (
          <>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-purple-400" />
              <span className="text-sm text-slate-300">
                ผลลัพธ์ <strong className="text-white">{filtered.length}</strong> รายการ
              </span>
            </div>
          </>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-panel p-5 space-y-3">
              <div className="skeleton h-4 w-32" />
              {[1, 2].map((j) => (
                <div key={j} className="skeleton h-16 w-full" />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && tasks.length === 0 && (
        <div className="glass-panel p-16 text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={36} className="text-emerald-500/50" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">ยังไม่มีงานที่เสร็จ</h3>
          <p className="text-sm text-slate-500">เมื่องานสำเร็จจะถูกย้ายมาแสดงที่นี่โดยอัตโนมัติ</p>
        </div>
      )}

      {/* No search result */}
      {!isLoading && tasks.length > 0 && filtered.length === 0 && (
        <div className="glass-panel p-12 text-center">
          <Search size={32} className="text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">ไม่พบงานที่ตรงกับ &ldquo;{search}&rdquo;</p>
        </div>
      )}

      {/* Grouped tasks */}
      {!isLoading && groupKeys.map((dateKey) => {
        const collapsed = collapsedGroups.has(dateKey)
        const group = grouped[dateKey]
        return (
          <div key={dateKey} className="glass-panel overflow-hidden">
            {/* Group header */}
            <button
              onClick={() => toggleGroup(dateKey)}
              className="w-full flex items-center justify-between px-5 py-4 border-b border-white/5 hover:bg-white/3 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                  <Calendar size={14} className="text-emerald-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-white">{dateKey}</p>
                  <p className="text-xs text-slate-500">{group.length} งาน</p>
                </div>
              </div>
              {collapsed
                ? <ChevronDown size={16} className="text-slate-500" />
                : <ChevronUp size={16} className="text-slate-500" />
              }
            </button>

            {/* Task list */}
            {!collapsed && (
              <div className="divide-y divide-white/4">
                {group.map((task) => {
                  const subtasksDone = task.subtasks?.filter(s => s.isDone).length ?? 0
                  const subtasksTotal = task.subtasks?.length ?? 0
                  return (
                    <div
                      key={task.id}
                      className="flex items-start gap-4 px-5 py-4 hover:bg-white/3 transition-colors group"
                    >
                      {/* Check icon */}
                      <div className="mt-0.5 flex-shrink-0">
                        <CheckCircle2 size={18} className="text-emerald-400" />
                      </div>

                      {/* Content */}
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => setSelectedTaskId(task.id)}
                      >
                        <p className="text-sm font-semibold text-slate-300 line-through decoration-slate-600 truncate">
                          {task.title}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          {/* Priority */}
                          <span className="flex items-center gap-1 text-[11px] text-slate-500">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: PRIORITY_DOT[task.priority] }}
                            />
                            {PRIORITY_LABEL[task.priority]}
                          </span>
                          {/* Category */}
                          {task.category && (
                            <span
                              className="text-[11px] px-2 py-0.5 rounded-full border"
                              style={{
                                backgroundColor: `${task.category.color}18`,
                                borderColor: `${task.category.color}30`,
                                color: task.category.color,
                              }}
                            >
                              {task.category.name}
                            </span>
                          )}
                          {/* Subtasks */}
                          {subtasksTotal > 0 && (
                            <span className="text-[11px] text-slate-500">
                              ✓ {subtasksDone}/{subtasksTotal}
                            </span>
                          )}
                          {/* Completed time */}
                          {task.completedAt && (
                            <span className="flex items-center gap-1 text-[11px] text-emerald-600">
                              <Clock size={10} />
                              {formatDateTime(task.completedAt)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions (show on hover) */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button
                          onClick={() => revertMutation.mutate(task.id)}
                          className="btn btn-ghost btn-sm p-2"
                          title="ย้ายกลับไปรอดำเนินการ"
                        >
                          <RotateCcw size={13} className="text-slate-500 hover:text-amber-400" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("ลบงานนี้ถาวรหรือไม่?")) deleteMutation.mutate(task.id)
                          }}
                          className="btn btn-ghost btn-sm p-2"
                        >
                          <Trash2 size={13} className="text-slate-500 hover:text-red-400" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {/* Task detail modal */}
      {selectedTaskId && (
        <TaskModal
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          categories={categories}
          tags={tags}
        />
      )}
    </div>
  )
}