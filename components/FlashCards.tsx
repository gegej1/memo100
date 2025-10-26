"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { flashCardTexts } from "@/data/flashCardTexts"
import { Heart, ZoomIn, ZoomOut } from "lucide-react"

interface FlashCardProps {
  minePositions: { row: number; col: number; momentId?: number }[]
}

export default function FlashCards({ minePositions }: FlashCardProps) {
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [selectedCard, setSelectedCard] = useState<number | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1.5) // 默认放大一些
  const gridRef = useRef<HTMLDivElement>(null)

  // 确保我们有足够的文本对应每个地雷位置
  const availableTexts = [...flashCardTexts]

  const toggleCard = (index: number) => {
    if (flippedCards.includes(index)) {
      setFlippedCards(flippedCards.filter((cardId) => cardId !== index))
    } else {
      setFlippedCards([...flippedCards, index])
    }
  }

  const isFlipped = (index: number) => flippedCards.includes(index)

  const openCardDetail = (index: number) => {
    setSelectedCard(index)
  }

  const closeCardDetail = () => {
    setSelectedCard(null)
  }

  // 增加和减少缩放级别
  const increaseZoom = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 4)) // 允许更大的缩放
  }

  const decreaseZoom = () => {
    setZoomLevel((prev) => Math.max(prev - 0.5, 1))
  }

  // 应用缩放效果
  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.style.transform = `scale(${zoomLevel})`
    }
  }, [zoomLevel])

  useEffect(() => {
    // 显示提示信息
    setTimeout(() => {
      alert("挑战成功！现在，您可以点击卡片查看我们的小事！使用缩放按钮调整大小。")
    }, 500)
  }, [])

  // 计算网格大小
  const gridSize = 20 // 使用固定大小，与扫雷游戏保持一致

  // 创建一个二维数组来表示网格
  const grid: (number | null)[][] = []
  for (let i = 0; i < gridSize; i++) {
    grid.push(Array(gridSize).fill(null))
  }

  // 在地雷位置放置卡片
  minePositions.forEach((pos) => {
    const momentId = pos.momentId !== undefined ? pos.momentId : 0
    if (pos.row < gridSize && pos.col < gridSize && momentId < availableTexts.length) {
      grid[pos.row][pos.col] = momentId
    }
  })

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6 text-indigo-600">恭喜你完成扫雷！</h2>
      <p className="text-center mb-6 text-indigo-500">点击卡片翻转查看小事，点击文本查看完整内容</p>

      <div className="flex justify-center mb-4 space-x-4">
        <button onClick={decreaseZoom} className="bg-indigo-500 hover:bg-indigo-600 text-white p-2 rounded-lg">
          <ZoomOut className="w-5 h-5" />
        </button>
        <span className="text-indigo-600 font-medium flex items-center">缩放: {Math.round(zoomLevel * 100)}%</span>
        <button onClick={increaseZoom} className="bg-indigo-500 hover:bg-indigo-600 text-white p-2 rounded-lg">
          <ZoomIn className="w-5 h-5" />
        </button>
      </div>

      <div className="relative w-full overflow-auto border-2 border-indigo-200 rounded-lg" style={{ height: "500px" }}>
        <div
          ref={gridRef}
          className="absolute top-0 left-0 w-full grid gap-1 bg-indigo-100 p-2 rounded-md shadow-inner select-none transition-transform duration-300"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, minmax(40px, 1fr))`,
            gridTemplateRows: `repeat(${gridSize}, minmax(40px, 1fr))`,
            transformOrigin: "top left",
          }}
        >
          {grid.map((row, rowIndex) =>
            row.map((cardIndex, colIndex) => (
              <div key={`${rowIndex}-${colIndex}`} className="aspect-square">
                {cardIndex !== null && cardIndex < availableTexts.length ? (
                  <div
                    className="w-full h-full relative perspective-1000 cursor-pointer"
                    onClick={() => toggleCard(cardIndex)}
                  >
                    <div
                      className={`w-full h-full absolute transition-all duration-700 transform-style-preserve-3d ${
                        isFlipped(cardIndex) ? "rotate-y-180" : ""
                      }`}
                    >
                      {/* 卡片正面 */}
                      <div className="w-full h-full absolute backface-hidden bg-indigo-200 rounded-md flex items-center justify-center">
                        <Heart className="w-1/2 h-1/2 text-indigo-500" />
                      </div>

                      {/* 卡片背面 - 直接显示完整文本 */}
                      <div
                        className="w-full h-full absolute backface-hidden bg-indigo-600 text-white rounded-md flex items-center justify-center p-1 rotate-y-180 overflow-hidden"
                        onClick={(e) => {
                          e.stopPropagation()
                          openCardDetail(cardIndex)
                        }}
                      >
                        <div className="text-xs overflow-y-auto scrollbar-thin max-h-full w-full text-center p-1">
                          {availableTexts[cardIndex]}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )),
          )}
        </div>
      </div>

      <div className="mt-4 text-center text-sm text-gray-600">
        点击卡片翻转查看内容，点击文本可查看放大版，使用上方按钮调整缩放比例
      </div>

      <button
        onClick={() => window.location.reload()}
        className="mt-6 w-full py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition"
      >
        重新开始游戏
      </button>

      {selectedCard !== null && selectedCard < availableTexts.length && (
        <Dialog open={selectedCard !== null} onOpenChange={closeCardDetail}>
          <DialogContent className="sm:max-w-md">
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2 text-indigo-600">小事 {selectedCard + 1}</h3>
              <p className="text-gray-700">{availableTexts[selectedCard]}</p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
