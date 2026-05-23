import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { TaskStatus, Priority } from "@prisma/client"

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

  const { id } = await params
  const task = await prisma.task.findFirst({
    where: {
      id,
      OR: [
        { userId: session.user.id },
        { assignees: { some: { userId: session.user.id } } },
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

  const { id } = await params

  const task = await prisma.task.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!task) return NextResponse.json({ error: "ไม่พบงาน" }, { status: 404 })

  try {
    const body = await req.json()
    const data = updateTaskSchema.parse(body)

    const completedAt = data.status === "DONE" && task.status !== "DONE"
      ? new Date()
      : data.status !== "DONE"
      ? null
      : task.completedAt

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...( data.title !== undefined && { title: data.title }),
        ...( data.description !== undefined && { description: data.description }),
        ...( data.status !== undefined && { status: data.status, completedAt }),
        ...( data.priority !== undefined && { priority: data.priority }),
        ...( data.dueDate !== undefined && { dueDate: data.dueDate ? new Date(data.dueDate) : null }),
        ...( data.reminderAt !== undefined && { reminderAt: data.reminderAt ? new Date(data.reminderAt) : null }),
        ...( data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...( data.isArchived !== undefined && { isArchived: data.isArchived }),
        ...(data.tagIds !== undefined && {
          tags: {
            deleteMany: {},
            create: data.tagIds.map((tid) => ({ tagId: tid })),
          },
        }),
        ...(data.assigneeIds !== undefined && {
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

  const { id } = await params
  const task = await prisma.task.findFirst({ where: { id, userId: session.user.id } })
  if (!task) return NextResponse.json({ error: "ไม่พบงาน" }, { status: 404 })

  await prisma.task.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
