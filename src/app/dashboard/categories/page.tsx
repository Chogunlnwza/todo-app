"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Folder, Plus, Trash2, Edit, Loader2, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const PRESET_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f97316",
  "#f59e0b", "#10b981", "#06b6d4", "#3b82f6", "#94a3b8"
]

export default function CategoriesPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", color: "#6366f1", icon: "folder" })
  const [error, setError] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories")
      return res.json()
    },
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
          }) => (
            <div
              key={cat.id}
              className="glass-panel p-4.5 flex items-center gap-4 hover:border-white/15 transition-all duration-300 group"
            >
              {/* Icon frame with custom category tint background */}
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
              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
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
              {/* Color capsule pill */}
              <div
                className="w-3.5 h-3.5 rounded-full flex-shrink-0 ml-1.5 border border-white/10"
                style={{ backgroundColor: cat.color, boxShadow: `0 0 10px ${cat.color}80` }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
