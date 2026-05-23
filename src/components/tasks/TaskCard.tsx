"use client"

import { cn, STATUS_LABELS, PRIORITY_LABELS, formatDate, isOverdue } from "@/lib/utils"
import {
  CheckCircle2, Circle, Clock, AlertCircle, XCircle,
  Calendar, Trash2, Edit3, MoreHorizontal, MessageSquare,
} from "lucide-react"
import { useState } from "react"

const STATUS_ICONS: Record<string, React.ReactNode> = {
  TODO: <Circle size={15} className="text-purple-400" />,
  IN_PROGRESS: <Clock size={15} className="text-blue-400 animate-pulse" />,
  IN_REVIEW: <AlertCircle size={15} className="text-amber-400" />,
  DONE: <CheckCircle2 size={15} className="text-emerald-400" />,
  CANCELLED: <XCircle size={15} className="text-red-400" />,
}

const STATUS_PILL: Record<string, string> = {
  TODO: "bg-purple-500/10 text-purple-300 border-purple-500/20",
  IN_PROGRESS: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  IN_REVIEW: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  DONE: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  CANCELLED: "bg-red-500/10 text-red-300 border-red-500/20",
}

const PRIORITY_DOT: Record<string, string> = {
  LOW: "#64748b",
  MEDIUM: "#3b82f6",
  HIGH: "#f97316",
  URGENT: "#ef4444",
}

const PRIORITY_PILL: Record<string, string> = {
  LOW: "bg-slate-500/10 text-slate-300 border-slate-500/20",
  MEDIUM: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  HIGH: "bg-orange-500/10 text-orange-300 border-orange-500/20",
  URGENT: "bg-red-500/10 text-red-300 border-red-500/20",
}

interface TaskCardProps {
  task: Record<string, unknown>
  onEdit: () => void
  onDelete: () => void
  onStatusChange: (status: string) => void
}

export function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)

  const status = task.status as string
  const priority = task.priority as string
  const dueDate = task.dueDate as string | null
  const overdue = dueDate && status !== "DONE" && status !== "CANCELLED" && isOverdue(dueDate)
  const category = task.category as { name: string; color: string } | null
  const assignees = (task.assignees as Array<{ user: { id: string; name: string; image: string | null } }>) || []
  const tags = (task.tags as Array<{ tag: { name: string; color: string } }>) || []
  const subtasks = (task.subtasks as Array<{ isDone: boolean }>) || []
  const done = subtasks.filter(s => s.isDone).length
  const commentCount = (task._count as { comments: number } | null)?.comments ?? 0

  return (
    <div
      onClick={onEdit}
      className={cn(
        "glass-panel glass-panel-hover p-4 group relative cursor-pointer select-none",
        overdue ? "border-red-500/30 bg-red-950/5 shadow-red-950/20" : ""
      )}
    >
      {/* Left indicator bar */}
      <div
        className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full shadow-glow"
        style={{
          backgroundColor: PRIORITY_DOT[priority],
          boxShadow: `0 0 10px ${PRIORITY_DOT[priority]}`
        }}
      />

      <div className="flex items-start gap-3.5 pl-1.5">
        {/* Status Dropdown/Toggle */}
        <div className="relative mt-0.5 flex-shrink-0">
          <button
            id={`btn-status-${task.id}`}
            onClick={(e) => {
              e.stopPropagation()
              setShowStatusMenu(v => !v)
            }}
            className="hover:scale-115 active:scale-95 transition-all duration-200"
          >
            {STATUS_ICONS[status]}
          </button>
          {showStatusMenu && (
            <>
              <div className="fixed inset-0 z-30" onClick={(e) => { e.stopPropagation(); setShowStatusMenu(false) }} />
              <div className="absolute left-0 top-6.5 w-44 bg-indigo-950/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/10 py-1.5 z-40 animate-scale-up">
                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                  <button
                    key={k}
                    onClick={(e) => {
                      e.stopPropagation()
                      onStatusChange(k)
                      setShowStatusMenu(false)
                    }}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3.5 py-2 text-[12.5px] text-left hover:bg-white/5 transition-all duration-200",
                      k === status ? "text-purple-400 font-extrabold bg-purple-500/10" : "text-slate-300"
                    )}
                  >
                    {STATUS_ICONS[k]}
                    <span>{v}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Content Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2.5 mb-1.5">
            <h3 className={cn(
              "text-[14px] font-bold text-slate-100 group-hover:text-purple-400 transition-colors leading-snug",
              status === "DONE" && "line-through text-slate-500 decoration-slate-600"
            )}>
              {task.title as string}
            </h3>
            {overdue && (
              <span className="badge bg-red-500/15 border-red-500/20 text-red-300 flex-shrink-0 animate-pulse text-[10px] font-bold uppercase py-0.5">
                ⚡ เกินกำหนด
              </span>
            )}
          </div>

          {/* Badges and tags list */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {/* Status badge */}
            <span className={cn("badge text-[10.5px] border py-0.5", STATUS_PILL[status])}>
              {STATUS_LABELS[status]}
            </span>

            {/* Priority badge */}
            <span className={cn("badge text-[10.5px] border py-0.5", PRIORITY_PILL[priority])}>
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: PRIORITY_DOT[priority], boxShadow: `0 0 6px ${PRIORITY_DOT[priority]}` }}
              />
              {PRIORITY_LABELS[priority]}
            </span>

            {/* Category badge */}
            {category && (
              <span className="badge text-[10.5px] bg-white/3 border-white/5 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: category.color }} />
                {category.name}
              </span>
            )}

            {/* Due date badge */}
            {dueDate && (
              <span className={cn("badge text-[10.5px] border py-0.5", overdue ? "bg-red-500/10 text-red-300 border-red-500/25" : "bg-white/3 border-white/5 text-slate-400")}>
                <Calendar size={11} className={overdue ? "text-red-400" : "text-purple-400"} />
                {formatDate(dueDate)}
              </span>
            )}

            {/* Tags list */}
            {tags.slice(0, 2).map(({ tag }) => (
              <span
                key={tag.name}
                className="badge text-[10.5px] border py-0.5"
                style={{ backgroundColor: `${tag.color}12`, borderColor: `${tag.color}25`, color: tag.color }}
              >
                #{tag.name}
              </span>
            ))}
            {tags.length > 2 && (
              <span className="text-[10px] text-slate-500 font-bold">+{tags.length - 2}</span>
            )}

            {/* Comments count */}
            {commentCount > 0 && (
              <span className="badge text-[10.5px] bg-white/3 border-white/5 text-slate-400">
                <MessageSquare size={11} className="text-indigo-400" />
                <span>{commentCount}</span>
              </span>
            )}

            {/* Subtasks fraction ratio */}
            {subtasks.length > 0 && (
              <span className="badge text-[10.5px] bg-white/3 border-white/5 text-slate-400">
                <CheckCircle2 size={11} className="text-emerald-400" />
                <span>{done}/{subtasks.length}</span>
              </span>
            )}
          </div>

          {/* Subtask micro progress bar */}
          {subtasks.length > 0 && (
            <div className="mt-3.5 h-1 bg-white/5 border border-white/5 rounded-full overflow-hidden w-28 flex">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                style={{ width: `${(done / subtasks.length) * 100}%` }}
              />
            </div>
          )}
        </div>

        {/* Right Section: Assignees and Options Menu */}
        <div className="flex items-center gap-2.5 flex-shrink-0 ml-1.5 self-center">
          {/* Assignee Avatars */}
          {assignees.length > 0 && (
            <div className="flex -space-x-2">
              {assignees.slice(0, 3).map(({ user }, i) => (
                <div
                  key={i}
                  className="w-6.5 h-6.5 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 border border-indigo-950 flex items-center justify-center text-[9px] font-black text-white shadow-md"
                  title={user.name}
                >
                  {user.name?.[0]?.toUpperCase()}
                </div>
              ))}
              {assignees.length > 3 && (
                <div className="w-6.5 h-6.5 rounded-full bg-slate-800 border border-indigo-950 flex items-center justify-center text-[9px] font-black text-slate-300 shadow-md">
                  +{assignees.length - 3}
                </div>
              )}
            </div>
          )}

          {/* Option Settings Icon */}
          <div className="relative opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
            <button
              id={`btn-menu-${task.id}`}
              onClick={(e) => {
                e.stopPropagation()
                setShowMenu(v => !v)
              }}
              className="w-7 h-7 text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5 rounded-lg flex items-center justify-center transition-all duration-200"
            >
              <MoreHorizontal size={14} />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={(e) => { e.stopPropagation(); setShowMenu(false) }} />
                <div className="absolute right-0 top-8 w-36 bg-indigo-950/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/10 py-1.5 z-40 animate-scale-up">
                  <button
                    id={`btn-edit-${task.id}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit()
                      setShowMenu(false)
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-[12.5px] text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Edit3 size={13} className="text-slate-400" /> แก้ไขงาน
                  </button>
                  <div className="h-px bg-white/5 my-1" />
                  <button
                    id={`btn-delete-${task.id}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm("คุณแน่ใจว่าต้องการลบงานนี้หรือไม่?")) {
                        onDelete()
                      }
                      setShowMenu(false)
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-[12.5px] text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 size={13} /> ลบงานทิ้ง
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
