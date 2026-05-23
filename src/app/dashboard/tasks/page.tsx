"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState, useCallback, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  Plus, Search, LayoutList, Columns3, RefreshCw,
  CheckCircle2, X, ChevronDown, Filter
} from "lucide-react"
import { cn, STATUS_LABELS, PRIORITY_LABELS } from "@/lib/utils"
import { TaskModal } from "@/components/tasks/TaskModal"
import { TaskCard } from "@/components/tasks/TaskCard"
import { KanbanBoard } from "@/components/tasks/KanbanBoard"

type ViewMode = "list" | "kanban"

export default function TasksPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()

  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [showModal, setShowModal] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    status: searchParams.get("status") || "ALL",
    priority: searchParams.get("priority") || "ALL",
    categoryId: searchParams.get("categoryId") || "",
    tagId: "",
  })

  useEffect(() => {
    const id = searchParams.get("id")
    if (id) setSelectedTaskId(id)
    if (searchParams.get("new") === "true") setShowModal(true)
  }, [searchParams])

  const buildQS = useCallback(() => {
    const p = new URLSearchParams()
    if (filters.search) p.set("search", filters.search)
    if (filters.status !== "ALL") p.set("status", filters.status)
    if (filters.priority !== "ALL") p.set("priority", filters.priority)
    if (filters.categoryId) p.set("categoryId", filters.categoryId)
    if (filters.tagId) p.set("tagId", filters.tagId)
    return p.toString()
  }, [filters])

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["tasks", filters],
    queryFn: async () => {
      const qs = buildQS()
      const res = await fetch(`/api/tasks${qs ? "?" + qs : ""}`)
      if (!res.ok) throw new Error("Failed to fetch tasks")
      return res.json()
    },
  })

  const { data: catData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await fetch("/api/categories")).json(),
  })
  const { data: tagData } = useQuery({
    queryKey: ["tags"],
    queryFn: async () => (await fetch("/api/tags")).json(),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/tasks/${id}`, { method: "DELETE" })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] })
    },
  })

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] })
    },
  })

  const tasks = data?.tasks || []
  const categories = catData?.categories || []
  const tags = tagData?.tags || []

  const activeFilters = [
    filters.status !== "ALL",
    filters.priority !== "ALL",
    !!filters.categoryId,
    !!filters.tagId,
  ].filter(Boolean).length

  const clearFilters = () => setFilters(f => ({ ...f, status: "ALL", priority: "ALL", categoryId: "", tagId: "" }))

  return (
    <div className="max-w-7xl mx-auto space-y-5 animate-fade-up">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-extrabold text-white flex items-center gap-2.5">
            <CheckCircle2 size={24} className="text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]" /> 
            <span>งานทั้งหมดของคุณ</span>
          </h1>
          <p className="text-slate-400 text-[13px] mt-0.5 font-medium">
            {isLoading ? "กำลังโหลดข้อมูล..." : `ค้นพบงานทั้งหมด ${tasks.length} รายการ`}
          </p>
        </div>
        <button
          id="btn-add-task"
          onClick={() => setShowModal(true)}
          className="btn btn-primary btn-md self-start sm:self-auto"
        >
          <Plus size={16} /> 
          <span>เพิ่มงานใหม่</span>
        </button>
      </div>

      {/* Toolbar / Filters Panel */}
      <div className="glass-panel p-4 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            id="task-search"
            type="text"
            value={filters.search}
            onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
            placeholder="ค้นหาชื่อ หรือรายละเอียดงาน..."
            className="input input-sm pl-9 w-full"
          />
        </div>

        {/* Filters Selectors Row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter */}
          <div className="relative">
            <select
              id="filter-status"
              value={filters.status}
              onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
              className="appearance-none input input-sm pr-9.5 cursor-pointer text-[12.5px] min-w-[130px] font-medium"
            >
              <option value="ALL">สถานะทั้งหมด</option>
              {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="relative">
            <select
              id="filter-priority"
              value={filters.priority}
              onChange={(e) => setFilters(f => ({ ...f, priority: e.target.value }))}
              className="appearance-none input input-sm pr-9.5 cursor-pointer text-[12.5px] min-w-[140px] font-medium"
            >
              <option value="ALL">ความสำคัญทั้งหมด</option>
              {Object.entries(PRIORITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="relative">
              <select
                id="filter-category"
                value={filters.categoryId}
                onChange={(e) => setFilters(f => ({ ...f, categoryId: e.target.value }))}
                className="appearance-none input input-sm pr-9.5 cursor-pointer text-[12.5px] min-w-[130px] font-medium"
              >
                <option value="">ทุกหมวดหมู่</option>
                {categories.map((c: { id: string; name: string }) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Clear Filters Button */}
          {activeFilters > 0 && (
            <button
              id="btn-clear-filters"
              onClick={clearFilters}
              className="btn btn-sm btn-danger flex items-center gap-1.5"
            >
              <X size={13} /> 
              <span>ล้างตัวกรอง ({activeFilters})</span>
            </button>
          )}
        </div>

        {/* View Layout Controls (Right) */}
        <div className="ml-auto flex items-center gap-2">
          <button
            id="btn-refresh"
            onClick={() => refetch()}
            className="w-9 h-9 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl border border-transparent hover:border-white/5 transition-all flex items-center justify-center"
            title="ดึงข้อมูลใหม่"
          >
            <RefreshCw size={14} className={cn(isLoading && "animate-spin")} />
          </button>
          {/* List / Kanban toggler */}
          <div className="flex items-center bg-white/5 border border-white/5 rounded-xl p-1 gap-1">
            <button
              id="btn-list-view"
              onClick={() => setViewMode("list")}
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                viewMode === "list" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-slate-400 hover:text-slate-200"
              )}
              title="แสดงแบบรายการ (List)"
            >
              <LayoutList size={14} />
            </button>
            <button
              id="btn-kanban-view"
              onClick={() => setViewMode("kanban")}
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                viewMode === "kanban" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-slate-400 hover:text-slate-200"
              )}
              title="แสดงแบบคอลัมน์ (Kanban Board)"
            >
              <Columns3 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Task List / Kanban Contents */}
      {isLoading ? (
        <ListSkeleton />
      ) : tasks.length === 0 ? (
        <EmptyState onAdd={() => setShowModal(true)} hasFilters={activeFilters > 0 || !!filters.search} />
      ) : viewMode === "list" ? (
        <div className="space-y-2.5 stagger">
          {tasks.map((task: Record<string, unknown>) => (
            <TaskCard
              key={task.id as string}
              task={task}
              onEdit={() => setSelectedTaskId(task.id as string)}
              onDelete={() => deleteMutation.mutate(task.id as string)}
              onStatusChange={(status) => statusMutation.mutate({ id: task.id as string, status })}
            />
          ))}
        </div>
      ) : (
        <KanbanBoard
          tasks={tasks}
          onEdit={(id) => setSelectedTaskId(id)}
          onDelete={(id) => deleteMutation.mutate(id)}
          onStatusChange={(id, status) => statusMutation.mutate({ id, status })}
        />
      )}

      {/* Task Modal overlay */}
      {(showModal || selectedTaskId) && (
        <TaskModal
          taskId={selectedTaskId}
          onClose={() => {
            setShowModal(false)
            setSelectedTaskId(null)
            router.replace("/dashboard/tasks")
          }}
          categories={categories}
          tags={tags}
        />
      )}
    </div>
  )
}

function EmptyState({ onAdd, hasFilters }: { onAdd: () => void; hasFilters: boolean }) {
  return (
    <div className="glass-panel p-16 text-center animate-scale-up">
      <div className="w-16 h-16 bg-gradient-to-tr from-purple-500/20 to-indigo-500/20 border border-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-purple-500/5">
        <CheckCircle2 size={28} className="text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]" />
      </div>
      <h3 className="text-[16px] font-bold text-slate-100 mb-1.5">
        {hasFilters ? "ไม่พบงานที่ตรงกับตัวคัดกรอง" : "ยังไม่มีงานที่บันทึกไว้ในระบบ"}
      </h3>
      <p className="text-[13px] text-slate-400 mb-6 max-w-sm mx-auto font-medium">
        {hasFilters ? "กรุณาลองเปลี่ยนคำค้นหาหรือตัวกรองระดับความสำคัญใหม่อีกครั้ง" : "มาเริ่มเพิ่มรายการงานชิ้นแรกของคุณด้วยการกดปุ่มด้านล่างนี้ได้เลย"}
      </p>
      {!hasFilters && (
        <button id="btn-empty-add" onClick={onAdd} className="btn btn-primary btn-md mx-auto">
          <Plus size={15} /> 
          <span>เพิ่มงานแรกของคุณ</span>
        </button>
      )}
    </div>
  )
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="glass-panel p-5.5 flex items-center gap-4">
          <div className="skeleton w-6 h-6 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2.5">
            <div className="skeleton h-4.5 w-60 rounded-md" />
            <div className="skeleton h-3.5 w-44 rounded-md" />
          </div>
          <div className="skeleton h-7 w-20 rounded-lg flex-shrink-0" />
        </div>
      ))}
    </div>
  )
}
