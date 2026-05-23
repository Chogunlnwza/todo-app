import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow, isToday, isTomorrow, isPast } from "date-fns"
import { th } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return ""
  const d = new Date(date)
  if (isToday(d)) return "วันนี้"
  if (isTomorrow(d)) return "พรุ่งนี้"
  return format(d, "d MMM yyyy", { locale: th })
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return ""
  const d = new Date(date)
  return format(d, "d MMM yyyy HH:mm", { locale: th })
}

export function formatRelative(date: Date | string | null | undefined): string {
  if (!date) return ""
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: th })
}

export function isOverdue(date: Date | string | null | undefined): boolean {
  if (!date) return false
  return isPast(new Date(date))
}

export const STATUS_LABELS: Record<string, string> = {
  TODO: "รอดำเนินการ",
  IN_PROGRESS: "กำลังทำ",
  IN_REVIEW: "รอตรวจสอบ",
  DONE: "เสร็จแล้ว",
  CANCELLED: "ยกเลิก",
}

export const STATUS_COLORS: Record<string, string> = {
  TODO: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  IN_PROGRESS: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  IN_REVIEW: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  DONE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  CANCELLED: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300",
}

export const PRIORITY_LABELS: Record<string, string> = {
  LOW: "ต่ำ",
  MEDIUM: "ปานกลาง",
  HIGH: "สูง",
  URGENT: "เร่งด่วน",
}

export const PRIORITY_COLORS: Record<string, string> = {
  LOW: "text-slate-500",
  MEDIUM: "text-blue-500",
  HIGH: "text-orange-500",
  URGENT: "text-red-500",
}

export const PRIORITY_BG: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  MEDIUM: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  HIGH: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  URGENT: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
}
