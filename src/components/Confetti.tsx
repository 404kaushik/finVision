"use client"

import { useEffect, useRef } from "react"

type ConfettiProps = {
  active: boolean
  duration?: number
}

export default function Confetti({ active, duration = 3000 }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const confettiRef = useRef<any[]>([])
  const frameRef = useRef<number | null>(null)
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)


  useEffect(() => {
    if (active) {
      startConfetti()

      // Stop after duration
      timerRef.current = setTimeout(() => {
        stopConfetti()
      }, duration)
    } else {
      stopConfetti()
    }

    return () => {
      stopConfetti()
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [active, duration])

  const startConfetti = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas to full window size
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Create confetti particles
    const particles = []
    const particleCount = 150
    const colors = ["#3b82f6", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b", "#ef4444"]

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        size: Math.random() * 10 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: Math.random() * 3 + 2,
        angle: Math.random() * 6.28,
        spin: Math.random() * 0.2 - 0.1,
        shape: Math.random() > 0.5 ? "circle" : "rect",
      })
    }

    confettiRef.current = particles

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let i = 0; i < confettiRef.current.length; i++) {
        const p = confettiRef.current[i]

        ctx.beginPath()
        ctx.fillStyle = p.color

        if (p.shape === "circle") {
          ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2, false)
        } else {
          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate(p.angle)
          ctx.rect(-p.size / 2, -p.size / 2, p.size, p.size)
          ctx.restore()
        }

        ctx.fill()

        // Update position
        p.y += p.speed
        p.angle += p.spin

        // Reset if off screen
        if (p.y > canvas.height) {
          p.y = -p.size
          p.x = Math.random() * canvas.width
        }
      }

      frameRef.current = requestAnimationFrame(animate)
    }

    animate()
  }

  const stopConfetti = () => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current)
    }

    confettiRef.current = []

    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ display: active ? "block" : "none" }}
    />
  )
}
