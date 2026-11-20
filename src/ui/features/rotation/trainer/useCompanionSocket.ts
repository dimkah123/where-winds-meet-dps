import { useEffect, useRef, useState, useCallback } from "react"
import type { TrainerInputEvent } from "./types"

const COMPANION_WS_URL = "ws://127.0.0.1:47999"

interface UseCompanionSocketOptions {
  onInput?: (event: TrainerInputEvent) => void
  enabled?: boolean
}

export function useCompanionSocket({ onInput, enabled = true }: UseCompanionSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [lastEvent, setLastEvent] = useState<TrainerInputEvent | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const onInputRef = useRef(onInput)
  onInputRef.current = onInput

  const connect = useCallback(() => {
    if (!enabled || typeof window === "undefined") return

    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return
    }

    try {
      const socket = new WebSocket(COMPANION_WS_URL)
      wsRef.current = socket

      socket.onopen = () => {
        setIsConnected(true)
      }

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data && data.type === "status") {
            if (typeof data.isAdmin === "boolean") {
              setIsAdmin(data.isAdmin)
            }
          } else if (data && data.type === "input") {
            const inputEvent = data as TrainerInputEvent
            setLastEvent(inputEvent)
            onInputRef.current?.(inputEvent)
          }
        } catch {
          // Ignored
        }
      }

      socket.onclose = () => {
        setIsConnected(false)
        setIsAdmin(null)
        wsRef.current = null
      }

      socket.onerror = () => {
        setIsConnected(false)
        setIsAdmin(null)
      }
    } catch {
      setIsConnected(false)
      setIsAdmin(null)
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled) {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      setIsConnected(false)
      return
    }

    connect()
    const timer = setInterval(() => {
      if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
        connect()
      }
    }, 3000)

    return () => {
      clearInterval(timer)
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [enabled, connect])

  return {
    isConnected,
    isAdmin,
    lastEvent,
    reconnect: connect,
  }
}
