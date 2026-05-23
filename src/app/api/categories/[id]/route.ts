import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const data = updateSchema.parse(body)

  const category = await prisma.category.update({
    where: { id, userId: session.user.id },
    data,
    include: { _count: { select: { tasks: true } } },
  })

  return NextResponse.json({ category })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  await prisma.category.delete({ where: { id, userId: session.user.id } })
  return NextResponse.json({ success: true })
}
