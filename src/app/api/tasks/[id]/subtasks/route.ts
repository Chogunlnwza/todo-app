import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const subtaskSchema = z.object({
  title: z.string().min(1),
  isDone: z.boolean().optional(),
})

// PATCH /api/tasks/[id]/subtasks/[subtaskId]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: taskId } = await params
  const body = await req.json()
  const { subtaskId, isDone, title } = body

  const subtask = await prisma.subtask.findFirst({
    where: { id: subtaskId, taskId, task: { userId: session.user.id } },
  })
  if (!subtask) return NextResponse.json({ error: "ไม่พบงานย่อย" }, { status: 404 })

  const updated = await prisma.subtask.update({
    where: { id: subtaskId },
    data: {
      ...(isDone !== undefined && { isDone }),
      ...(title !== undefined && { title }),
    },
  })

  return NextResponse.json({ subtask: updated })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: taskId } = await params
  const body = await req.json()
  const { title } = subtaskSchema.parse(body)

  const count = await prisma.subtask.count({ where: { taskId } })
  const subtask = await prisma.subtask.create({
    data: { title, taskId, orderIndex: count },
  })

  return NextResponse.json({ subtask }, { status: 201 })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: taskId } = await params
  const { searchParams } = new URL(req.url)
  const subtaskId = searchParams.get("subtaskId")
  if (!subtaskId) return NextResponse.json({ error: "Missing subtaskId" }, { status: 400 })

  await prisma.subtask.deleteMany({
    where: { id: subtaskId, taskId, task: { userId: session.user.id } },
  })

  return NextResponse.json({ success: true })
}
