"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Tag as TagIcon, Plus, Trash2, Loader2, Check } from "lucide-react"

const PRESET_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f97316",
  "#f59e0b", "#10b981", "#06b6d4", "#3b82f6", "#94a3b8"
]

export default function TagsPage() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ name: "", color: "#8b5cf6" })
  const [error, setError] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const res = await fetch("/api/tags")
      return res.json()
    },
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || "เกิดข้อผิดพลาดในการสร้างแท็ก")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] })
      setForm({ name: "", color: "#8b5cf6" })
      setError("")
    },
    onError: (err: Error) => setError(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tags?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete tag")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] })
    },
  })

  const tags = data?.tags || []

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
          <TagIcon size={24} className="text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]" />
          <span>ป้ายกำกับ (Tags)</span>
        </h1>
        <p className="text-slate-400 text-sm mt-0.5 font-medium">จัดการป้ายกำกับสำหรับจัดกลุ่มงานย่อยเพิ่มเติม</p>
      </div>

      {/* Form Panel */}
      <div className="glass-panel p-6 border-purple-500/10">
        <h2 className="text-[14px] font-bold text-slate-100 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
          <span>เพิ่มป้ายกำกับใหม่</span>
        </h2>
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/25 rounded-xl text-red-300 text-[13px] font-medium animate-shake">
            ⚠️ {error}
          </div>
        )}
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">ชื่อแท็ก</label>
            <input
              id="tag-name-input"
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              onKeyDown={(e) => { if (e.key === "Enter" && form.name.trim()) createMutation.mutate() }}
              placeholder="เช่น urgent, bug, feature..."
              className="input w-full"
            />
          </div>
          <div className="w-full md:w-auto">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">สีของแท็ก</label>
            <div className="flex gap-1.5 flex-wrap">
              {PRESET_COLORS.slice(0, 7).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, color: c }))}
                  className="w-8.5 h-8.5 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-md"
                  style={{
                    backgroundColor: c,
                    borderColor: form.color === c ? "#ffffff" : "transparent",
                    boxShadow: form.color === c ? `0 0 10px ${c}` : "none"
                  }}
                >
                  {form.color === c && <Check size={12} className="text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>
          <button
            id="btn-create-tag"
            type="button"
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending || !form.name.trim()}
            className="btn btn-primary btn-md w-full md:w-auto font-bold py-2.5 h-11"
          >
            {createMutation.isPending ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Plus size={15} className="stroke-[2.5]" />
            )}
            <span>สร้างแท็ก</span>
          </button>
        </div>
      </div>

      {/* Grid Display */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
        </div>
      ) : tags.length === 0 ? (
        <div className="glass-panel p-12 text-center border-dashed">
          <TagIcon size={40} className="mx-auto mb-4 text-slate-600 stroke-[1.5]" />
          <p className="text-slate-400 text-[13.5px] font-bold">ยังไม่มีป้ายกำกับใดๆ ในระบบในขณะนี้</p>
          <p className="text-slate-500 text-[12px] mt-1">เริ่มต้นได้ง่ายๆ โดยพิมพ์สร้างป้ายกำกับด้านบน</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 stagger">
          {tags.map((tag: { id: string; name: string; color: string; _count: { tasks: number } }) => (
            <div
              key={tag.id}
              className="glass-panel p-4 flex items-center justify-between hover:border-white/15 transition-all duration-300 group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="text-[12px] font-bold px-3 py-1.5 rounded-full border truncate"
                  style={{
                    backgroundColor: `${tag.color}15`,
                    borderColor: `${tag.color}35`,
                    color: tag.color,
                    boxShadow: `0 0 10px ${tag.color}10`
                  }}
                >
                  #{tag.name}
                </span>
              </div>
              <div className="flex items-center gap-2.5 flex-shrink-0">
                <span className="text-xs font-bold text-slate-400 bg-white/5 border border-white/5 px-2 py-0.5 rounded-lg">
                  {tag._count.tasks} งาน
                </span>
                <button
                  id={`btn-delete-tag-${tag.id}`}
                  onClick={() => {
                    if (confirm(`คุณต้องการลบป้ายกำกับ "#${tag.name}" หรือไม่?`)) {
                      deleteMutation.mutate(tag.id)
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  title="ลบป้ายกำกับ"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
