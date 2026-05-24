import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { sendTaskAssignedEmail } from "@/lib/email"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const { email, name } = await req.json()

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "กรุณาระบุอีเมลที่ถูกต้อง" }, { status: 400 })
  }

  const task = await prisma.task.findFirst({
    where: {
      id,
      OR: [
        { userId: session.user.id },
        { assignees: { some: { userId: session.user.id } } },
      ],
    },
  })

  if (!task) return NextResponse.json({ error: "ไม่พบงาน" }, { status: 404 })

  try {
    await sendTaskAssignedEmail({
      toEmail: email,
      toName: name || email,
      taskTitle: task.title,
      assignedByName: session.user.name || "ผู้ดูแลระบบ",
      taskId: task.id,
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Send notify email error:", error)
    return NextResponse.json({ error: "ส่งอีเมลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" }, { status: 500 })
  }
}
