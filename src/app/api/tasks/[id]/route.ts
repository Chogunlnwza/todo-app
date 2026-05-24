import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { TaskStatus, Priority } from "@prisma/client"
import { sendTaskAssignedEmail } from "@/lib/email"

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  dueDate: z.string().optional().nullable(),
  reminderAt: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  isArchived: z.boolean().optional(),
  tagIds: z.array(z.string()).optional(),
  assigneeIds: z.array(z.string()).optional(),
})

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = session.user.id as string
  const { id } = await params

  const task = await prisma.task.findFirst({
    where: {
      id,
      OR: [
        { userId },
        { assignees: { some: { userId } } },
      ],
    },
    include: {
      category: true,
      subtasks: { orderBy: { orderIndex: "asc" } },
      assignees: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
      tags: { include: { tag: true } },
      comments: {
        include: { user: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  })

  if (!task) return NextResponse.json({ error: "ไม่พบงาน" }, { status: 404 })
  return NextResponse.json({ task })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = session.user.id as string
  const userName = session.user.name as string | null
  const { id } = await params

  // อนุญาตทั้งเจ้าของงานและ assignee ให้แก้ไขได้
  const task = await prisma.task.findFirst({
    where: {
      id,
      OR: [
        { userId },
        { assignees: { some: { userId } } },
      ],
    },
  })
  if (!task) return NextResponse.json({ error: "ไม่พบงาน" }, { status: 404 })

  const isOwner = task.userId === userId

  try {
    const body = await req.json()
    const data = updateTaskSchema.parse(body)

    // assignee แก้ได้แค่ status กับ subtasks (ไม่ใช่เจ้าของ)
    const allowedData = isOwner ? data : {
      status: data.status,
    }

    const completedAt = allowedData.status === "DONE" && task.status !== "DONE"
      ? new Date()
      : allowedData.status !== "DONE"
      ? null
      : task.completedAt

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...( allowedData.status !== undefined && { status: allowedData.status, completedAt }),
        ...( isOwner && data.title !== undefined && { title: data.title }),
        ...( isOwner && data.description !== undefined && { description: data.description }),
        ...( isOwner && data.priority !== undefined && { priority: data.priority }),
        ...( isOwner && data.dueDate !== undefined && { dueDate: data.dueDate ? new Date(data.dueDate) : null }),
        ...( isOwner && data.reminderAt !== undefined && { reminderAt: data.reminderAt ? new Date(data.reminderAt) : null }),
        ...( isOwner && data.categoryId !== undefined && { categoryId: data.categoryId || null }),
        ...( isOwner && data.isArchived !== undefined && { isArchived: data.isArchived }),
        ...( isOwner && data.tagIds !== undefined && {
          tags: {
            deleteMany: {},
            create: data.tagIds.filter((t) => t !== "").map((tid) => ({ tagId: tid })),
          },
        }),
        ...( isOwner && data.assigneeIds !== undefined && {
          assignees: {
            deleteMany: {},
            create: data.assigneeIds.map((uid) => ({ userId: uid })),
          },
        }),
      },
      include: {
        category: true,
        subtasks: { orderBy: { orderIndex: "asc" } },
        assignees: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
        tags: { include: { tag: true } },
      },
    })

    // ── ส่งอีเมลแจ้งเตือนเมื่อมีการ assign งาน (เฉพาะเจ้าของ) ──
    if (isOwner && data.assigneeIds && data.assigneeIds.length > 0) {
      const newAssignees = await prisma.user.findMany({
        where: { id: { in: data.assigneeIds } },
        select: { id: true, name: true, email: true },
      })

      await Promise.allSettled(
        newAssignees
          .filter((u) => u.id !== userId)
          .map((u) =>
            sendTaskAssignedEmail({
              toEmail: u.email!,
              toName: u.name || "ผู้ใช้งาน",
              taskTitle: updatedTask.title,
              assignedByName: userName || "ผู้ดูแลระบบ",
              taskId: updatedTask.id,
            })
          )
      )
    }

    return NextResponse.json({ task: updatedTask })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error("Update task error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = session.user.id as string
  const { id } = await params

  // ลบได้แค่เจ้าของงานเท่านั้น
  const task = await prisma.task.findFirst({ where: { id, userId } })
  if (!task) return NextResponse.json({ error: "ไม่พบงาน" }, { status: 404 })

  await prisma.task.delete({ where: { id } })
  return NextResponse.json({ success: true })
}