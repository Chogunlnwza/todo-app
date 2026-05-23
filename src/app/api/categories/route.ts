import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const categorySchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อหมวดหมู่"),
  color: z.string().default("#6366f1"),
  icon: z.string().default("folder"),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const categories = await prisma.category.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { tasks: true } } },
    orderBy: { name: "asc" },
  })

  return NextResponse.json({ categories })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const data = categorySchema.parse(body)

    const category = await prisma.category.create({
      data: { ...data, userId: session.user.id },
      include: { _count: { select: { tasks: true } } },
    })

    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 })
  }
}
