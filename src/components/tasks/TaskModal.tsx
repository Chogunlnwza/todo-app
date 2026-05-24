"use client"

import { useState, useEffect, useRef } from "react"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import {
  X, Plus, Trash2, Loader2, Calendar, Flag, User2,
  Tag, Folder, CheckSquare, Square, Save, AlertCircle,
  MessageSquare, User, ListTodo, Layers
} from "lucide-react"
import { cn, STATUS_LABELS, PRIORITY_LABELS, formatRelative } from "@/lib/utils"
import { TaskStatus, Priority } from "@prisma/client"

interface TaskModalProps {
  taskId: string | null
  categories: Array<{ id: string; name: string; color: string }>
  tags: Array<{ id: string; name: string; color: string }>
  onClose: () => void
}

const STATUSES = Object.entries(STATUS_LABELS)
const PRIORITIES = Object.entries(PRIORITY_LABELS)

const PRESET_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f97316",
  "#f59e0b", "#10b981", "#06b6d4", "#3b82f6", "#94a3b8"
]

export function TaskModal({ taskId, categories, tags, onClose }: TaskModalProps) {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const currentUserId = session?.user?.id
  const isEdit = !!taskId

  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "TODO" as TaskStatus,
    priority: "MEDIUM" as Priority,
    dueDate: "",
    categoryId: "",
    tagIds: [] as string[],
    assigneeIds: [] as string[],
  })

  const [subtasks, setSubtasks] = useState<Array<{ id?: string; title: string; isDone: boolean }>>([])
  const [newSubtask, setNewSubtask] = useState("")
  const [userSearch, setUserSearch] = useState("")
  const [assignees, setAssignees] = useState<Array<{ id: string; name: string; email: string }>>([])

  // Comments state
  const [newComment, setNewComment] = useState("")

  // Quick-creation Category & Tag states
  const [showQuickCategory, setShowQuickCategory] = useState(false)
  const [quickCategoryName, setQuickCategoryName] = useState("")
  const [quickCategoryColor, setQuickCategoryColor] = useState("#6366f1")

  const [showQuickTag, setShowQuickTag] = useState(false)
  const [quickTagName, setQuickTagName] = useState("")
  const [quickTagColor, setQuickTagColor] = useState("#8b5cf6")

  const [error, setError] = useState("")
  const titleRef = useRef<HTMLInputElement>(null)

  // Load existing task
  const { data: taskData, isLoading: taskLoading } = useQuery({
    queryKey: ["task", taskId],
    queryFn: async () => {
      const res = await fetch(`/api/tasks/${taskId}`)
      return res.json()
    },
    enabled: !!taskId,
  })

  useEffect(() => {
    if (taskData?.task) {
      const t = taskData.task
      setForm({
        title: t.title,
        description: t.description || "",
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate ? t.dueDate.split("T")[0] : "",
        categoryId: t.categoryId || "",
        tagIds: t.tags.map((tt: { tagId: string; tag?: { id: string } }) => tt.tagId || tt.tag?.id || ""),
        assigneeIds: t.assignees.map((a: { userId: string }) => a.userId),
      })
      setSubtasks(t.subtasks || [])
      setAssignees(t.assignees.map((a: { user: { id: string; name: string; email: string } }) => a.user))
    }
  }, [taskData])

  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  // User search
  const { data: searchResults } = useQuery({
    queryKey: ["user-search", userSearch],
    queryFn: async () => {
      if (!userSearch.trim()) return { users: [] }
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(userSearch)}`)
      return res.json()
    },
    enabled: userSearch.length > 1,
  })

  /* ─── Mutations for Task ─── */
  const saveMutation = useMutation({
    mutationFn: async () => {
      const url = isEdit ? `/api/tasks/${taskId}` : "/api/tasks"
      const method = isEdit ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          dueDate: form.dueDate || null,
          categoryId: form.categoryId || null,           // "" → null
          tagIds: form.tagIds.filter((id) => id !== ""), // กรอง empty string ออก
          subtasks: !isEdit ? subtasks.map((s) => ({ title: s.title })) : undefined,
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || "เกิดข้อผิดพลาดในการบันทึกงาน")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] })
      if (taskId) queryClient.invalidateQueries({ queryKey: ["task", taskId] })
      onClose()
    },
    onError: (err: Error) => setError(err.message),
  })

  /* ─── Mutations for Comments ─── */
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/tasks/${taskId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })
      if (!res.ok) throw new Error("ไม่สามารถสร้างคอมเมนต์ได้")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] })
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      setNewComment("")
    },
    onError: (err: Error) => setError(err.message),
  })

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const res = await fetch(`/api/tasks/${taskId}/comments?commentId=${commentId}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("ไม่สามารถลบคอมเมนต์ได้")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] })
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
    },
    onError: (err: Error) => setError(err.message),
  })

  /* ─── Mutations for Subtasks (Edit Mode Only) ─── */
  const addSubtaskMutation = useMutation({
    mutationFn: async (title: string) => {
      const res = await fetch(`/api/tasks/${taskId}/subtasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      })
      if (!res.ok) throw new Error("ไม่สามารถสร้างงานย่อยได้")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] })
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
    },
    onError: (err: Error) => setError(err.message),
  })

  const toggleSubtaskMutation = useMutation({
    mutationFn: async ({ subtaskId, isDone }: { subtaskId: string; isDone: boolean }) => {
      const res = await fetch(`/api/tasks/${taskId}/subtasks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subtaskId, isDone }),
      })
      if (!res.ok) throw new Error("ไม่สามารถเปลี่ยนสถานะงานย่อยได้")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] })
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
    },
    onError: (err: Error) => setError(err.message),
  })

  const deleteSubtaskMutation = useMutation({
    mutationFn: async (subtaskId: string) => {
      const res = await fetch(`/api/tasks/${taskId}/subtasks?subtaskId=${subtaskId}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("ไม่สามารถลบงานย่อยได้")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] })
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
    },
    onError: (err: Error) => setError(err.message),
  })

  /* ─── Mutations for Quick-create Category & Tag ─── */
  const createCategoryMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: quickCategoryName.trim(), color: quickCategoryColor }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || "สร้างหมวดหมู่ล้มเหลว")
      }
      return res.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      setForm(f => ({ ...f, categoryId: data.category.id }))
      setQuickCategoryName("")
      setShowQuickCategory(false)
    },
    onError: (err: Error) => setError(err.message),
  })

  const createTagMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: quickTagName.trim(), color: quickTagColor }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || "สร้างแท็กล้มเหลว")
      }
      return res.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tags"] })
      setForm(f => ({ ...f, tagIds: [...f.tagIds, data.tag.id] }))
      setQuickTagName("")
      setShowQuickTag(false)
    },
    onError: (err: Error) => setError(err.message),
  })

  /* ─── Subtask Handlers ─── */
  const handleToggleSubtask = (subtaskItem: { id?: string; isDone: boolean }, index: number) => {
    if (isEdit && subtaskItem.id) {
      toggleSubtaskMutation.mutate({ subtaskId: subtaskItem.id, isDone: !subtaskItem.isDone })
    } else {
      setSubtasks(prev => prev.map((s, i) => i === index ? { ...s, isDone: !s.isDone } : s))
    }
  }

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return
    if (isEdit) {
      addSubtaskMutation.mutate(newSubtask.trim())
    } else {
      setSubtasks(prev => [...prev, { title: newSubtask.trim(), isDone: false }])
    }
    setNewSubtask("")
  }

  const handleDeleteSubtask = (subtaskItem: { id?: string }, index: number) => {
    if (isEdit && subtaskItem.id) {
      deleteSubtaskMutation.mutate(subtaskItem.id)
    } else {
      setSubtasks(prev => prev.filter((_, i) => i !== index))
    }
  }

  /* ─── Comment Handlers ─── */
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    addCommentMutation.mutate(newComment.trim())
  }

  const toggleTag = (tagId: string) => {
    setForm((f) => ({
      ...f,
      tagIds: f.tagIds.includes(tagId)
        ? f.tagIds.filter((id) => id !== tagId)
        : [...f.tagIds, tagId],
    }))
  }

  const addAssignee = (user: { id: string; name: string; email: string }) => {
    if (!form.assigneeIds.includes(user.id)) {
      setForm((f) => ({ ...f, assigneeIds: [...f.assigneeIds, user.id] }))
      setAssignees((prev) => [...prev, user])
    }
    setUserSearch("")
  }

  const removeAssignee = (userId: string) => {
    setForm((f) => ({ ...f, assigneeIds: f.assigneeIds.filter((id) => id !== userId) }))
    setAssignees((prev) => prev.filter((u) => u.id !== userId))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { setError("กรุณากรอกชื่องานหลัก"); return }
    saveMutation.mutate()
  }

  const comments = taskData?.task?.comments || []

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-[#030013]/75 z-45 backdrop-blur-[10px] 
      transition-opacity duration-300 animate-fade-in" onClick={onClose} />

      {/* Centered Desktop Modal */}
      <div className="fixed inset-x-4 bottom-4 top-16 sm:inset-auto
      sm:top-auto sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full max-w-[480px] md:max-w-[850px] h-[calc(100vh-100px)] 
      sm:h-auto sm:max-h-[calc(100vh-120px)] glass-modal z-50 shadow-[0_25px_60px_rgba(0,0,0,0.6)] 
      flex flex-col animate-scale-up rounded-2xl md:rounded-3xl overflow-hidden border border-white/10">

      {/*"fixed inset-x-4 bottom-4 top-16 sm:inset-x-auto sm:top-[65px] sm:bottom-4 sm:left-1/2 sm:-translate-x-1/2 
      sm:translate-y-0 w-full max-w-[480px] md:max-w-[850px] h-[calc(100vh-100px)] sm:h-auto sm:max-h-[calc(100vh-80px)]*/}

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 
        flex-shrink-0 bg-[#120e32]/40 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)] animate-pulse" />
            <div>
              <h2 className="text-[15px] font-black text-white leading-none">
                {isEdit ? "รายละเอียดและแก้ไขงาน" : "สร้างงานใหม่เข้าระบบ"}
              </h2>
              {isEdit && taskData?.task && (
                <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-wide">
                  Task ID: {taskId?.slice(0, 8)}...
                </p>
              )}
            </div>
          </div>
          <button
            id="btn-close-modal"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all 
            cursor-pointer border border-transparent hover:border-white/5"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#09071a]/95">
          {taskLoading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 size={36} className="animate-spin text-purple-400" />
              <p className="text-slate-400 text-xs font-semibold tracking-wider">กำลังโหลดข้อมูลงานย่อย...</p>
            </div>
          )}

          {!taskLoading && (
            <div className="space-y-6">
              {error && (
                <div className="flex items-center gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 
                rounded-2xl text-red-300 text-xs font-semibold animate-shake">
                  <AlertCircle size={15} /> <span>{error}</span>
                </div>
              )}

              {/* Two Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">

                {/* Left Column - Core Input details */}
                <div className="md:col-span-3 space-y-5">
                  {/* Title */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      ชื่องานที่ต้องการบันทึก <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="task-title"
                      ref={titleRef}
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                      placeholder="เช่น ออกแบบ UI ระบบหน้าหลัก, แก้บั๊ก API..."
                      className="input w-full font-black text-sm py-3 border-white/10"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 
                    uppercase tracking-widest mb-1.5">รายละเอียดเพิ่มเติม</label>
                    <textarea
                      id="task-description"
                      value={form.description}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                      placeholder="ระบุคำอธิบายงาน หรือรายละเอียดความคืบหน้าที่สำคัญ..."
                      rows={4}
                      className="input w-full resize-none text-[12.5px] leading-relaxed py-2.5 border-white/10"
                    />
                  </div>

                  {/* Subtasks */}
                  <div className="space-y-3.5 border-t border-white/5 pt-4">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center gap-2">
                        <ListTodo size={13} className="text-purple-400" />
                        <span>งานย่อย (Subtasks Checklist)</span>
                      </span>
                    </label>

                    {subtasks.length > 0 && (
                      <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                        {subtasks.map((s, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-white/3 hover:bg-white/6 border border-white/5 
                          hover:border-white/10 rounded-2xl group transition-all duration-200">
                            <button
                              type="button"
                              onClick={() => handleToggleSubtask(s, i)}
                              className="text-slate-400 hover:text-emerald-400 transition-colors flex-shrink-0 cursor-pointer"
                            >
                              {s.isDone ? (
                                <CheckSquare size={17} className="text-emerald-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
                              ) : (
                                <Square size={17} />
                              )}
                            </button>
                            <span className={cn("text-xs font-semibold text-slate-200 flex-1 truncate", 
                              s.isDone && "line-through text-slate-500")}>
                              {s.title}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteSubtask(s, i)}
                              className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 
                              rounded-lg p-1 hover:bg-red-500/10 transition-all cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Subtask Input */}
                    <div className="flex gap-2">
                      <input
                        id="new-subtask-input"
                        type="text"
                        value={newSubtask}
                        onChange={(e) => setNewSubtask(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddSubtask() } }}
                        placeholder="ป้อนหัวข้องานย่อย..."
                        className="flex-1 input input-sm"
                      />
                      <button
                        type="button"
                        id="btn-add-subtask"
                        onClick={handleAddSubtask}
                        className="btn btn-secondary px-3.5 cursor-pointer rounded-xl"
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Comments Log (Only in Edit Mode) */}
                  {isEdit && (
                    <div className="space-y-4 border-t border-white/5 pt-4">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span className="flex items-center gap-2">
                          <MessageSquare size={13} className="text-purple-400" />
                          <span>การพูดคุยและอัปเดต ({comments.length})</span>
                        </span>
                      </label>

                      {/* Add Comment input */}
                      <form onSubmit={handleAddComment} className="flex gap-2">
                        <input
                          id="comment-input"
                          type="text"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="พิมพ์ข้อความความคิดเห็น..."
                          className="flex-1 input input-sm"
                        />
                        <button
                          type="submit"
                          id="btn-send-comment"
                          disabled={addCommentMutation.isPending || !newComment.trim()}
                          className="btn btn-primary btn-sm px-4 font-bold cursor-pointer rounded-xl"
                        >
                          {addCommentMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : "ส่ง"}
                        </button>
                      </form>

                      {/* Comments List */}
                      {comments.length > 0 ? (
                        <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                          {comments.map((c: {
                            id: string; content: string; createdAt: string; userId: string;
                            user: { id: string; name: string; image: string | null }
                          }) => (
                            <div key={c.id} className="p-3 bg-white/2 border border-white/5 rounded-2xl 
                            space-y-1.5 group transition-all">
                              <div className="flex items-center justify-between gap-2.5">
                                <div className="flex items-center gap-2">
                                  {/* Avatar */}
                                  <div className="w-5.5 h-5.5 rounded-full overflow-hidden bg-gradient-to-tr from-purple-500 
                                  to-indigo-600 flex items-center justify-center text-[9px] font-black text-white border 
                                  border-white/10 flex-shrink-0">
                                    {c.user?.image ? (
                                      <img src={c.user.image} alt={c.user.name} className="w-full h-full object-cover" />
                                    ) : (
                                      c.user?.name?.[0]?.toUpperCase() || "U"
                                    )}
                                  </div>
                                  <span className="text-[11.5px] font-bold text-slate-200">{c.user?.name}</span>
                                  <span className="text-[9.5px] text-slate-500 font-medium">{formatRelative(c.createdAt)}</span>
                                </div>
                                {/* Delete comment button */}
                                {(c.userId === currentUserId || taskData?.task?.userId === currentUserId) && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm("ต้องการลบคอมเมนต์นี้หรือไม่?")) {
                                        deleteCommentMutation.mutate(c.id)
                                      }
                                    }}
                                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 p-0.5 
                                    rounded transition-all cursor-pointer"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                )}
                              </div>
                              <p className="text-xs text-slate-300 pl-7 leading-relaxed font-semibold">
                                {c.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-5 text-slate-500 text-[11px] font-semibold border border-dashed 
                        border-white/5 rounded-2xl select-none">
                          ยังไม่มีความคิดเห็นในงานนี้
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Column - Sidebar Meta settings */}
                <div className="md:col-span-2 space-y-4 bg-[#0d0a21]/60 border border-white/5 rounded-2xl p-4.5">

                  {/* Status */}
                  <div>
                    <label className="block text-[9.5px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">สถานะงาน</label>
                    <select
                      id="task-status"
                      value={form.status}
                      onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as TaskStatus }))}
                      className="input font-semibold text-xs border-white/10"
                    >
                      {STATUSES.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-[9.5px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">ระดับความสำคัญ</label>
                    <select
                      id="task-priority"
                      value={form.priority}
                      onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as Priority }))}
                      className="input font-semibold text-xs border-white/10"
                    >
                      {PRIORITIES.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="block text-[9.5px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">กำหนดส่งงาน</label>
                    <div className="relative group">
                      <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 
                      group-focus-within:text-purple-400 pointer-events-none" />
                      <input
                        id="task-due-date"
                        type="date"
                        value={form.dueDate}
                        onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                        className="input pl-9 text-xs border-white/10"
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center select-none">
                      <label className="block text-[9.5px] font-bold text-slate-400 uppercase tracking-widest">หมวดหมู่</label>
                      <button
                        type="button"
                        onClick={() => setShowQuickCategory(!showQuickCategory)}
                        className="text-[9.5px] font-bold text-purple-400 hover:text-purple-300 flex items-center 
                        gap-0.5 cursor-pointer"
                      >
                        {showQuickCategory ? "ยกเลิก" : "+ สร้างด่วน"}
                      </button>
                    </div>

                    {showQuickCategory ? (
                      <div className="p-3 bg-white/2 border border-white/5 rounded-2xl space-y-3.5 animate-scale-up">
                        <input
                          type="text"
                          value={quickCategoryName}
                          onChange={(e) => setQuickCategoryName(e.target.value)}
                          placeholder="ชื่อหมวดหมู่..."
                          className="input input-sm border-white/10"
                        />
                        <div className="flex gap-1.5 flex-wrap">
                          {PRESET_COLORS.slice(0, 5).map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setQuickCategoryColor(color)}
                              className="w-5.5 h-5.5 rounded-full border flex items-center justify-center 
                              transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                              style={{ backgroundColor: color, borderColor: quickCategoryColor === color ? 
                                "#ffffff" : "transparent" }}
                            >
                              {quickCategoryColor === color && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          disabled={createCategoryMutation.isPending || !quickCategoryName.trim()}
                          onClick={() => createCategoryMutation.mutate()}
                          className="w-full btn btn-primary btn-sm font-bold cursor-pointer rounded-xl"
                        >
                          บันทึกหมวดหมู่
                        </button>
                      </div>
                    ) : (
                      <select
                        id="task-category"
                        value={form.categoryId}
                        onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                        className="input text-xs border-white/10"
                      >
                        <option value="">ไม่มีหมวดหมู่</option>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="space-y-1.5 border-t border-white/5 pt-3">
                    <div className="flex justify-between items-center select-none">
                      <label className="block text-[9.5px] font-bold text-slate-400 uppercase tracking-widest">แท็กป้ายกำกับ</label>
                      <button
                        type="button"
                        onClick={() => setShowQuickTag(!showQuickTag)}
                        className="text-[9.5px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-0.5 
                        cursor-pointer"
                      >
                        {showQuickTag ? "ยกเลิก" : "+ สร้างด่วน"}
                      </button>
                    </div>

                    {showQuickTag ? (
                      <div className="p-3 bg-white/2 border border-white/5 rounded-2xl space-y-3.5 animate-scale-up">
                        <input
                          type="text"
                          value={quickTagName}
                          onChange={(e) => setQuickTagName(e.target.value)}
                          placeholder="ชื่อแท็ก..."
                          className="input input-sm border-white/10"
                        />
                        <div className="flex gap-1.5 flex-wrap">
                          {PRESET_COLORS.slice(5, 10).map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setQuickTagColor(color)}
                              className="w-5.5 h-5.5 rounded-full border flex items-center justify-center 
                              transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                              style={{ backgroundColor: color, borderColor: quickTagColor === color ? 
                                "#ffffff" : "transparent" }}
                            >
                              {quickTagColor === color && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          disabled={createTagMutation.isPending || !quickTagName.trim()}
                          onClick={() => createTagMutation.mutate()}
                          className="w-full btn btn-primary btn-sm font-bold cursor-pointer rounded-xl"
                        >
                          บันทึกแท็ก
                        </button>
                      </div>
                    ) : (
                      tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1 py-1">
                          {tags.map((tag) => (
                            <button
                              key={tag.id}
                              type="button"
                              id={`tag-${tag.id}`}
                              onClick={() => toggleTag(tag.id)}
                              className={cn(
                                "px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all duration-200 cursor-pointer",
                                form.tagIds.includes(tag.id) ? "opacity-100 shadow-md" : "opacity-45 hover:opacity-75"
                              )}
                              style={form.tagIds.includes(tag.id)
                                ? { backgroundColor: `${tag.color}15`, borderColor: tag.color, color: tag.color }
                                : { borderColor: "rgba(255,255,255,0.08)", color: "#94a3b8" }
                              }
                            >
                              #{tag.name}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-500 font-semibold italic">ยังไม่มีรายการแท็กในระบบ</p>
                      )
                    )}
                  </div>

                  {/* Assignees */}
                  <div className="space-y-1.5 border-t border-white/5 pt-3">
                    <label className="block text-[9.5px] font-bold text-slate-400 uppercase tracking-widest">ผู้รับผิดชอบร่วม</label>

                    {assignees.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {assignees.map((user) => (
                          <span
                            key={user.id}
                            className="flex items-center gap-1.5 bg-purple-500/10 text-purple-300 text-[10.5px] 
                            font-bold px-2 py-0.5 rounded-full border border-purple-500/20"
                          >
                            <span className="w-4.5 h-4.5 bg-purple-500/20 rounded-full flex items-center justify-center 
                            text-[8px] font-black text-white">
                              {user.name?.[0]?.toUpperCase()}
                            </span>
                            <span className="max-w-[70px] truncate">{user.name}</span>
                            <button
                              type="button"
                              onClick={() => removeAssignee(user.id)}
                              className="text-purple-400 hover:text-red-400 transition-colors cursor-pointer"
                            >
                              <X size={10} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="relative group">
                      <User2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 
                      group-focus-within:text-purple-400 pointer-events-none" />
                      <input
                        id="assignee-search"
                        type="text"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        placeholder="พิมพ์เพื่อค้นหาชื่อ/อีเมล..."
                        className="w-full input input-sm pl-9 text-xs border-white/10"
                      />
                      {searchResults?.users?.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#0f0c29]/95 border border-white/15 
                        rounded-2xl shadow-2xl py-1 z-35 max-h-36 overflow-y-auto backdrop-blur-xl">
                          {searchResults.users.map((u: { id: string; name: string; email: string }) => (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => addAssignee(u)}
                              className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-white/5 transition-colors 
                              text-left cursor-pointer"
                            >
                              <div className="w-6.5 h-6.5 bg-purple-500/20 rounded-full flex items-center justify-center 
                              text-[9px] font-black text-purple-300 flex-shrink-0">
                                {u.name?.[0]?.toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-[12px] font-bold text-slate-200 truncate">{u.name}</p>
                                <p className="text-[9.5px] text-slate-500 truncate">{u.email}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-white/5 flex gap-3 flex-shrink-0 bg-[#120e32]/40 backdrop-blur-md">
          <button
            type="button"
            id="btn-cancel-modal"
            onClick={onClose}
            className="flex-1 btn btn-secondary py-2.5 font-bold text-xs cursor-pointer rounded-xl h-10.5"
          >
            ยกเลิก
          </button>
          <button
            id="btn-save-task"
            onClick={handleSubmit}
            disabled={saveMutation.isPending}
            className="flex-1 btn btn-primary py-2.5 font-bold text-xs cursor-pointer rounded-xl h-10.5 shadow-lg 
            shadow-purple-600/20 flex items-center justify-center gap-2"
          >
            {saveMutation.isPending ? (
              <><Loader2 size={14} className="animate-spin" /> <span>กำลังบันทึก...</span></>
            ) : (
              <><Save size={14} /> <span>{isEdit ? "บันทึกการแก้ไข" : "บันทึกงานใหม่"}</span></>
            )}
          </button>
        </div>
      </div>
    </>
  )
}
