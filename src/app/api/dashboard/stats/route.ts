import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { startOfDay, endOfDay, addDays, startOfWeek, endOfWeek } from "date-fns"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = session.user.id
  const now = new Date()
  const todayStart = startOfDay(now)
  const todayEnd = endOfDay(now)
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
  const next7Days = addDays(now, 7)

  const [
    totalTasks,
    completedToday,
    overdueTasks,
    inProgressTasks,
    tasksByStatus,
    tasksByPriority,
    tasksByCategory,
    upcomingTasks,
    completedThisWeek,
  ] = await Promise.all([
    prisma.task.count({ where: { userId, isArchived: false } }),
    prisma.task.count({
      where: {
        userId,
        status: "DONE",
        completedAt: { gte: todayStart, lte: todayEnd },
      },
    }),
    prisma.task.count({
      where: {
        userId,
        isArchived: false,
        status: { notIn: ["DONE", "CANCELLED"] },
        dueDate: { lt: now },
      },
    }),
    prisma.task.count({
      where: { userId, status: "IN_PROGRESS", isArchived: false },
    }),
    prisma.task.groupBy({
      by: ["status"],
      where: { userId, isArchived: false },
      _count: { status: true },
    }),
    prisma.task.groupBy({
      by: ["priority"],
      where: { userId, isArchived: false, status: { notIn: ["DONE", "CANCELLED"] } },
      _count: { priority: true },
    }),
    prisma.category.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            tasks: { where: { isArchived: false, status: { notIn: ["DONE", "CANCELLED"] } } },
          },
        },
      },
    }),
    prisma.task.findMany({
      where: {
        userId,
        isArchived: false,
        status: { notIn: ["DONE", "CANCELLED"] },
        dueDate: { gte: now, lte: next7Days },
      },
      include: { category: true },
      orderBy: { dueDate: "asc" },
      take: 8,
    }),
    prisma.task.count({
      where: {
        userId,
        status: "DONE",
        completedAt: { gte: weekStart, lte: weekEnd },
      },
    }),
  ])

  return NextResponse.json({
    stats: {
      totalTasks,
      completedToday,
      overdueTasks,
      inProgressTasks,
      completedThisWeek,
    },
    tasksByStatus: tasksByStatus.map((t) => ({
      status: t.status,
      count: t._count.status,
    })),
    tasksByPriority: tasksByPriority.map((t) => ({
      priority: t.priority,
      count: t._count.priority,
    })),
    tasksByCategory: tasksByCategory.map((c) => ({
      id: c.id,
      name: c.name,
      color: c.color,
      count: c._count.tasks,
    })),
    upcomingTasks,
  })
}
