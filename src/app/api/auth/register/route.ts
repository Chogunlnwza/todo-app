import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const registerSchema = z.object({
  name: z.string().min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร"),
  email: z.string().email("อีเมลไม่ถูกต้อง"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password } = registerSchema.parse(body)

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) {
      return NextResponse.json({ error: "อีเมลนี้ถูกใช้งานแล้ว" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: { id: true, name: true, email: true },
    })

    // Create default categories for new user
    await prisma.category.createMany({
      data: [
        { name: "งานส่วนตัว", color: "#6366f1", icon: "user", userId: user.id },
        { name: "งาน", color: "#f59e0b", icon: "briefcase", userId: user.id },
        { name: "ช้อปปิ้ง", color: "#10b981", icon: "shopping-cart", userId: user.id },
        { name: "สุขภาพ", color: "#ef4444", icon: "heart", userId: user.id },
      ],
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error("Register error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาด กรุณาลองใหม่" }, { status: 500 })
  }
}
