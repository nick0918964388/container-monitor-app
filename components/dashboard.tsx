'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Menu, Bell, Settings, LogOut, Search, Maximize2, Minimize2, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

// Reusable components
const Stat = ({ title, value, change }: { title: string; value: string; change: string }) => (
  <Card className="dark:bg-gray-800/50 dark:border-gray-700 transition-all hover:shadow-md">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
      <CardTitle className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="p-4 pt-0">
      <div className="flex flex-col">
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-50 tracking-tight">
          {value}
        </div>
        <p className={`text-xs font-medium mt-1 ${
          change.includes('+') 
            ? 'text-emerald-600 dark:text-emerald-400' 
            : 'text-red-600 dark:text-red-400'
        }`}>
          {change}
        </p>
      </div>
    </CardContent>
  </Card>
)

interface Section {
  id: string
  utilization: number
  waitingTime: number
  rfPlugStatus: number
  cranePosition: number
}

interface ShipMonitorPoint {
  id: number
  status: number
  position: { x: number, y: number }
}

interface Legend {
  color: string
  label: string
}

interface LaneClick {
  laneId: string;
  position: number;
}

const ContainerMonitor = () => {
  const [sections, setSections] = useState<Section[]>([])
  const [shipMonitorPoints, setShipMonitorPoints] = useState<ShipMonitorPoint[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedLane, setSelectedLane] = useState<LaneClick | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showLegend, setShowLegend] = useState(false)
  const [selectedSection, setSelectedSection] = useState<Section | null>(null)
  const [mounted, setMounted] = useState(false)

  const waitingTimeLegend: Legend[] = [
    { color: '#ef4444', label: 'WT > 30min' },
    { color: '#f97316', label: 'WT 20~30min' },
    { color: '#22c55e', label: 'WT < 20min' }
  ]

  const utilizationLegend: Legend[] = [
    { color: '#ef4444', label: 'BU > 75%' },
    { color: '#f97316', label: 'BU 70~75%' },
    { color: '#22c55e', label: 'BU < 70%' }
  ]

  const rfPlugLegend: Legend[] = [
    { color: '#ef4444', label: 'SD > 75%' },
    { color: '#f97316', label: '65% < SD < 75%' },
    { color: '#22c55e', label: 'SD < 65%' }
  ]

  useEffect(() => {
    setMounted(true)
    
    // Initialize sections with IDs A through J
    const initialSections = Array.from('ABCDEFGHIJ').map(id => ({
      id,
      utilization: Math.floor(Math.random() * 100),
      waitingTime: Math.floor(Math.random() * 40),
      rfPlugStatus: Math.floor(Math.random() * 100),
      cranePosition: Math.floor(Math.random() * 400) + 50
    }))
    setSections(initialSections)

    // Initialize ship monitor points
    const initialShipPoints = Array.from({ length: 3 }, (_, i) => ({
      id: i + 1,
      status: Math.floor(Math.random() * 100),
      position: {
        x: 80,
        y: 150 + (i * 100)
      }
    }))
    setShipMonitorPoints(initialShipPoints)

    // Update data periodically
    const interval = setInterval(() => {
      setSections(prev => prev.map(section => ({
        ...section,
        utilization: Math.max(0, Math.min(100, section.utilization + (Math.random() * 6 - 3))),
        waitingTime: Math.max(0, Math.min(40, section.waitingTime + (Math.random() * 4 - 2))),
        rfPlugStatus: Math.max(0, Math.min(100, section.rfPlugStatus + (Math.random() * 6 - 3))),
        cranePosition: Math.max(50, Math.min(450, section.cranePosition + (Math.random() * 40 - 20)))
      })))

      setShipMonitorPoints(prev => prev.map(point => ({
        ...point,
        status: Math.max(0, Math.min(100, point.status + (Math.random() * 6 - 3)))
      })))

      setCurrentTime(new Date())
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // 如果還沒有掛載，返回一個加載佔位符
  if (!mounted) {
    return <div className="w-full h-[520px] bg-black border border-gray-700" />
  }

  const getStatusColor = (value: number) => {
    if (value > 75) return '#ef4444'
    if (value > 70) return '#f97316'
    return '#22c55e'
  }

  const handleLaneClick = (laneId: string, yPosition: number) => {
    setSelectedLane({
      laneId,
      position: yPosition
    })
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const handleSectionClick = (section: Section) => {
    setSelectedSection(section)
  }

  return (
    <div className="relative bg-black p-4">
      {/* 全螢幕切換按鈕
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 text-white"
        onClick={toggleFullscreen}
      >
        {isFullscreen ? <Minimize2 className="h-6 w-6" /> : <Maximize2 className="h-6 w-6" />}
      </Button> */}

      <div className="flex gap-8 mb-4 justify-end">
        {/* 需要在組件頂部加入 useState */}
        {/* const [showLegend, setShowLegend] = useState(false) */}
        <Button 
          variant="ghost" 
          size="icon"
          className="text-white"
          onClick={() => setShowLegend(!showLegend)}
        > 
          {showLegend ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
        </Button>

        {showLegend && (
          <>
            <div className="flex flex-col gap-1">
              <div className={`font-bold mb-1 text-white ${isFullscreen ? 'text-base' : 'text-xs'}`}>
                Waiting Time
              </div>
              {waitingTimeLegend.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className={`${isFullscreen ? 'w-4 h-4' : 'w-3 h-3'}`} style={{ backgroundColor: item.color }} />
                  <span className={`text-gray-300 ${isFullscreen ? 'text-sm' : 'text-xs'}`}>{item.label}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-1">
              <div className={`font-bold mb-1 text-white ${isFullscreen ? 'text-base' : 'text-xs'}`}>
                Block Utilization
              </div>
              {utilizationLegend.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className={`${isFullscreen ? 'w-4 h-4' : 'w-3 h-3'}`} style={{ backgroundColor: item.color }} />
                  <span className={`text-gray-300 ${isFullscreen ? 'text-sm' : 'text-xs'}`}>{item.label}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-1">
              <div className={`font-bold mb-1 text-white ${isFullscreen ? 'text-base' : 'text-xs'}`}>
                SD Status
              </div>
              {rfPlugLegend.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className={`${isFullscreen ? 'w-4 h-4' : 'w-3 h-3'}`} style={{ backgroundColor: item.color }} />
                  <span className={`text-gray-300 ${isFullscreen ? 'text-sm' : 'text-xs'}`}>{item.label}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <svg width="100%" height="520" viewBox="0 0 2400 520" className="border border-gray-700">
        {/* Background grid */}
        <defs>
          <pattern id="smallGrid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#1f2937" strokeWidth="0.5"/>
          </pattern>
          <pattern id="grid" width="150" height="150" patternUnits="userSpaceOnUse">
            <rect width="150" height="150" fill="url(#smallGrid)"/>
            <path d="M 150 0 L 0 0 0 150" fill="none" stroke="#1f2937" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Ship Area */}
        <g transform="translate(150, 30)">
          {/* Ship hull */}
          <path
            d="M 0,0 
               L 0,255
               C 0,265 12,275 20,275
               L 65,275
               C 73,275 85,265 85,255
               L 85,25
               C 85,12 73,0 30,0
               C 15,0 5,0 0,0
               Z"
            fill="#2c3e50"
            stroke="#34495e"
            strokeWidth="2"
          />
          {/* Ship deck */}
          <rect x="12" y="5" width="61" height="250" fill="#34495e" />
          {/* Ship bridge */}
          <rect x="15" y="225" width="55" height="30" fill="#2c3e50" stroke="#34495e" strokeWidth="2" />
          <rect x="20" y="235" width="45" height="15" fill="#3498db" stroke="#2980b9" strokeWidth="2" />
          {/* Ship bow details */}
          <path
            d="M 0,0
               L 15,25
               L 0,25
               Z"
            fill="#34495e"
            stroke="#2c3e50"
            strokeWidth="1"
          />
        </g>

        {/* Only render monitor points when mounted */}
        {mounted && shipMonitorPoints.map((point, index) => (
          <g key={point.id}>
            <circle
              cx={192}
              cy={90 + index * 70}
              r={isFullscreen ? 6 : 4}
              fill={getStatusColor(point.status)}
            />
            <text
              x={192}
              y={80 + index * 70}
              textAnchor="middle"
              fill={getStatusColor(point.status)}
              className={`font-bold ${isFullscreen ? 'text-sm' : 'text-xl'}`}
            >
              {`${Math.round(point.status)}%`}
            </text>
          </g>
        ))}

        {/* Only render sections when mounted */}
        {mounted && sections.map((section, index) => {
          const sectionWidth = 210
          const x = index * sectionWidth + 250
          const isRFSection = ['D', 'E', 'F', 'G', 'H'].includes(section.id)
          
          return (
            <g key={section.id}>
              {/* Vertical dividing lines - 加粗邊界 */}
              <line
                x1={x}
                y1={-100}
                x2={x}
                y2={520}
                stroke="#374151"
                strokeWidth="4"
              />
              
              {/* 為最後一個區添加右邊界 */}
              {index === sections.length - 1 && (
                <line
                  x1={x + sectionWidth}
                  y1={-100}
                  x2={x + sectionWidth}
                  y2={520}
                  stroke="#374151"
                  strokeWidth="2"
                />
              )}

              {/* Section background for better text visibility */}
              <rect
                x={x}
                y={-100}
                width={sectionWidth}
                height={30}
                fill="black"
              />

              {/* Utilization percentage */}
              <text
                x={x + sectionWidth/2}
                y={-80}
                textAnchor="middle"
                fill={getStatusColor(section.utilization)}
                className="text-2xl font-bold"
              >
                {`${Math.round(section.utilization)}%`}
              </text>

              {/* Status indicators */}
              {/* <rect
                x={x + 5}
                y={40}
                width={sectionWidth - 10}
                height={20}
                rx={4}
                fill={getStatusColor(section.waitingTime)}
                fillOpacity={0.2}
              /> */}

              {/* Crane */}
              <line
                x1={x}
                y1={section.cranePosition}
                x2={x + sectionWidth}
                y2={section.cranePosition}
                stroke="#fbbf24"
                strokeWidth={5}
              />

              {/* Section ID */}
              <text
                x={x + sectionWidth/2}
                y={600}
                textAnchor="middle"
                className="text-4xl font-bold fill-gray-100"
              >
                {section.id}
              </text>

              {/* RF/SD Plug status - 根據區域顯示不同文字 */}
              <rect
                x={x}
                y={440}
                width={sectionWidth}
                height={30}
                fill="black"
              />
              <text
                x={x + sectionWidth/2}
                y={550}
                textAnchor="middle"
                fill={getStatusColor(section.rfPlugStatus)}
                className="text-2xl font-bold"
              >
                {`${isRFSection ? 'RF' : 'SD'}: ${Math.round(section.rfPlugStatus)}%`}
              </text>

              {/* 添加車道標記和點擊區域 */}
              {index < sections.length - 1 && (
                <g>
                  {/* 車道背景 */}
                  <rect
                    x={x + sectionWidth - 10}
                    y={-80}
                    width={20}
                    height={500}
                    fill="#1a1a1a"
                    className="cursor-pointer"
                    onClick={(e) => {
                      const svgElement = e.currentTarget.ownerSVGElement
                      if (svgElement) {
                        const rect = svgElement.getBoundingClientRect()
                        const y = e.clientY - rect.top
                        handleLaneClick(`Lane ${section.id}-${sections[index + 1].id}`, y)
                      }
                    }}
                  />
                  {/* 車道標記線 */}
                  <line
                    x1={x + sectionWidth}
                    y1={0}
                    x2={x + sectionWidth}
                    y2={500}
                    stroke="#fbbf24"
                    strokeWidth="1"
                    strokeDasharray="6 6"
                  />
                  {/* 車道標籤 */}
                  <text
                    x={x + sectionWidth}
                    y={200}
                    textAnchor="middle"
                    className={`font-bold fill-gray-400 ${isFullscreen ? 'text-sm' : 'text-xs'}`}
                  >
                    {`L${index + 1}`}
                  </text>
                </g>
              )}

              {/* 添加可點擊區域 */}
              <rect
                x={x}
                y={-100}
                width={sectionWidth}
                height={520}
                fill="transparent"
                className="cursor-pointer"
                onClick={() => handleSectionClick(section)}
              />
            </g>
          )
        })}

        {/* 為整個圖表添加左右間距 */}
        <rect x="0" y="0" width="0" height="520" fill="black" />
        <rect x="2350" y="0" width="0" height="520" fill="black" />
      </svg>

      {/* CCTV Dialog */}
      <Dialog open={selectedLane !== null} onOpenChange={() => setSelectedLane(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              CCTV - {selectedLane?.laneId} (Position: {Math.round(selectedLane?.position || 0)}px)
            </DialogTitle>
          </DialogHeader>
          <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
            <div className="text-gray-400">
              CCTV Feed Placeholder for {selectedLane?.laneId}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Section Details Dialog */}
      <Dialog open={selectedSection !== null} onOpenChange={() => setSelectedSection(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              Section {selectedSection?.id} Details
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              {(() => {
                const isRFSection = selectedSection?.id ? ['D', 'E', 'F', 'G', 'H'].includes(selectedSection.id) : false;
                return (
                  <>
                    <div>
                      <Label>Utilization</Label>
                      <div className="text-2xl font-bold">
                        {Math.round(selectedSection?.utilization || 0)}%
                      </div>
                    </div>
                    <div>
                      <Label>Waiting Time</Label>
                      <div className="text-2xl font-bold">
                        {Math.round(selectedSection?.waitingTime || 0)} min
                      </div>
                    </div>
                    <div>
                      <Label>{isRFSection ? 'RF Status' : 'SD Status'}</Label>
                      <div className="text-2xl font-bold">
                        {Math.round(selectedSection?.rfPlugStatus || 0)}%
                      </div>
                    </div>
                    <div>
                      <Label>Crane Position</Label>
                      <div className="text-2xl font-bold">
                        {Math.round(selectedSection?.cranePosition || 0)}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface EmptyBlock {
  id: string;
  containersToClean: number;
  repairingContainers: number;
  forkliftPosition?: { x: number; y: number };
}

const EmptyMonitor = () => {
  const [emptyBlocks, setEmptyBlocks] = useState<EmptyBlock[]>([])
  const [showLegend, setShowLegend] = useState(true)
  const [mounted, setMounted] = useState(false)

  const emptyBlockLegend: Legend[] = [
    { color: '#ef4444', label: 'Containers to clean > 40' },
    { color: '#f97316', label: 'Containers to clean 20~40' },
    { color: '#22c55e', label: 'Containers to clean < 20' }
  ]

  const repairBlockLegend: Legend[] = [
    { color: '#ef4444', label: 'Repairing > 20' },
    { color: '#f97316', label: 'Repairing 10~20' },
    { color: '#22c55e', label: 'Repairing < 10' }
  ]

  useEffect(() => {
    setMounted(true)
    
    // 初始化空櫃數據
    const initialEmptyBlocks = [
      { id: 'Row1', containersToClean: 41, repairingContainers: 20, forkliftPosition: { x: 850, y: -120 } },
      { id: 'Row2', containersToClean: 25, repairingContainers: 15, forkliftPosition: { x: 850, y: 30 } },
      { id: 'Row3', containersToClean: 35, repairingContainers: 12, forkliftPosition: { x: 850, y: 180 } },
      { id: 'Row4', containersToClean: 28, repairingContainers: 18, forkliftPosition: { x: 850, y: 330 } },
      { id: 'Row5', containersToClean: 15, repairingContainers: 8, forkliftPosition: { x: 850, y: 480 } },
      { id: 'Row6', containersToClean: 22, repairingContainers: 10, forkliftPosition: { x: 850, y: 630 } },
    ]
    setEmptyBlocks(initialEmptyBlocks)

    const interval = setInterval(() => {
      setEmptyBlocks(prev => prev.map((block, index) => {
        // 修改推高機移動範圍
        const baseY = -120 + (index * 150) // 調整為與 container 高度相同的間距
        const minX = 100  // 左邊界
        const maxX = 1600 // 右邊界
        const currentX = block.forkliftPosition?.x || minX
        
        // 決定移動方向
        let deltaX = (Math.random() * 50 - 25) // 增加移動幅度
        // 確保推高機保持在合理範圍內
        const newX = Math.max(minX, Math.min(maxX, currentX + deltaX))

        return {
          ...block,
          containersToClean: Math.max(0, Math.min(60, block.containersToClean + (Math.random() * 6 - 3))),
          repairingContainers: Math.max(0, Math.min(30, block.repairingContainers + (Math.random() * 4 - 2))),
          forkliftPosition: {
            x: newX,
            y: baseY
          }
        }
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  // 如果還沒有掛載，返回一個加載佔位符
  if (!mounted) {
    return <div className="w-full h-[520px] bg-black border border-gray-700" />
  }

  const getEmptyBlockColor = (value: number) => {
    if (value > 40) return '#ef4444'
    if (value > 20) return '#f97316'
    return '#22c55e'
  }

  const getRepairBlockColor = (value: number) => {
    if (value > 20) return '#ef4444'
    if (value > 10) return '#f97316'
    return '#22c55e'
  }

  return (
    <div className="relative bg-black p-4">
      {/* Legend */}
      <div className="flex gap-8 mb-4 justify-end">
        <Button 
          variant="ghost" 
          size="icon"
          className="text-white"
          onClick={() => setShowLegend(!showLegend)}
        >
          {showLegend ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
        </Button>

        {showLegend && (
          <>
            <div className="flex flex-col gap-1">
              <div className="text-xs font-bold mb-1 text-white">Empty Containers</div>
              {emptyBlockLegend.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-gray-300">{item.label}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-xs font-bold mb-1 text-white">Repair Status</div>
              {repairBlockLegend.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-gray-300">{item.label}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Empty Blocks Monitor */}
      <svg width="100%" height="520" viewBox="0 0 2400 520" className="border border-gray-700">
        <defs>
          <pattern id="emptyGrid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#1f2937" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#emptyGrid)" />

        {/* 繪製橫向櫃位 */}
        {emptyBlocks.slice(0, 6).map((block, index) => (
          <g key={block.id}>
            {/* 空櫃區域背景 */}
            <rect
              x={100}
              y={index * 150 - 150}
              width={1500}
              height={120} // 增加高度
              fill="#1a1a1a"
              stroke="#374151"
              strokeWidth="2"
            />

            {/* 添加區域標籤 */}
            <text
              x={120}
              y={index * 150 - 100}
              fill="white"
              className="text-sm font-bold"
            >
              {`${block.id} - Clean: ${Math.round(block.containersToClean)} | Repair: ${Math.round(block.repairingContainers)}`}
            </text>

            {/* 推高機位置 */}
            <g transform={`translate(${block.forkliftPosition?.x || 0},${block.forkliftPosition?.y || 0})`}>
              <rect
                x={-15}
                y={-15}
                width={30}
                height={30}
                fill="#fbbf24"
                className="animate-pulse"
              />
              <text
                x={0}
                y={35}
                textAnchor="middle"
                fill="#fbbf24"
                className="text-sm font-bold"
              >
                FL-{index + 1}
              </text>
            </g>
          </g>
        ))}
      </svg>
    </div>
  )
}

export function DashboardComponent() {
  const { theme, setTheme } = useTheme()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState<string>('')

  useEffect(() => {
    // 首次渲染時設置時間
    setCurrentTime(new Date().toLocaleTimeString())
    
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString())
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside 
        className={`bg-white dark:bg-gray-900 min-h-screen transition-all duration-300 relative
          border-r border-gray-200 dark:border-gray-800
          ${isSidebarOpen ? 'w-64' : 'w-16'}`}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-50 rounded-full
            bg-white dark:bg-gray-900 shadow-md dark:shadow-gray-950
            hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? (
            <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          )}
        </Button>

        <nav className="space-y-2 p-4">
          <Button variant="ghost" 
            className={`w-full justify-start text-gray-600 dark:text-gray-400
              hover:bg-gray-100 dark:hover:bg-gray-800 ${!isSidebarOpen && 'px-2'}`}>
            <Menu className="h-5 w-5" />
            {isSidebarOpen && <span className="ml-2">Dashboard</span>}
          </Button>
          <Button variant="ghost" 
            className={`w-full justify-start text-gray-600 dark:text-gray-400
              hover:bg-gray-100 dark:hover:bg-gray-800 ${!isSidebarOpen && 'px-2'}`}>
            <Bell className="h-5 w-5" />
            {isSidebarOpen && <span className="ml-2">Notifications</span>}
          </Button>
          <Button variant="ghost" 
            className={`w-full justify-start text-gray-600 dark:text-gray-400
              hover:bg-gray-100 dark:hover:bg-gray-800 ${!isSidebarOpen && 'px-2'}`}>
            <Settings className="h-5 w-5" />
            {isSidebarOpen && <span className="ml-2">Settings</span>}
          </Button>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-3">
              {/* 添加 logo */}
              <svg 
                className="h-8 w-8 text-blue-500" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M20 3H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" />
                <path d="M16 3v18" />
                <path d="M8 3v18" />
                <path d="M4 8h16" />
                <path d="M4 16h16" />
              </svg>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Container Terminal <span className="text-blue-500">Dashboard</span>
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">{currentTime}</span>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-950">
          <div className="container mx-auto px-6 py-8">
            {/* Stats grid - 加回 KPI 統計卡片 */}
            <div className="grid grid-cols-8 gap-4 mb-8">
              <Stat 
                title="Total Containers" 
                value="1,234" 
                change="+20.1% from last month"
              />
              <Stat 
                title="Active Ships" 
                value="12" 
                change="-2 from yesterday" 
              />
              <Stat 
                title="Waiting Time" 
                value="45 min" 
                change="+5 min" 
              />
              <Stat 
                title="Efficiency" 
                value="92%" 
                change="+3%" 
              />
              <Stat 
                title="Yard Usage" 
                value="78%" 
                change="+5%"
              />
              <Stat 
                title="Berth Usage" 
                value="85%" 
                change="+2%"
              />
              <Stat 
                title="Equipment" 
                value="89%" 
                change="+4%"
              />
              <Stat 
                title="Productivity" 
                value="32.5" 
                change="+2.1"
              />
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
              <Tabs defaultValue="monitor" className="w-full">
                <TabsList className="mb-4 p-1 bg-gray-100/80 dark:bg-gray-800/80 rounded-lg">
                  <TabsTrigger 
                    value="monitor" 
                    className="text-sm font-medium px-4 py-2 data-[state=active]:bg-white
                      dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-gray-100
                      transition-all"
                  >
                    Container Monitor
                  </TabsTrigger>
                  <TabsTrigger value="empty" className="text-sm font-medium px-4 py-2">Empty Monitor</TabsTrigger>
                  <TabsTrigger value="search" className="text-sm font-medium px-4 py-2">Container Search</TabsTrigger>
                </TabsList>

                <TabsContent value="monitor">
                  <Card className="border-0 shadow-none bg-transparent">
                    <CardHeader className="pb-0">
                      <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Real-time Container Monitor
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="scale-100 transform-origin-top-left p-4">
                        <ContainerMonitor />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="empty">
                  <Card className="border-0 shadow-none">
                    <CardHeader>
                      <CardTitle className="text-xl">Empty Container Monitor</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="scale-100 transform-origin-top-left p-4">
                        <EmptyMonitor />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="search">
                  <Card>
                    <CardHeader>
                      <CardTitle>Container Search</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form className="flex items-center space-x-2">
                        <Label htmlFor="search" className="sr-only">Search containers</Label>
                        <Input id="search" placeholder="Enter container ID..." />
                        <Button type="submit">
                          <Search className="mr-2 h-4 w-4" />
                          Search
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}