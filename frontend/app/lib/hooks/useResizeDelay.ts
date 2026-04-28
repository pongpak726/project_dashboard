import { useEffect, useState, useRef } from "react"

export function useResizeDelay(delay = 350) {
  const [key, setKey] = useState(0)
  const [stable, setStable] = useState(true)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      setStable(false)

      if (timerRef.current) clearTimeout(timerRef.current)

      timerRef.current = setTimeout(() => {
        setKey(k => k + 1)
        setStable(true)
      }, delay)
    })

    const el = document.getElementById("main-content")
    if (el) observer.observe(el)

    return () => {
      observer.disconnect()
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [delay])

  return { key, stable }
}