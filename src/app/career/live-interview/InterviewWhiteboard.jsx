'use client'

import { useRef, useState, useEffect } from 'react'
import {
    FiEdit2, FiTrash2, FiDownload, FiCornerUpLeft,
    FiSquare, FiCircle, FiArrowRight, FiMinus, FiCloud,
    FiDatabase, FiXCircle
} from 'react-icons/fi'

const TOOLS = [
    { id: 'pen', icon: FiEdit2, label: 'Pen' },
    { id: 'eraser', icon: FiXCircle, label: 'Eraser' },
    { id: 'line', icon: FiMinus, label: 'Line' },
    { id: 'arrow', icon: FiArrowRight, label: 'Arrow' },
    { id: 'rect', icon: FiSquare, label: 'Rectangle' },
    { id: 'circle', icon: FiCircle, label: 'Circle' },
    { id: 'database', icon: FiDatabase, label: 'DB' },
    { id: 'cloud', icon: FiCloud, label: 'Cloud' },
]

const COLORS = [
    { id: '#000000', label: 'Black' },
    { id: '#ef4444', label: 'Red' },
    { id: '#3b82f6', label: 'Blue' },
    { id: '#22c55e', label: 'Green' },
    { id: '#a855f7', label: 'Purple' },
    { id: '#f97316', label: 'Orange' },
]

export default function InterviewWhiteboard() {
    const canvasRef = useRef(null)
    const containerRef = useRef(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [tool, setTool] = useState('pen')
    const [color, setColor] = useState('#000000')
    const [lineWidth, setLineWidth] = useState(2)
    const [snapshot, setSnapshot] = useState(null)
    const [history, setHistory] = useState([])
    const startPos = useRef({ x: 0, y: 0 })

    useEffect(() => {
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const handleResize = () => {
        if (!containerRef.current || !canvasRef.current) return
        const { width, height } = containerRef.current.getBoundingClientRect()
        if (width === 0 || height === 0) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        if (ctx && canvas.width > 0 && canvas.height > 0) {
            const tempCanvas = document.createElement('canvas')
            const tempCtx = tempCanvas.getContext('2d')
            if (tempCtx) {
                tempCanvas.width = canvas.width
                tempCanvas.height = canvas.height
                tempCtx.drawImage(canvas, 0, 0)
                canvas.width = width
                canvas.height = height
                ctx.drawImage(tempCanvas, 0, 0)
                ctx.lineCap = 'round'
                ctx.lineJoin = 'round'
            }
        } else {
            canvas.width = width
            canvas.height = height
            if (ctx) {
                ctx.lineCap = 'round'
                ctx.lineJoin = 'round'
            }
        }
    }

    const saveToHistory = () => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (canvas && ctx && canvas.width > 0 && canvas.height > 0) {
            setHistory(prev => [...prev.slice(-15), ctx.getImageData(0, 0, canvas.width, canvas.height)])
        }
    }

    const handleUndo = () => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (canvas && ctx && history.length > 0) {
            const previous = history[history.length - 1]
            ctx.putImageData(previous, 0, 0)
            setHistory(prev => prev.slice(0, -1))
        }
    }

    const onMouseDown = (e) => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!canvas || !ctx) return

        saveToHistory()
        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        startPos.current = { x, y }
        setIsDrawing(true)
        setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height))

        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color
        ctx.lineWidth = tool === 'eraser' ? 20 : lineWidth
    }

    const onMouseMove = (e) => {
        if (!isDrawing) return
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!canvas || !ctx || !snapshot) return

        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        if (tool === 'pen' || tool === 'eraser') {
            ctx.lineTo(x, y)
            ctx.stroke()
        } else {
            ctx.putImageData(snapshot, 0, 0)
            ctx.beginPath()
            ctx.strokeStyle = color
            ctx.lineWidth = lineWidth
            drawShape(ctx, startPos.current.x, startPos.current.y, x, y)
            ctx.stroke()
        }
    }

    const onMouseUp = () => setIsDrawing(false)

    const drawShape = (ctx, x1, y1, x2, y2) => {
        const w = x2 - x1
        const h = y2 - y1
        switch (tool) {
            case 'rect':
                ctx.rect(x1, y1, w, h)
                break
            case 'circle':
                ctx.ellipse(x1 + w / 2, y1 + h / 2, Math.abs(w / 2), Math.abs(h / 2), 0, 0, 2 * Math.PI)
                break
            case 'line':
                ctx.moveTo(x1, y1)
                ctx.lineTo(x2, y2)
                break
            case 'arrow':
                drawArrow(ctx, x1, y1, x2, y2)
                break
            case 'database':
                drawDatabase(ctx, x1, y1, w, h)
                break
            case 'cloud':
                drawCloud(ctx, x1, y1, w, h)
                break
        }
    }

    const drawArrow = (ctx, fromX, fromY, toX, toY) => {
        const headlen = 12
        const dx = toX - fromX
        const dy = toY - fromY
        const angle = Math.atan2(dy, dx)
        ctx.moveTo(fromX, fromY)
        ctx.lineTo(toX, toY)
        ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6))
        ctx.moveTo(toX, toY)
        ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6))
    }

    const drawDatabase = (ctx, x, y, w, h) => {
        const eh = h * 0.2
        ctx.ellipse(x + w / 2, y + eh / 2, Math.abs(w / 2), Math.abs(eh / 2), 0, 0, 2 * Math.PI)
        ctx.moveTo(x, y + eh / 2)
        ctx.lineTo(x, y + h - eh / 2)
        ctx.ellipse(x + w / 2, y + h - eh / 2, Math.abs(w / 2), Math.abs(eh / 2), 0, 0, Math.PI)
        ctx.lineTo(x + w, y + eh / 2)
    }

    const drawCloud = (ctx, x, y, w, h) => {
        ctx.moveTo(x, y + h / 2)
        ctx.bezierCurveTo(x, y, x + w / 2, y, x + w / 2, y + h / 2)
        ctx.bezierCurveTo(x + w, y, x + w, y + h, x + w / 2, y + h)
        ctx.bezierCurveTo(x, y + h, x, y + h / 2, x, y + h / 2)
    }

    const clearCanvas = () => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (canvas && ctx) {
            saveToHistory()
            ctx.clearRect(0, 0, canvas.width, canvas.height)
        }
    }

    const downloadCanvas = () => {
        const canvas = canvasRef.current
        if (canvas) {
            const link = document.createElement('a')
            link.download = 'whiteboard-diagram.png'
            link.href = canvas.toDataURL()
            link.click()
        }
    }

    const toolbarBtn = (active) => ({
        padding: 8, borderRadius: 8, border: 'none', cursor: 'pointer',
        background: active ? '#ede9fe' : 'transparent',
        color: active ? '#7c3aed' : '#6b7280',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s',
    })

    return (
        <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', overflow: 'hidden', borderRadius: 12 }}>
            {/* Toolbar */}
            <div style={{
                padding: '8px 12px', borderBottom: '1px solid #e5e7eb',
                display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6,
                background: '#fafafa',
            }}>
                {/* Tools */}
                <div style={{ display: 'flex', background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: 3 }}>
                    {TOOLS.map(t => {
                        const Icon = t.icon
                        return (
                            <button key={t.id} onClick={() => setTool(t.id)} style={toolbarBtn(tool === t.id)} title={t.label}>
                                <Icon size={18} />
                            </button>
                        )
                    })}
                </div>

                <div style={{ width: 1, height: 28, background: '#e5e7eb', margin: '0 4px' }} />

                {/* Colors */}
                <div style={{ display: 'flex', background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: '4px 6px', gap: 4 }}>
                    {COLORS.map(c => (
                        <button key={c.id} onClick={() => setColor(c.id)} title={c.label}
                            style={{
                                width: 22, height: 22, borderRadius: '50%',
                                border: color === c.id ? '2px solid #7c3aed' : '2px solid #e5e7eb',
                                background: c.id, cursor: 'pointer',
                                transform: color === c.id ? 'scale(1.15)' : 'scale(1)',
                                transition: 'all 0.15s', padding: 0,
                                boxShadow: color === c.id ? '0 0 0 2px #c4b5fd' : 'none',
                            }}
                        />
                    ))}
                </div>

                <div style={{ width: 1, height: 28, background: '#e5e7eb', margin: '0 4px' }} />

                {/* Actions */}
                <div style={{ display: 'flex', gap: 2 }}>
                    <button onClick={handleUndo} style={toolbarBtn(false)} title="Undo">
                        <FiCornerUpLeft size={18} />
                    </button>
                    <button onClick={clearCanvas} style={{ ...toolbarBtn(false), color: '#ef4444' }} title="Clear Board">
                        <FiTrash2 size={18} />
                    </button>
                    <button onClick={downloadCanvas} style={{ ...toolbarBtn(false), color: '#3b82f6' }} title="Download PNG">
                        <FiDownload size={18} />
                    </button>
                </div>
            </div>

            {/* Canvas */}
            <div style={{ flex: 1, position: 'relative', background: '#fff', cursor: 'crosshair', overflow: 'hidden' }}>
                {/* Grid */}
                <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.4,
                    backgroundImage: 'radial-gradient(#ccc 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                }} />
                <canvas
                    ref={canvasRef}
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                    onMouseLeave={onMouseUp}
                    style={{ touchAction: 'none' }}
                />
            </div>
        </div>
    )
}
