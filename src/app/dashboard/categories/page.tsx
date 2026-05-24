"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Folder, Plus, Trash2, Edit, Loader2, Check,
  ChevronDown, ChevronRight, CheckCircle2, Circle,
  Clock, AlertCircle, XCircle, ArrowRight, Calendar, Flag
} from "lucide-react"
import { cn, STATUS_LABELS, PRIORITY_LABELS, formatDate } from "@/lib/utils"

const PRESET_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f97316",
  "#f59e0b", "#10b981", "#06b6d4", "#3b82f6", "#94a3b8"
]

const STATUS_ICONS: Record<string, React.ReactNode> = {
  TODO: <Circle size={13} className="text-purple-400" />,
  IN_PROGRESS: <Clock size={13} className="text-blue-400" />,
  IN_REVIEW: <AlertCircle size={13} className="text-amber-400" />,
  DONE: <CheckCircle2 size={13} className="text-emerald-400" />,
  CANCELLED: <XCircle size={13} className="text-red-400" />,
}

const PRIORITY_DOT: Record<string, string> = {
  LOW: "#64748b", MEDIUM: "#3b82f6", HIGH: "#f97316", URGENT: "#ef4444",
}

export default function CategoriesPage() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", color: "#6366f1", icon: "folder" })
  const [error, setError] = useState("")
  const [expandedCatId, setExpandedCatId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories")
      return res.json()
    },
  })

  // Fetch tasks for expanded category
  const { data: catTasksData, isLoading: catTasksLoading } = useQuery({
    queryKey: ["tasks-by-category", expandedCatId],
    queryFn: async () => {
      const res = await fetch(`/api/tasks?categoryId=${expandedCatId}`)
      return res.json()
    },
    enabled: !!expandedCatId,
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      const url = editId ? `/api/categories/${editId}` : "/api/categories"
      const method = editId ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || "เกิดข้อผิดพลาดในการบันทึก")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      setForm({ name: "", color: "#6366f1", icon: "folder" })
      setShowForm(false)
      setEditId(null)
      setError("")
    },
    onError: (err: Error) => setError(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete category")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] })
    },
  })

  const categories = data?.categories || []
  const catTasks = catTasksData?.tasks || []

  const startEdit = (cat: { id: string; name: string; color: string; icon: string }) => {
    setEditId(cat.id)
    setForm({ name: cat.name, color: cat.color, icon: cat.icon })
    setShowForm(true)
  }

  const cancelForm = () => {
    setShowForm(false)
    setEditId(null)
    setForm({ name: "", color: "#6366f1", icon: "folder" })
    setError("")
  }

  const toggleExpand = (catId: string) => {
    setExpandedCatId(prev => prev === catId ? null : catId)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Folder size={24} className="text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]" />
            <span>หมวดหมู่งาน</span>
          </h1>
          <p className="text-slate-400 text-sm mt-0.5 font-medium">จัดการหมวดหมู่สำหรับแบ่งประเภทงานให้เป็นระบบ</p>
        </div>
        {!showForm && (
          <button
            id="btn-add-category"
            onClick={() => setShowForm(true)}
            className="btn btn-primary btn-md"
          >
            <Plus size={16} />
            <span>เพิ่มหมวดหมู่</span>
          </button>
        )}
      </div>

      {/* Form Dialog Box */}
      {showForm && (
        <div className="glass-panel p-6 animate-scale-up border-purple-500/10">
          <h2 className="text-[15px] font-bold text-slate-100 mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
            {editId ? "แก้ไขข้อมูลหมวดหมู่" : "สร้างหมวดหมู่ใหม่"}
          </h2>
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/25 rounded-xl text-red-300 text-[13px] font-medium">
              ⚠️ {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">ชื่อหมวดหมู่</label>
              <input
                id="category-name-input"
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="ระบุชื่อหมวดหมู่ เช่น งานส่วนตัว, โปรเจคจบ..."
                className="input"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">เลือกโทนสีประจำหมวดหมู่</label>
              <div className="flex flex-wrap gap-2.5">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, color: c }))}
                    className="w-8.5 h-8.5 rounded-full border-2 transition-all flex items-center justify-center hover:scale-110 active:scale-95 shadow-lg"
                    style={{
                      backgroundColor: c,
                      borderColor: form.color === c ? "#ffffff" : "transparent",
                      boxShadow: form.color === c ? `0 0 14px ${c}` : "none",
                    }}
                  >
                    {form.color === c && <Check size={14} className="text-white stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              id="btn-cancel-category"
              type="button"
              onClick={cancelForm}
              className="flex-1 btn btn-secondary py-2.5 text-sm"
            >
              ยกเลิก
            </button>
            <button
              id="btn-save-category"
              type="button"
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending || !form.name.trim()}
              className="flex-1 btn btn-primary py-2.5 text-sm font-bold"
            >
              {createMutation.isPending && <Loader2 size={14} className="animate-spin" />}
              <span>{editId ? "บันทึกข้อมูล" : "สร้างหมวดหมู่"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Grid List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-panel p-5 flex items-center gap-4">
              <div className="skeleton w-10 h-10 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-40 rounded" />
                <div className="skeleton h-3 w-20 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="glass-panel p-12 text-center border-dashed">
          <Folder size={40} className="mx-auto mb-4 text-slate-600 stroke-[1.5]" />
          <p className="text-slate-400 text-[13.5px] font-bold">ยังไม่มีหมวดหมู่บันทึกไว้ในขณะนี้</p>
          <p className="text-slate-500 text-[12px] mt-1">เริ่มต้นง่ายๆ โดยการกดเพิ่มหมวดหมู่ด้านบน</p>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat: {
            id: string; name: string; color: string; icon: string;
            _count: { tasks: number }
          }) => {
            const isExpanded = expandedCatId === cat.id
            return (
              <div key={cat.id} className="rounded-2xl overflow-hidden border border-white/8 transition-all duration-300">
                {/* Category Card Row */}
                <div
                  className={cn(
                    "glass-panel rounded-none border-0 p-4.5 flex items-center gap-4 hover:border-white/15 transition-all duration-300 group cursor-pointer",
                    isExpanded && "bg-white/4 border-b border-white/8"
                  )}
                  onClick={() => toggleExpand(cat.id)}
                >
                  {/* Icon frame */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border"
                    style={{ backgroundColor: `${cat.color}15`, borderColor: `${cat.color}35` }}
                  >
                    <Folder size={20} style={{ color: cat.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-100 group-hover:text-purple-400 transition-colors">{cat.name}</p>
                    <p className="text-xs text-slate-400 mt-1 font-semibold">{cat._count.tasks} รายการงาน</p>
                  </div>

                  {/* Expand Indicator */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-500 hidden sm:block">
                      {isExpanded ? "ซ่อนรายการงาน" : "ดูรายการงาน"}
                    </span>
                    {isExpanded
                      ? <ChevronDown size={16} className="text-purple-400 transition-transform" />
                      : <ChevronRight size={16} className="text-slate-500 group-hover:text-purple-400 transition-colors" />
                    }
                  </div>

                  {/* Action buttons - stop propagation */}
                  <div
                    className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      id={`btn-edit-cat-${cat.id}`}
                      onClick={() => startEdit(cat)}
                      className="p-2 text-slate-400 hover:text-purple-400 hover:bg-white/5 rounded-xl transition-all"
                      title="แก้ไข"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      id={`btn-delete-cat-${cat.id}`}
                      onClick={() => {
                        if (confirm(`คุณต้องการลบหมวดหมู่ "${cat.name}" หรือไม่?`)) {
                          deleteMutation.mutate(cat.id)
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                      title="ลบ"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Color dot */}
                  <div
                    className="w-3.5 h-3.5 rounded-full flex-shrink-0 border border-white/10"
                    style={{ backgroundColor: cat.color, boxShadow: `0 0 10px ${cat.color}80` }}
                  />
                </div>

                {/* Expandable Task Panel */}
                {isExpanded && (
                  <div className="bg-[#08061a]/70 p-4 space-y-2 animate-fade-in">
                    {catTasksLoading ? (
                      <div className="flex items-center justify-center py-6 gap-2.5">
                        <Loader2 size={16} className="animate-spin text-purple-400" />
                        <span className="text-xs text-slate-400 font-medium">กำลังโหลดรายการงาน...</span>
                      </div>
                    ) : catTasks.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-10 h-10 bg-white/3 border border-dashed border-white/10 rounded-xl flex items-center justify-center mx-auto mb-2.5">
                          <Folder size={18} className="text-slate-600" />
                        </div>
                        <p className="text-slate-500 text-[12px] font-semibold">ยังไม่มีงานในหมวดหมู่นี้</p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                          {catTasks.map((task: {
                            id: string; title: string; status: string;
                            priority: string; dueDate: string | null;
                          }) => (
                            <button
                              key={task.id}
                              onClick={() => router.push(`/dashboard/tasks?id=${task.id}`)}
                              className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/6 border border-white/5 hover:border-purple-500/20 transition-all duration-200 group/task text-left"
                            >
                              {/* Priority dot */}
                              <div
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{
                                  backgroundColor: PRIORITY_DOT[task.priority] || "#64748b",
                                  boxShadow: `0 0 6px ${PRIORITY_DOT[task.priority] || "#64748b"}80`
                                }}
                              />
                              {/* Status icon */}
                              <div className="flex-shrink-0">{STATUS_ICONS[task.status]}</div>
                              {/* Title */}
                              <span className={cn(
                                "flex-1 text-[12.5px] font-semibold text-slate-200 truncate group-hover/task:text-purple-400 transition-colors",
                                task.status === "DONE" && "line-through text-slate-500"
                              )}>
                                {task.title}
                              </span>
                              {/* Due date */}
                              {task.dueDate && (
                                <span className="flex items-center gap-1 text-[10px] text-slate-500 font-medium flex-shrink-0">
                                  <Calendar size={10} className="text-purple-400" />
                                  {formatDate(task.dueDate)}
                                </span>
                              )}
                              <ArrowRight size={11} className="text-slate-600 group-hover/task:text-purple-400 transition-colors flex-shrink-0" />
                            </button>
                          ))}
                        </div>
                        {/* View all link */}
                        <div className="pt-1.5 border-t border-white/5">
                          <button
                            onClick={() => router.push(`/dashboard/tasks?categoryId=${cat.id}`)}
                            className="flex items-center gap-1.5 text-[11px] font-bold text-purple-400 hover:text-purple-300 transition-colors mx-auto"
                          >
                            <span>ดูงานทั้งหมดในหมวด {cat.name}</span>
                            <ArrowRight size={12} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
