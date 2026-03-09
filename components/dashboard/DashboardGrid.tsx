"use client"

import React, { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { GripHorizontal } from "lucide-react"
import { useSupabase } from "@/components/supabase-provider"

export interface WidgetContent {
  id: string
  content: React.ReactNode
}

interface DashboardGridProps {
  userId: string
  initialWidgets: WidgetContent[]
}

export function DashboardGrid({ userId, initialWidgets }: DashboardGridProps) {
  // We use two columns for the dashboard grid
  // col-main (left, 2/3 width) and col-sidebar (right, 1/3 width)
  const [columns, setColumns] = useState<{ [key: string]: WidgetContent[] }>({
    "col-main": [],
    "col-sidebar": [],
  })
  
  const [isMounted, setIsMounted] = useState(false)
  const { supabase } = useSupabase()

  useEffect(() => {
    setIsMounted(true)
    
    // Attempt to load layout from Supabase
    const loadLayout = async () => {
      if (!supabase) return;

      const { data, error } = await supabase
        .from("user_dashboard_preferences")
        .select("layout_config")
        .eq("user_id", userId)
        .single()

      if (data && data.layout_config && !error) {
        const config = data.layout_config as { main: string[]; sidebar: string[] }
        
        // Reconstruct columns from saved config
        if (config.main && config.sidebar) {
          const mainWidgets = config.main
            .map(id => initialWidgets.find(w => w.id === id))
            .filter(Boolean) as WidgetContent[]
            
          const sidebarWidgets = config.sidebar
            .map(id => initialWidgets.find(w => w.id === id))
            .filter(Boolean) as WidgetContent[]
            
          // Find any widgets that aren't in the config (new features added later)
          const configuredIds = new Set([...config.main, ...config.sidebar])
          const unconfiguredWidgets = initialWidgets.filter(w => !configuredIds.has(w.id))
          
          setColumns({
            "col-main": [...mainWidgets, ...unconfiguredWidgets],
            "col-sidebar": sidebarWidgets
          })
          return
        }
      }
      
      // Default Layout if no config found
      const mainIds = ["stats", "recent-courses", "achievements"]
      const sidebarIds = ["up-next", "streak", "daily-goals", "quick-actions", "upcoming"]
      
      const mainWidgets = initialWidgets.filter(w => mainIds.includes(w.id))
      const sidebarWidgets = initialWidgets.filter(w => sidebarIds.includes(w.id) || (!mainIds.includes(w.id) && !sidebarIds.includes(w.id)))
      
      setColumns({
        "col-main": mainWidgets,
        "col-sidebar": sidebarWidgets
      })
    }
    
    loadLayout()
  }, [initialWidgets, userId, supabase])

  const saveLayout = async (newColumns: { [key: string]: WidgetContent[] }) => {
    if (!supabase) return;

    const layout_config = {
      main: newColumns["col-main"].map(w => w.id),
      sidebar: newColumns["col-sidebar"].map(w => w.id)
    }

    await supabase.from("user_dashboard_preferences").upsert({
      user_id: userId,
      layout_config
    })
  }

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const { source, destination } = result

    if (source.droppableId === destination.droppableId) {
      // Reordering within the same column
      const column = columns[source.droppableId]
      const copiedItems = [...column]
      const [removed] = copiedItems.splice(source.index, 1)
      copiedItems.splice(destination.index, 0, removed)
      
      const newColumns = {
        ...columns,
        [source.droppableId]: copiedItems
      }
      setColumns(newColumns)
      saveLayout(newColumns)
    } else {
      // Moving between columns
      const sourceColumn = columns[source.droppableId]
      const destColumn = columns[destination.droppableId]
      const sourceItems = [...sourceColumn]
      const destItems = [...destColumn]
      const [removed] = sourceItems.splice(source.index, 1)
      destItems.splice(destination.index, 0, removed)
      
      const newColumns = {
        ...columns,
        [source.droppableId]: sourceItems,
        [destination.droppableId]: destItems
      }
      setColumns(newColumns)
      saveLayout(newColumns)
    }
  }

  // Prevent SSR hydration mismatch for drag and drop context
  if (!isMounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 opacity-50">
         <div className="lg:col-span-2 space-y-8">
            {initialWidgets.slice(0, 3).map(w => <div key={w.id}>{w.content}</div>)}
         </div>
         <div className="space-y-6">
            {initialWidgets.slice(3).map(w => <div key={w.id}>{w.content}</div>)}
         </div>
      </div>
    )
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Column */}
        <Droppable droppableId="col-main">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`lg:col-span-2 space-y-8 min-h-[500px] p-2 -m-2 rounded-xl transition-colors ${
                snapshot.isDraggingOver ? "bg-white/5 border border-white/10" : ""
              }`}
            >
              {columns["col-main"].map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`relative group ${snapshot.isDragging ? "z-50 ring-2 ring-cyan-500 rounded-2xl" : ""}`}
                      style={provided.draggableProps.style}
                    >
                      <div
                        {...provided.dragHandleProps}
                        className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab hover:bg-white/10 p-1.5 rounded-md"
                      >
                        <GripHorizontal className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="bg-transparent rounded-2xl">
                        {item.content}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        {/* Sidebar Column */}
        <Droppable droppableId="col-sidebar">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`space-y-6 min-h-[500px] p-2 -m-2 rounded-xl transition-colors ${
                snapshot.isDraggingOver ? "bg-white/5 border border-white/10" : ""
              }`}
            >
              {columns["col-sidebar"].map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`relative group ${snapshot.isDragging ? "z-50 ring-2 ring-cyan-500 rounded-2xl" : ""}`}
                      style={provided.draggableProps.style}
                    >
                      <div
                        {...provided.dragHandleProps}
                        className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab hover:bg-white/10 p-1.5 rounded-md"
                      >
                        <GripHorizontal className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="bg-transparent rounded-2xl">
                        {item.content}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

      </div>
    </DragDropContext>
  )
}
