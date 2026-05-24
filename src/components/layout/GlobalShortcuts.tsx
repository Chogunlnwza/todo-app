"use client"

import { useEffect, useState, useCallback } from "react"
import { useQuery } from "@tanstack/react-query"
import { TaskModal } from "@/components/tasks/TaskModal"

export function GlobalShortcuts() {
  const [showModal, setShowModal] = useState(false)

  const { data: catData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await fetch("/api/categories")).json(),
    enabled: showModal,
  })
  const { data: tagData } = useQuery({
    queryKey: ["tags"],
    queryFn: async () => (await fetch("/api/tags")).json(),
    enabled: showModal,
  })

  const handleKey = useCallback((e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement).tagName
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return
    // Don't open if a modal is already open
    if (document.querySelector("[data-modal-open]")) return

    if (e.key === "c" || e.key === "C" || e.key === "แ" || e.key === "ฉ") {
      e.preventDefault()
      setShowModal(true)
    }
    if (e.key === "Escape") {
      setShowModal(false)
    }
  }, [])

  useEffect(() => {
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [handleKey])

  if (!showModal) return null

  return (
    <TaskModal
      taskId={null}
      onClose={() => setShowModal(false)}
      categories={catData?.categories || []}
      tags={tagData?.tags || []}
    />
  )
}
