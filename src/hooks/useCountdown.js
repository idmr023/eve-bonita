import { useEffect, useState } from 'react'

export function useCountdown(targetDate) {
  const calc = () => {
    const now = new Date()
    const diff = targetDate - now
    if (diff <= 0) return { total: 0, d: 0, h: 0, m: 0, s: 0, done: true }
    const s = Math.floor(diff / 1000)
    return {
      total: diff,
      d: Math.floor(s / 86400),
      h: Math.floor((s % 86400) / 3600),
      m: Math.floor((s % 3600) / 60),
      s: s % 60,
      done: false,
    }
  }
  const [t, setT] = useState(calc)
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000)
    return () => clearInterval(id)
  }, [targetDate])
  return t
}
