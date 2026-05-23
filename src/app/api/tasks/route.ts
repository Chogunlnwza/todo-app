import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { TaskStatus, Priority } from "@prisma/client"

const createTaskSchema = z.object({
  title: z.string().min(1, "กรุณากรอกชื่องาน"),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).default("TODO"),
  priority: z.nativeEnum(Priority).default("MEDIUM"),
  dueDate: z.string().optional().nullable(),
  reminderAt: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  tagIds: z.array(z.string()).optional(),
  assigneeIds: z.array(z.string()).optional(),
  subtasks: z.array(z.object({ title: z.string() })).optional(),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const priority = searchParams.get("priority")
  const categoryId = searchParams.get("categoryId")
  const tagId = searchParams.get("tagId")
  const search = searchParams.get("search")
  const dueDateFrom = searchParams.get("dueDateFrom")
  const dueDateTo = searchParams.get("dueDateTo")
  const archived = searchParams.get("archived") === "true"
  const assignedToMe = searchParams.get("assignedToMe") === "true"

  const where: Record<string, unknown> = {
    isArchived: archived,
  }

  if (assignedToMe) {
    where.OR = [
      { userId: session.user.id },
      { assignees: { some: { userId: session.user.id } } },
    ]
  } else {
    where.userId = session.user.id
  }

  if (status && status !== "ALL") where.status = status as TaskStatus
  if (priority && priority !== "ALL") where.priority = priority as Priority
  if (categoryId) where.categoryId = categoryId
  if (tagId) where.tags = { some: { tagId } }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ]
  }
  if (dueDateFrom || dueDateTo) {
    where.dueDate = {}
    if (dueDateFrom) (where.dueDate as Record<string, unknown>).gte = new Date(dueDateFrom)
    if (dueDateTo) (where.dueDate as Record<string, unknown>).lte = new Date(dueDateTo)
  }

  const tasks = await prisma.task.findMany({
    where,
    include: {
      category: true,
      subtasks: { orderBy: { orderIndex: "asc" } },
      assignees: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
      tags: { include: { tag: true } },
      _count: { select: { comments: true } },
    },
    orderBy: [{ priority: "desc" }, { dueDate: "asc" }, { createdAt: "desc" }],
  })

  return NextResponse.json({ tasks })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const data = createTaskSchema.parse(body)

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        reminderAt: data.reminderAt ? new Date(data.reminderAt) : null,
        userId: session.user.id,
        categoryId: data.categoryId || null,
        subtasks: data.subtasks
          ? {
              create: data.subtasks.map((s, i) => ({ title: s.title, orderIndex: i })),
            }
          : undefined,
        assignees: data.assigneeIds
          ? { create: data.assigneeIds.map((uid) => ({ userId: uid })) }
          : undefined,
        tags: data.tagIds
          ? { create: data.tagIds.map((tid) => ({ tagId: tid })) }
          : undefined,
      },
      include: {
        category: true,
        subtasks: true,
        assignees: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
        tags: { include: { tag: true } },
      },
    })

    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error("Create task error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 })
  }
}
