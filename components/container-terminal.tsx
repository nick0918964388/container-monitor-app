'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, Text } from '@react-three/drei'
import { Suspense, useRef, useState, useEffect, useCallback } from 'react'
import * as THREE from 'three'

// Container component with increased size
function Container({ 
  position, 
  color, 
  size = [3.75, 3.75, 9] 
}: { 
  position: [number, number, number];
  color: string;
  size?: [number, number, number];
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

// Helper function for random movement
function getRandomPosition(min: number, max: number) {
  return Math.random() * (max - min) + min
}

// 添加監控指標的類型定義
interface Metrics {
  waitingTime: number;
  blockUtilization: number;
  sdStatus: number;
}

// 添加區域顏色計算函數
function getAreaColor(utilization: number) {
  // 根據使用率返回不同的顏色和透明度
  if (utilization > 75) {
    return {
      color: '#EF4444',  // 紅色 - 高使用率
      opacity: 0.2
    }
  } else if (utilization > 70) {
    return {
      color: '#F59E0B',  // 黃色 - 中等使用率
      opacity: 0.18
    }
  } else {
    return {
      color: '#10B981',  // 綠色 - 低使用率
      opacity: 0.15
    }
  }
}

// RMG Crane component with metrics display
function RMGCrane({ 
  position, 
  areaLabel = 'A', 
  showLabel = true, 
  metrics,
  isSelected = false
}: { 
  position: [number, number, number];
  areaLabel?: string;
  showLabel?: boolean;
  metrics: Metrics;
  isSelected?: boolean;
}) {
  const craneRef = useRef<THREE.Group>(null)
  const trolleyRef = useRef<THREE.Mesh>(null)
  
  // Target positions for smooth movement
  const [targetZ, setTargetZ] = useState(5)  // 從第一排貨櫃開始
  const [targetX, setTargetX] = useState(7.5)
  
  // Movement timing
  useEffect(() => {
    const updateTarget = () => {
      // 在整個貨櫃區域內移動 (5 -> 55)
      const currentZ = craneRef.current?.position.z || 5
      // 如果在前半段，移動到後半段；如果在後半段，移動到前半段
      const newZ = currentZ < 30 ? 55 : 5
      setTargetZ(newZ)
      
      // x軸移動範圍限制在貨櫃寬度內
      setTargetX(getRandomPosition(0, 13.5))
    }
    
    const interval = setInterval(() => {
      updateTarget()
    }, getRandomPosition(6000, 10000))
    
    return () => clearInterval(interval)
  }, [])
  
  // Animation frame with smoother movement
  useFrame((state, delta) => {
    if (craneRef.current && trolleyRef.current) {
      // 天車整體移動
      craneRef.current.position.z = THREE.MathUtils.lerp(
        craneRef.current.position.z,
        targetZ,
        delta * 0.2  // 降低移動速度，因為距離變長
      )
      
      // 小車移動
      trolleyRef.current.position.x = THREE.MathUtils.lerp(
        trolleyRef.current.position.x,
        targetX,
        delta * 0.5
      )
    }
  })

  return (
    <group position={position}>
      {/* Moving crane structure */}
      <group ref={craneRef}>
        {/* Vertical supports */}
        <mesh position={[0, 11.25, 0]}>
          <boxGeometry args={[3, 22.5, 3]} />
          <meshStandardMaterial color="#2D3748" />
        </mesh>
        <mesh position={[22.5, 11.25, 0]}>
          <boxGeometry args={[3, 22.5, 3]} />
          <meshStandardMaterial color="#2D3748" />
        </mesh>

        {/* Horizontal beam */}
        <mesh position={[11.25, 22.5, 0]}>
          <boxGeometry args={[27, 3, 2]} />
          <meshStandardMaterial color="#2D3748" />
        </mesh>

        {/* Trolley with reference for movement */}
        <mesh 
          ref={trolleyRef}
          position={[7.5, 20.5, 0]}
        >
          <boxGeometry args={[4.5, 3, 4.5]} />
          <meshStandardMaterial color="#1A202C" />
        </mesh>
      </group>

      {/* Static area marker and label */}
      {showLabel && (
        <>
          {/* Area marker with dynamic color */}
          <mesh position={[11.25, 0.02, 30]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[40, 130]} />
            <meshStandardMaterial 
              color={getAreaColor(metrics.blockUtilization).color}
              opacity={isSelected ? 0.3 : getAreaColor(metrics.blockUtilization).opacity}
              transparent={true}
              roughness={0.3}
              metalness={0.5}
              depthWrite={false}  // 防止閃爍
            />
          </mesh>

          {/* Area border outline */}
          <mesh position={[11.25, 0.03, 30]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[40.2, 130.2]} />
            <meshBasicMaterial 
              color={getAreaColor(metrics.blockUtilization).color}
              opacity={0.4}
              transparent={true}
              depthWrite={false}  // 防止閃爍
            />
          </mesh>

          {/* Area Label - 調整位置和大小 */}
          <group position={[11.25, 0.1, 75]}>
            <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[8]} /> {/* 加大背景圓圈 */}
              <meshBasicMaterial 
                color="#FFFFFF"
                opacity={0.95}
                transparent={true}
                depthWrite={false}
              />
            </mesh>

            <Text
              position={[0, 0.1, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={12}  // 加大字體
              color="#1A365D"
              anchorX="center"
              anchorY="middle"
              fontWeight="bold"
            >
              {areaLabel}
            </Text>
          </group>
        </>
      )}
    </group>
  )
}

// Ground without color
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial 
        color="#FFFFFF"
        transparent={true}
        opacity={0}  // 完全透明
      />
    </mesh>
  )
}

// Container arrangement with proper stacking
function ContainerArrangement() {
  const colors = {
    green: '#276749',
    blue: '#2B6CB0',
    orange: '#DD6B20',
    brown: '#B7791F'
  }

  return (
    <group>
      {/* First area (z: 5) */}
      <Container position={[0, 1.875, 5]} color={colors.green} />
      <Container position={[0, 5.625, 5]} color={colors.blue} />
      <Container position={[0, 9.375, 5]} color={colors.orange} />
      
      <Container position={[4.5, 1.875, 5]} color={colors.brown} />
      <Container position={[4.5, 5.625, 5]} color={colors.green} />
      
      <Container position={[9, 1.875, 5]} color={colors.blue} />
      <Container position={[9, 5.625, 5]} color={colors.orange} />
      
      <Container position={[13.5, 1.875, 5]} color={colors.brown} />

      {/* Middle area (z: 30) */}
      <Container position={[0, 1.875, 30]} color={colors.blue} />
      <Container position={[0, 5.625, 30]} color={colors.green} />
      
      <Container position={[4.5, 1.875, 30]} color={colors.orange} />
      <Container position={[4.5, 5.625, 30]} color={colors.brown} />
      <Container position={[4.5, 9.375, 30]} color={colors.blue} />
      
      <Container position={[9, 1.875, 30]} color={colors.green} />
      
      <Container position={[13.5, 1.875, 30]} color={colors.orange} />
      <Container position={[13.5, 5.625, 30]} color={colors.brown} />

      {/* Far area (z: 55) */}
      <Container position={[0, 1.875, 55]} color={colors.brown} />
      <Container position={[0, 5.625, 55]} color={colors.green} />
      <Container position={[0, 9.375, 55]} color={colors.blue} />
      
      <Container position={[4.5, 1.875, 55]} color={colors.orange} />
      
      <Container position={[9, 1.875, 55]} color={colors.brown} />
      <Container position={[9, 5.625, 55]} color={colors.green} />
      
      <Container position={[13.5, 1.875, 55]} color={colors.blue} />
      <Container position={[13.5, 5.625, 55]} color={colors.orange} />
    </group>
  )
}

// 定義區域的類型
interface TerminalArea {
  id: string;
  label: string;
  position: [number, number, number];
  metrics: Metrics;
}

// 區域組件
function TerminalAreaSection({ 
  area,
  offset,
  isSelected,
  onClick 
}: { 
  area: TerminalArea;
  offset: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <group 
      position={[offset * 45, 0, 0]}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      onPointerOver={(e) => {
        document.body.style.cursor = 'pointer'
        e.stopPropagation()
      }}
      onPointerOut={(e) => {
        document.body.style.cursor = 'default'
        e.stopPropagation()
      }}
    >
      {/* 透明點擊區域 */}
      <mesh 
        position={[11.25, 10, 30]} 
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
      >
        <boxGeometry args={[40, 20, 130]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <ContainerArrangement />
      <RMGCrane 
        position={[-5, 0, 5]}
        areaLabel={area.label}
        showLabel={true}
        metrics={area.metrics}
        isSelected={isSelected}
      />
    </group>
  )
}

// 添加道路標籤的類型定義
interface RoadLabel {
  id: string;
  label: string;
  position: [number, number, number];
}

// 道路標籤組件
function RoadLabel({ 
  position, 
  label,
  onClick 
}: { 
  position: [number, number, number];
  label: string;
  onClick: () => void;
}) {
  return (
    <group 
      position={position}
      onPointerDown={(e) => {  // 改用 onPointerDown
        e.stopPropagation()
        onClick()
      }}
      onPointerOver={(e) => {
        document.body.style.cursor = 'pointer'
        e.stopPropagation()
      }}
      onPointerOut={(e) => {
        document.body.style.cursor = 'default'
        e.stopPropagation()
      }}
    >
      {/* 添加一個可點擊的透明區域 */}
      <mesh 
        position={[0, 0, 0]}
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
      >
        <boxGeometry args={[5, 1, 5]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* 原有的標籤背景和文字 */}
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.5]} />
        <meshBasicMaterial 
          color="#FFFFFF"
          opacity={0.95}
          transparent={true}
          depthWrite={false}
        />
      </mesh>

      <Text
        position={[0, 0.2, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={5}
        color="#1A365D"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        {label}
      </Text>
    </group>
  )
}

// CCTV 對話框組件
function CCTVDialog({ 
  roadLabel, 
  onClose 
}: { 
  roadLabel: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Road {roadLabel} CCTV</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
          >
            Close
          </button>
        </div>
        <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
          <div className="w-full h-full flex items-center justify-center text-white">
            <div className="text-center">
              <div className="text-2xl mb-2">CCTV Feed for Road {roadLabel}</div>
              <div className="text-gray-400">Live Camera Feed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 添加船舶監控數據類型
interface ShipMetrics {
  cargoCapacity: number;
  loadingProgress: number;
  estimatedTime: number;
}

// 修改 Ship 組件
function Ship({ 
  onClick, 
  isSelected,
  metrics 
}: { 
  onClick: () => void;
  isSelected: boolean;
  metrics: ShipMetrics;
}) {
  return (
    <group 
      position={[-20, 0, 30]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        document.body.style.cursor = 'pointer';
        e.stopPropagation();
      }}
      onPointerOut={(e) => {
        document.body.style.cursor = 'default';
        e.stopPropagation();
      }}
    >
      {/* 船身 */}
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[15, 5, 40]} />
        <meshStandardMaterial color="#2C3E50" />
      </mesh>

      {/* 船艙底部 - 降低高度 */}
      <mesh position={[0, 4.75, 0]}>
        <boxGeometry args={[14, 0.5, 39]} />
        <meshStandardMaterial color="#34495E" />
      </mesh>

      {/* 船艙貨櫃區 - 調整位置從底部開始 */}
      <group position={[0, 5, 0]}>
        {/* 第一層貨櫃 */}
        <group position={[-4, 1.875, -12.5]}>
          <Container position={[0, 0, 0]} color="#2980B9" size={[3.75, 3.75, 9]} />
          <Container position={[4.5, 0, 0]} color="#E74C3C" size={[3.75, 3.75, 9]} />
          <Container position={[9, 0, 0]} color="#27AE60" size={[3.75, 3.75, 9]} />
        </group>
        <group position={[-4, 1.875, 0]}>
          <Container position={[0, 0, 0]} color="#F1C40F" size={[3.75, 3.75, 9]} />
          <Container position={[4.5, 0, 0]} color="#8E44AD" size={[3.75, 3.75, 9]} />
          <Container position={[9, 0, 0]} color="#E67E22" size={[3.75, 3.75, 9]} />
        </group>

        {/* 第二層貨櫃 */}
        <group position={[-4, 5.625, -12.5]}>
          <Container position={[0, 0, 0]} color="#16A085" size={[3.75, 3.75, 9]} />
          <Container position={[4.5, 0, 0]} color="#D35400" size={[3.75, 3.75, 9]} />
        </group>
        <group position={[-4, 5.625, 0]}>
          <Container position={[0, 0, 0]} color="#2ECC71" size={[3.75, 3.75, 9]} />
          <Container position={[4.5, 0, 0]} color="#9B59B6" size={[3.75, 3.75, 9]} />
        </group>
      </group>

      {/* 船橋 */}
      <group position={[0, 7.5, 15]}>
        <mesh>
          <boxGeometry args={[7.5, 5, 7.5]} />
          <meshStandardMaterial color="#2C3E50" />
        </mesh>
        {/* 窗戶 */}
        <mesh position={[0, 1, 3.8]}>
          <boxGeometry args={[5, 1.5, 0.1]} />
          <meshStandardMaterial color="#3498DB" opacity={0.6} transparent />
        </mesh>
      </group>

      {/* 改進的船首 - 更尖銳的設計 */}
      <group position={[0, 2.5, -20]}>
        {/* 主要船首部分 */}
        <mesh rotation={[0, 0, 0]}>
          <cylinderGeometry args={[1, 7.5, 10, 32, 1, false, 0, Math.PI]} />
          <meshStandardMaterial color="#2C3E50" />
        </mesh>
        {/* 船首側面 */}
        <mesh position={[3.75, 0, 2.5]} rotation={[0, Math.PI / 4, 0]}>
          <boxGeometry args={[5, 5, 2]} />
          <meshStandardMaterial color="#2C3E50" />
        </mesh>
        <mesh position={[-3.75, 0, 2.5]} rotation={[0, -Math.PI / 4, 0]}>
          <boxGeometry args={[5, 5, 2]} />
          <meshStandardMaterial color="#2C3E50" />
        </mesh>
      </group>
    </group>
  )
}

// 添加船舶監控數據顯示組件
function ShipMetricsDisplay({ metrics }: { metrics: ShipMetrics }) {
  return (
    <div className="bg-slate-900/90 p-4 rounded-lg shadow-lg">
      <div className="text-white font-bold mb-2 text-lg">Ship Status</div>
      <div className="space-y-2">
        <div className="flex justify-between gap-4">
          <span className="text-gray-300">Cargo Capacity:</span>
          <span className="text-blue-400">{metrics.cargoCapacity}%</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-300">Loading Progress:</span>
          <span className="text-green-400">{metrics.loadingProgress}%</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-300">Est. Time:</span>
          <span className="text-yellow-400">{metrics.estimatedTime} min</span>
        </div>
      </div>
    </div>
  )
}

export default function ContainerTerminal() {
  const [selectedArea, setSelectedArea] = useState<string | null>(null)
  const [selectedRoad, setSelectedRoad] = useState<string | null>(null)
  const [isShipSelected, setIsShipSelected] = useState(false)
  const [shipMetrics] = useState<ShipMetrics>({
    cargoCapacity: 75,
    loadingProgress: 45,
    estimatedTime: 120
  })
  const [areas] = useState<TerminalArea[]>([
    { id: '1', label: 'A', position: [0, 0, 0], metrics: { waitingTime: 25, blockUtilization: 80, sdStatus: 65 } },
    { id: '2', label: 'B', position: [1, 0, 0], metrics: { waitingTime: 15, blockUtilization: 60, sdStatus: 45 } },
    { id: '3', label: 'C', position: [2, 0, 0], metrics: { waitingTime: 35, blockUtilization: 85, sdStatus: 75 } },
    { id: '4', label: 'D', position: [3, 0, 0], metrics: { waitingTime: 20, blockUtilization: 70, sdStatus: 55 } },
    { id: '5', label: 'E', position: [4, 0, 0], metrics: { waitingTime: 30, blockUtilization: 75, sdStatus: 70 } },
    { id: '6', label: 'F', position: [5, 0, 0], metrics: { waitingTime: 18, blockUtilization: 65, sdStatus: 50 } },
    { id: '7', label: 'G', position: [6, 0, 0], metrics: { waitingTime: 28, blockUtilization: 78, sdStatus: 68 } },
    { id: '8', label: 'H', position: [7, 0, 0], metrics: { waitingTime: 22, blockUtilization: 72, sdStatus: 58 } },
    { id: '9', label: 'I', position: [8, 0, 0], metrics: { waitingTime: 32, blockUtilization: 82, sdStatus: 72 } },
    { id: '10', label: 'J', position: [9, 0, 0], metrics: { waitingTime: 16, blockUtilization: 68, sdStatus: 48 } },
  ])

  // 定義道路標籤 - 重新調整位置到正確的白色區域上
  const roads: RoadLabel[] = [
    { id: 'L1', label: 'L1', position: [27.5, 0, 30] },   // A-B 之間
    { id: 'L2', label: 'L2', position: [74.5, 0, 30] },   // B-C 之間
    { id: 'L3', label: 'L3', position: [119.5, 0, 30] },  // C-D 之間
    { id: 'L4', label: 'L4', position: [164.5, 0, 30] },  // D-E 之間
    { id: 'L5', label: 'L5', position: [209.5, 0, 30] },  // E-F 之間
    { id: 'L6', label: 'L6', position: [254.5, 0, 30] },  // F-G 之間
    { id: 'L7', label: 'L7', position: [299.5, 0, 30] },  // G-H 之間
    { id: 'L8', label: 'L8', position: [344.5, 0, 30] },  // H-I 之間
    { id: 'L9', label: 'L9', position: [389.5, 0, 30] }   // I-J 之間
  ]

  // 處理區域點擊
  const handleAreaClick = useCallback((areaId: string) => {
    setSelectedArea(prev => prev === areaId ? null : areaId)
  }, [])

  // 處理道路點擊
  const handleRoadClick = useCallback((roadId: string) => {
    console.log('Road clicked:', roadId)  // 添加日誌
    setSelectedRoad(roadId)
  }, [])

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{
          position: [220, 300, 400],
          fov: 35,
          near: 1,
          far: 2000,
        }}
        shadows
        style={{ height: '100%', width: '100%' }}
      >
        <Suspense fallback={null}>
          <Environment preset="city" />
          
          {/* Lighting */}
          <ambientLight intensity={0.6} />
          <directionalLight 
            position={[100, 100, 100]} 
            intensity={0.8} 
            castShadow 
          />

          {/* 修改 Ship 組件的使用 */}
          <Ship 
            onClick={() => setIsShipSelected(!isShipSelected)}
            isSelected={isShipSelected}
            metrics={shipMetrics}
          />

          {/* Render all areas */}
          {areas.map((area, index) => (
            <TerminalAreaSection 
              key={area.id}
              area={area}
              offset={index}
              isSelected={selectedArea === area.id}
              onClick={() => handleAreaClick(area.id)}
            />
          ))}

          {/* 渲染道路標籤 */}
          {roads.map((road) => (
            <RoadLabel
              key={road.id}
              position={road.position}
              label={road.label}
              onClick={() => handleRoadClick(road.id)}  // 使用新的處理函數
            />
          ))}

          {/* 調整 OrbitControls 的參數 */}
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 6}
            minDistance={200}
            maxDistance={1000}
            panSpeed={1.5}
            rotateSpeed={0.7}
            zoomSpeed={1.2}
            target={[220, 0, 30]}
          />
        </Suspense>
      </Canvas>

      <div className="absolute top-2 right-2 z-10">
        {selectedArea && (
          <MetricsDisplay 
            metrics={areas.find(area => area.id === selectedArea)!.metrics}
            areaLabel={areas.find(area => area.id === selectedArea)!.label}
          />
        )}
        {isShipSelected && (
          <ShipMetricsDisplay metrics={shipMetrics} />
        )}
      </div>

      <div className="absolute bottom-2 left-2 text-white bg-slate-900/90 p-2 rounded-lg z-10">
        <p className="font-bold mb-1 text-sm">Controls:</p>
        <ul className="text-xs space-y-0.5">
          <li>Left Click + Drag: Rotate view</li>
          <li>Right Click + Drag: Pan view</li>
          <li>Scroll: Zoom in/out</li>
          <li>Click on area to show metrics</li>
        </ul>
      </div>

      {/* CCTV Dialog with improved visibility */}
      {selectedRoad && (
        <CCTVDialog
          roadLabel={selectedRoad}
          onClose={() => setSelectedRoad(null)}
        />
      )}
    </div>
  )
}

// 修改 MetricsDisplay 組件以包含區域標籤
function MetricsDisplay({ 
  metrics, 
  areaLabel 
}: { 
  metrics: Metrics;
  areaLabel: string;
}) {
  const getMetricColor = (value: number, type: 'WT' | 'BU' | 'SD') => {
    switch(type) {
      case 'WT':
        return value > 30 ? 'text-red-500' : value > 20 ? 'text-amber-500' : 'text-emerald-500'
      case 'BU':
        return value > 75 ? 'text-red-500' : value > 70 ? 'text-amber-500' : 'text-emerald-500'
      case 'SD':
        return value > 75 ? 'text-red-500' : value > 65 ? 'text-amber-500' : 'text-emerald-500'
    }
  }

  return (
    <div className="bg-slate-900/90 p-4 rounded-lg shadow-lg">
      <div className="text-white font-bold mb-2 text-lg">Area {areaLabel} Metrics</div>
      <div className="space-y-2">
        <div className="flex justify-between gap-4">
          <span className="text-gray-300">Waiting Time:</span>
          <span className={getMetricColor(metrics.waitingTime, 'WT')}>
            {metrics.waitingTime}min
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-300">Block Utilization:</span>
          <span className={getMetricColor(metrics.blockUtilization, 'BU')}>
            {metrics.blockUtilization}%
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-300">SD Status:</span>
          <span className={getMetricColor(metrics.sdStatus, 'SD')}>
            {metrics.sdStatus}%
          </span>
        </div>
      </div>
    </div>
  )
}

