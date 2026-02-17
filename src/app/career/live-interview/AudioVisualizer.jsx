'use client'

import { useEffect, useRef } from 'react'

export default function AudioVisualizer({ analyser, isActive, color = '#7c3aed' }) {
    const canvasRef = useRef(null)

    useEffect(() => {
        if (!canvasRef.current || !analyser || !isActive) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const bufferLength = analyser.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)
        let animationId

        const draw = () => {
            animationId = requestAnimationFrame(draw)
            analyser.getByteFrequencyData(dataArray)
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            const barWidth = (canvas.width / bufferLength) * 2.5
            let x = 0

            for (let i = 0; i < bufferLength; i++) {
                const barHeight = dataArray[i] / 2
                ctx.fillStyle = color
                ctx.shadowBlur = 10
                ctx.shadowColor = color
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)
                x += barWidth + 1
            }
        }

        draw()

        return () => {
            cancelAnimationFrame(animationId)
            if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
        }
    }, [analyser, isActive, color])

    return (
        <canvas
            ref={canvasRef}
            width={300}
            height={100}
            className="w-full h-full rounded-lg"
            style={{ width: '100%', height: '100%', borderRadius: '0.75rem' }}
        />
    )
}
