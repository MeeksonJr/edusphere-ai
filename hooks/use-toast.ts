"use client"

// Inspired by react-hot-toast library
import { useState, useEffect, useCallback, type ReactNode } from "react"

export type ToastProps = {
  id?: string
  title?: string
  description?: string
  action?: ReactNode
  variant?: "default" | "destructive"
}

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 5000

type ToasterToast = ToastProps & {
  id: string
  title?: string
  description?: string
  action?: ReactNode
}

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ToastActionType = (props: ToastProps) => void

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

export const useToast = () => {
  const [toasts, setToasts] = useState<ToasterToast[]>([])

  const dismiss = useCallback((toastId?: string) => {
    setToasts((toasts) => {
      if (toastId) {
        toastTimeouts.delete(toastId)
        return toasts.filter((t) => t.id !== toastId)
      }
      toastTimeouts.clear()
      return []
    })
  }, [])

  const toast: ToastActionType = useCallback(
    (props) => {
      const id = genId()
      const newToast = { ...props, id }

      setToasts((toasts) => {
        const nextToasts = [...toasts, newToast].slice(-TOAST_LIMIT)
        return nextToasts
      })

      const timeout = setTimeout(() => {
        dismiss(id)
      }, TOAST_REMOVE_DELAY)

      toastTimeouts.set(id, timeout)

      return id
    },
    [dismiss],
  )

  useEffect(() => {
    return () => {
      for (const timeout of toastTimeouts.values()) {
        clearTimeout(timeout)
      }
    }
  }, [])

  return {
    toast,
    dismiss,
    toasts,
  }
}
