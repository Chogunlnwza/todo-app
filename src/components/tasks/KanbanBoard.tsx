"use client"

import { cn, STATUS_LABELS } from "@/lib/utils"
import { TaskCard } from "./TaskCard"
import { Circle, Clock, AlertCircle, CheckCircle2, XCircle } from "lucide-react"
import { DndContext, useSensor, useSensors, PointerSensor, useDroppable, useDraggable, DragEndEvent } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"

const COLUMNS = [
  { key: "TODO", icon: <Circle size={13} className="text-purple-400" />, color: "border-purple-500/20", dot: "bg-purple-500", glow: "shadow-purple-500/10" },
  { key: "IN_PROGRESS", icon: <Clock size={13} className="text-blue-400" />, color: "border-blue-500/20", dot: "bg-blue-500", glow: "shadow-blue-500/10" },
  { key: "IN_REVIEW", icon: <AlertCircle size={13} className="text-amber-400" />, color: "border-amber-500/20", dot: "bg-amber-500", glow: "shadow-amber-500/10" },
  { key: "DONE", icon: <CheckCircle2 size={13} className="text-emerald-400" />, color: "border-emerald-500/20", dot: "bg-emerald-500", glow: "shadow-emerald-500/10" },
  { key: "CANCELLED", icon: <XCircle size={13} className="text-red-400" />, color: "border-red-500/20", dot: "bg-red-500", glow: "shadow-red-500/10" },
]

interface KanbanBoardProps {
  tasks: Record<string, unknown>[]
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: string) => void
}

export function KanbanBoard({ tasks, onEdit, onDelete, onStatusChange }: KanbanBoardProps) {
  const byStatus: Record<string, Record<string, unknown>[]> = {}
  COLUMNS.forEach(c => { byStatus[c.key] = tasks.filter(t => t.status === c.key) })

  // Define sensors to allow clicking menu items / buttons inside cards without starting drag
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Drag starts only after moving 8px
      },
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const taskId = active.id as string
    const targetStatus = over.id as string

    const task = tasks.find(t => t.id === taskId)
    if (task && task.status !== targetStatus) {
      onStatusChange(taskId, targetStatus)
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-6 min-h-[550px] -mx-4 px-4 sm:-mx-0.5 sm:px-0.5 snap-x snap-mandatory scroll-smooth">
        {COLUMNS.map(col => {
          const colTasks = byStatus[col.key] || []
          return (
            <div
              key={col.key}
              className={cn(
                "flex-shrink-0 w-[85vw] sm:w-[290px] bg-white/2 rounded-2xl border flex flex-col snap-center shadow-lg",
                col.color,
                col.glow
              )}
            >
              {/* Column Header */}
              <div className="px-4.5 py-3.5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {col.icon}
                  <span className="text-[12.5px] font-extrabold text-slate-200 tracking-wide uppercase">{STATUS_LABELS[col.key]}</span>
                </div>
                <div className={cn(
                  "text-[10px] font-black text-white px-2.5 py-0.5 rounded-full min-w-[22px] text-center shadow-md",
                  col.dot
                )}>
                  {colTasks.length}
                </div>
              </div>

              {/* Droppable Columns Area */}
              <DroppableColumn status={col.key}>
                {colTasks.map(task => (
                  <DraggableTaskCard
                    key={task.id as string}
                    task={task}
                    onEdit={() => onEdit(task.id as string)}
                    onDelete={() => onDelete(task.id as string)}
                    onStatusChange={status => onStatusChange(task.id as string, status)}
                  />
                ))}
                {colTasks.length === 0 && (
                  <div className="text-center py-12 text-slate-500 text-[12px] font-bold select-none border border-dashed border-white/3 rounded-xl">
                    ว่างเปล่า 
                  </div>
                )}
              </DroppableColumn>
            </div>
          )
        })}
      </div>
    </DndContext>
  )
}

/* ─── Droppable Column Wrapper Component ─── */
function DroppableColumn({ status, children }: { status: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex-1 p-2.5 space-y-2.5 overflow-y-auto transition-colors duration-200 rounded-b-2xl min-h-[300px]",
        isOver ? "bg-purple-500/5" : "bg-transparent"
      )}
    >
      {children}
    </div>
  )
}

/* ─── Draggable Card Wrapper Component ─── */
function DraggableTaskCard({
  task, onEdit, onDelete, onStatusChange
}: {
  task: Record<string, unknown>
  onEdit: () => void
  onDelete: () => void
  onStatusChange: (status: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id as string,
  })

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.35 : undefined,
    zIndex: isDragging ? 50 : undefined,
    touchAction: "none",
  }

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="active:cursor-grabbing">
      <TaskCard
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
        onStatusChange={onStatusChange}
      />
    </div>
  )
}
