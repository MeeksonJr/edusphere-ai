"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"

interface SkillTreeGraphProps {
    allSkills: any[]
    userSkillMap: Map<string, any>
    categories: Map<string, any[]>
    onNodeClick: (skillId: string) => void
    actionLoading: string | null
}

const CATEGORY_COLORS: Record<string, string> = {
    programming: '#22d3ee', // cyan-400
    languages: '#34d399', // emerald-400
    science: '#c084fc', // purple-400
    mathematics: '#fbbf24', // amber-400
    business: '#60a5fa', // blue-400
    creative: '#f472b6', // pink-400
    engineering: '#94a3b8', // slate-400
    health: '#f87171', // red-400
    social_sciences: '#818cf8', // indigo-400
    other: '#9ca3af', // gray-400
}

export function SkillTreeGraph({ allSkills, userSkillMap, categories, onNodeClick, actionLoading }: SkillTreeGraphProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [dimensions, setDimensions] = useState({ width: 1000, height: 800 })
    const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 })
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

    useEffect(() => {
        if (containerRef.current) {
            const { width, height } = containerRef.current.getBoundingClientRect()
            setDimensions({ width: Math.max(width, 1000), height: Math.max(height, 800) })
        }
    }, [])

    // Generate extremely simple static layout for demonstration
    // Group by category, arrange categories in a circle, arrange skills within category
    const nodes: any[] = []
    const edges: any[] = []
    
    const catKeys = Array.from(categories.keys())
    const numCats = catKeys.length
    const radius = Math.min(dimensions.width, dimensions.height) * 0.35
    const centerX = dimensions.width / 2
    const centerY = dimensions.height / 2

    catKeys.forEach((cat, i) => {
        const catAngle = (i / numCats) * Math.PI * 2
        const catX = centerX + Math.cos(catAngle) * radius
        const catY = centerY + Math.sin(catAngle) * radius

        const skills = categories.get(cat) || []
        
        skills.forEach((skill, j) => {
            // Spread skills slightly around category center
            const skillAngle = catAngle + (j - skills.length / 2) * 0.15
            const distance = 80 + (j % 2) * 40
            
            const x = catX + Math.cos(skillAngle) * distance
            const y = catY + Math.sin(skillAngle) * distance

            nodes.push({
                ...skill,
                x,
                y,
                color: CATEGORY_COLORS[cat] || CATEGORY_COLORS.other
            })
        })
    })

    // Simulate some edges just connecting consecutive items within a category for visual effect
    // Since we don't have explicit dependencies in DB schema
    catKeys.forEach(cat => {
        const skills = categories.get(cat) || []
        for (let i = 0; i < skills.length - 1; i++) {
            const source = nodes.find(n => n.id === skills[i].id)
            const target = nodes.find(n => n.id === skills[i+1].id)
            if (source && target) {
                edges.push({ source, target })
            }
        }
    })

    // Drag, pan, zoom logic
    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault()
        const scaleBy = 1.1
        const newScale = e.deltaY < 0 ? transform.scale * scaleBy : transform.scale / scaleBy
        setTransform(prev => ({ ...prev, scale: Math.max(0.1, Math.min(newScale, 5)) }))
    }

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true)
        setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y })
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return
        setTransform(prev => ({
            ...prev,
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        }))
    }

    const handleMouseUp = () => setIsDragging(false)

    return (
        <div 
            ref={containerRef}
            className="w-full h-[600px] bg-gray-900/40 rounded-2xl border border-gray-800 overflow-hidden relative cursor-grab active:cursor-grabbing backdrop-blur-md"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <div className="absolute top-4 right-4 bg-gray-800/80 p-2 rounded-lg text-xs text-gray-400 z-10 border border-gray-700 backdrop-blur-md shadow-xl">
                Scroll to zoom | Click & drag to pan
            </div>

            <svg 
                width="100%" 
                height="100%" 
                style={{ 
                    transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                    transformOrigin: '0 0'
                }}
            >
                {/* Edges */}
                {edges.map((edge, i) => (
                    <line 
                        key={`edge-${i}`}
                        x1={edge.source.x} 
                        y1={edge.source.y} 
                        x2={edge.target.x} 
                        y2={edge.target.y} 
                        stroke="rgba(255,255,255,0.1)" 
                        strokeWidth={2}
                        strokeDasharray="4 4"
                    />
                ))}

                {/* Nodes */}
                {nodes.map(node => {
                    const progress = userSkillMap.get(node.id)
                    const isActive = !!progress
                    const level = progress?.level || 0
                    const size = isActive ? 30 + Math.min(level * 2, 20) : 20
                    const isHovered = false // Simplified for static SVG
                    
                    return (
                        <g 
                            key={node.id} 
                            transform={`translate(${node.x}, ${node.y})`}
                            onClick={(e) => {
                                e.stopPropagation()
                                onNodeClick(node.id)
                            }}
                            className="cursor-pointer transition-transform hover:scale-110 group"
                        >
                            {/* Inner circle */}
                            <circle 
                                r={size}
                                fill={isActive ? `${node.color}30` : '#1f2937'}
                                stroke={isActive ? node.color : '#374151'}
                                strokeWidth={isActive ? 3 : 2}
                                className="transition-all duration-300"
                            />
                            
                            {/* Glow effect if active */}
                            {isActive && (
                                <circle 
                                    r={size + 5}
                                    fill="none"
                                    stroke={node.color}
                                    strokeWidth={1}
                                    opacity={0.3}
                                    className="animate-pulse"
                                />
                            )}

                            {/* Icon */}
                            <text 
                                textAnchor="middle" 
                                dominantBaseline="central"
                                fontSize={size * 0.7}
                            >
                                {node.icon}
                            </text>

                            {/* Label */}
                            <text 
                                y={size + 15}
                                textAnchor="middle"
                                fill="#e5e7eb"
                                fontSize={12}
                                fontWeight="500"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{
                                    textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                                }}
                            >
                                {node.name}
                            </text>
                            
                            {/* Level badge if active */}
                            {isActive && (
                                <g transform={`translate(${size * 0.7}, -${size * 0.7})`} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <circle r={10} fill="#111827" stroke={node.color} strokeWidth={1} />
                                    <text textAnchor="middle" dominantBaseline="central" fontSize={10} fill={node.color} fontWeight="bold">
                                        L{level}
                                    </text>
                                </g>
                            )}

                            {actionLoading === node.id && (
                                <circle 
                                    r={size + 8}
                                    fill="none"
                                    stroke="#fff"
                                    strokeWidth={2}
                                    strokeDasharray="4 8"
                                    className="animate-spin"
                                    style={{ transformOrigin: 'center' }}
                                />
                            )}
                        </g>
                    )
                })}
            </svg>
        </div>
    )
}
