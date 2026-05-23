import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const commentSchema = z.object({
  content: z.string().min(1, "กรุณากรอกข้อความคอมเมนต์"),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: taskId } = await params

  try {
    const body = await req.json()
    const { content } = commentSchema.parse(body)

    const comment = await prisma.comment.create({
      data: {
        content,
        taskId,
        userId: session.user.id,
      },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    })

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error("Create comment error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการบันทึกคอมเมนต์" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: taskId } = await params
  const { searchParams } = new URL(req.url)
  const commentId = searchParams.get("commentId")

  if (!commentId) {
    return NextResponse.json({ error: "Missing commentId" }, { status: 400 })
  }

  try {
    // A user can delete a comment if they are the author of the comment
    // OR if they are the creator of the task where the comment was posted.
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { task: true },
    })

    if (!comment) {
      return NextResponse.json({ error: "ไม่พบข้อความคอมเมนต์" }, { status: 404 })
    }

    if (comment.userId !== session.user.id && comment.task.userId !== session.user.id) {
      return NextResponse.json({ error: "คุณไม่มีสิทธิ์ลบคอมเมนต์นี้" }, { status: 403 })
    }

    await prisma.comment.delete({
      where: { id: commentId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete comment error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการลบคอมเมนต์" }, { status: 500 })
  }
}
