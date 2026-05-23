import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const tagSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อแท็ก"),
  color: z.string().default("#8b5cf6"),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const tags = await prisma.tag.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { tasks: true } } },
    orderBy: { name: "asc" },
  })

  return NextResponse.json({ tags })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const data = tagSchema.parse(body)

    const tag = await prisma.tag.create({
      data: { ...data, userId: session.user.id },
    })

    return NextResponse.json({ tag }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  await prisma.tag.delete({ where: { id, userId: session.user.id } })
  return NextResponse.json({ success: true })
}
