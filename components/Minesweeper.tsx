"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Flag, RefreshCw, Heart } from "lucide-react"

interface Cell {
  isMine: boolean
  isRevealed: boolean
  isFlagged: boolean
  adjacentMines: number
  momentId?: number
}

interface MinesweeperProps {
  onGameLost: (currentProgress: any) => void
  onGameWon: (positions: { row: number; col: number; momentId?: number }[]) => void
  mineCount: number
  gridSize: number
  savedProgress: {
    grid: Cell[][]
    flagsLeft: number
    firstClick: boolean
  } | null
}

export default function Minesweeper({ onGameLost, onGameWon, mineCount, gridSize, savedProgress }: MinesweeperProps) {
  const rows = gridSize
  const cols = gridSize

  const [grid, setGrid] = useState<Cell[][]>([])
  const [gameOver, setGameOver] = useState(false)
  const [flagsLeft, setFlagsLeft] = useState(mineCount)
  const [firstClick, setFirstClick] = useState(true)
  const [minePositions, setMinePositions] = useState<{ row: number; col: number; momentId?: number }[]>([])

  // 初始化游戏
  useEffect(() => {
    if (savedProgress) {
      // 如果有保存的进度，则恢复进度
      setGrid(savedProgress.grid)
      setFlagsLeft(savedProgress.flagsLeft)
      setFirstClick(savedProgress.firstClick)

      // 收集地雷位置
      const positions: { row: number; col: number; momentId?: number }[] = []
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          if (savedProgress.grid[i][j].isMine) {
            positions.push({
              row: i,
              col: j,
              momentId: savedProgress.grid[i][j].momentId,
            })
          }
        }
      }
      setMinePositions(positions)
    } else {
      // 否则初始化新游戏
      initializeGrid()
    }
  }, [savedProgress])

  // 添加一键通关功能
  useEffect(() => {
    const handleSecretWin = () => {
      if (gameOver) return
      forceWin()
    }

    window.addEventListener("secretWin", handleSecretWin)
    return () => {
      window.removeEventListener("secretWin", handleSecretWin)
    }
  }, [gameOver, grid])

  const initializeGrid = () => {
    const newGrid: Cell[][] = []

    // 创建空网格
    for (let i = 0; i < rows; i++) {
      newGrid.push([])
      for (let j = 0; j < cols; j++) {
        newGrid[i].push({
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          adjacentMines: 0,
        })
      }
    }

    setGrid(newGrid)
    setGameOver(false)
    setFlagsLeft(mineCount)
    setFirstClick(true)
    setMinePositions([])
  }

  // 一键通关功能
  const forceWin = () => {
    if (firstClick) {
      // 如果是第一次点击，先放置地雷
      const newGrid = placeMines([...grid], -1, -1)
      setGrid(newGrid)
      setFirstClick(false)
    }

    // 标记所有地雷
    const newGrid = [...grid]
    const positions: { row: number; col: number; momentId?: number }[] = []

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (newGrid[i][j].isMine) {
          newGrid[i][j].isFlagged = true
          positions.push({
            row: i,
            col: j,
            momentId: newGrid[i][j].momentId,
          })
        } else {
          newGrid[i][j].isRevealed = true
        }
      }
    }

    setGrid(newGrid)
    setFlagsLeft(0)
    setGameOver(true)
    onGameWon(positions)
  }

  // 在第一次点击后放置地雷 - 增加难度
  const placeMines = (grid: Cell[][], firstRow: number, firstCol: number) => {
    let minesPlaced = 0
    const newGrid = [...grid]
    const positions: { row: number; col: number; momentId?: number }[] = []

    // 确保有足够的空间放置地雷
    const totalCells = rows * cols
    const safeCells = firstRow >= 0 ? 9 : 0 // 第一次点击周围的安全区域
    const availableCells = totalCells - safeCells

    if (mineCount > availableCells) {
      console.warn(`地雷数量(${mineCount})超过了可用格子数(${availableCells})，将减少地雷数量`)
    }

    const actualMineCount = Math.min(mineCount, availableCells)

    // 创建一个更集中的区域放置地雷，提高难度
    // 将网格分成几个区域，每个区域放置一定数量的地雷
    const numRegions = 4 // 分成4个区域
    const minesPerRegion = Math.ceil(actualMineCount / numRegions)
    const regionWidth = Math.floor(rows / 2)
    const regionHeight = Math.floor(cols / 2)

    const regions = [
      { startRow: 0, endRow: regionHeight, startCol: 0, endCol: regionWidth },
      { startRow: 0, endRow: regionHeight, startCol: regionWidth, endCol: cols },
      { startRow: regionHeight, endRow: rows, startCol: 0, endCol: regionWidth },
      { startRow: regionHeight, endRow: rows, startCol: regionWidth, endCol: cols },
    ]

    // 在每个区域放置地雷
    for (let r = 0; r < numRegions && minesPlaced < actualMineCount; r++) {
      const region = regions[r]
      let regionMinesPlaced = 0

      // 在当前区域尝试放置指定数量的地雷
      while (regionMinesPlaced < minesPerRegion && minesPlaced < actualMineCount) {
        const randomRow = Math.floor(Math.random() * (region.endRow - region.startRow)) + region.startRow
        const randomCol = Math.floor(Math.random() * (region.endCol - region.startCol)) + region.startCol

        // 确保不在第一次点击的位置及其周围放置地雷
        if (
          !newGrid[randomRow][randomCol].isMine &&
          (firstRow < 0 || Math.abs(randomRow - firstRow) > 1 || Math.abs(randomCol - firstCol) > 1)
        ) {
          newGrid[randomRow][randomCol].isMine = true
          newGrid[randomRow][randomCol].momentId = minesPlaced // 为每个地雷分配一个唯一的momentId
          positions.push({ row: randomRow, col: randomCol, momentId: minesPlaced })
          minesPlaced++
          regionMinesPlaced++
        }
      }
    }

    // 如果还有剩余的地雷没有放置，随机放置
    while (minesPlaced < actualMineCount) {
      const randomRow = Math.floor(Math.random() * rows)
      const randomCol = Math.floor(Math.random() * cols)

      if (
        !newGrid[randomRow][randomCol].isMine &&
        (firstRow < 0 || Math.abs(randomRow - firstRow) > 1 || Math.abs(randomCol - firstCol) > 1)
      ) {
        newGrid[randomRow][randomCol].isMine = true
        newGrid[randomRow][randomCol].momentId = minesPlaced
        positions.push({ row: randomRow, col: randomCol, momentId: minesPlaced })
        minesPlaced++
      }
    }

    // 保存地雷位置
    setMinePositions(positions)
    setFlagsLeft(actualMineCount)

    // 计算每个格子周围的地雷数
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (!newGrid[i][j].isMine) {
          let count = 0
          // 检查周围8个方向
          for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
              if (di === 0 && dj === 0) continue
              const ni = i + di
              const nj = j + dj
              if (ni >= 0 && ni < rows && nj >= 0 && nj < cols && newGrid[ni][nj].isMine) {
                count++
              }
            }
          }
          newGrid[i][j].adjacentMines = count
        }
      }
    }

    return newGrid
  }

  // 揭示格子
  const revealCell = (row: number, col: number) => {
    if (gameOver || grid[row][col].isRevealed || grid[row][col].isFlagged) {
      return
    }

    const newGrid = [...grid]

    // 第一次点击
    if (firstClick) {
      const gridWithMines = placeMines(newGrid, row, col)
      setGrid(gridWithMines)
      setFirstClick(false)

      // 继续处理当前点击
      revealCellRecursive(gridWithMines, row, col)
      return
    }

    // 如果点击到地雷
    if (newGrid[row][col].isMine) {
      setGameOver(true)
      // 传递当前游戏进度
      onGameLost({
        grid: newGrid,
        flagsLeft,
        firstClick,
      })
      return
    }

    revealCellRecursive(newGrid, row, col)
  }

  // 递归揭示空白格子
  const revealCellRecursive = (grid: Cell[][], row: number, col: number) => {
    if (row < 0 || row >= rows || col < 0 || col >= cols || grid[row][col].isRevealed || grid[row][col].isFlagged) {
      return
    }

    grid[row][col].isRevealed = true

    // 如果是空白格子，递归揭示周围的格子
    if (grid[row][col].adjacentMines === 0) {
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (i === 0 && j === 0) continue
          revealCellRecursive(grid, row + i, col + j)
        }
      }
    }

    // 检查是否获胜
    checkWinCondition(grid)

    setGrid([...grid])
  }

  // 标记/取消标记格子
  const toggleFlag = (row: number, col: number, e: React.MouseEvent) => {
    e.preventDefault() // 阻止右键菜单

    if (gameOver || grid[row][col].isRevealed) {
      return
    }

    const newGrid = [...grid]

    if (newGrid[row][col].isFlagged) {
      newGrid[row][col].isFlagged = false
      setFlagsLeft(flagsLeft + 1)
    } else if (flagsLeft > 0) {
      newGrid[row][col].isFlagged = true
      setFlagsLeft(flagsLeft - 1)
    }

    setGrid(newGrid)

    // 检查是否获胜
    checkWinCondition(newGrid)
  }

  // 检查是否获胜 - 修改为只有全部标记正确才算胜利
  const checkWinCondition = (grid: Cell[][]) => {
    // 检查所有非地雷格子是否都已揭示
    let allNonMinesRevealed = true
    let allMinesFlagged = true

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (!grid[i][j].isMine && !grid[i][j].isRevealed) {
          allNonMinesRevealed = false
        }
        if (grid[i][j].isMine && !grid[i][j].isFlagged) {
          allMinesFlagged = false
        }
      }
    }

    // 只有当所有非地雷格子都已揭示，或者所有地雷都已标记时，才算胜利
    if (allNonMinesRevealed || allMinesFlagged) {
      setGameOver(true)

      // 收集所有地雷位置，包括momentId
      const positions = []
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          if (grid[i][j].isMine) {
            positions.push({
              row: i,
              col: j,
              momentId: grid[i][j].momentId || 0,
            })
          }
        }
      }

      onGameWon(positions)
    }
  }

  // 获取格子显示内容
  const getCellContent = (cell: Cell) => {
    if (cell.isFlagged) {
      return <Flag className="h-4 w-4 text-[#5966ff]" />
    }

    if (!cell.isRevealed) {
      return null
    }

    if (cell.isMine) {
      return <Heart className="h-4 w-4 text-[#ff7aa8]" />
    }

    return cell.adjacentMines === 0 ? null : cell.adjacentMines
  }

  // 获取格子样式
  const getCellAppearance = (cell: Cell) => {
    if (!cell.isRevealed) {
      if (cell.isFlagged) {
        return "bg-[#e1e5ff] border-[#c9d2ff] shadow-inner hover:bg-[#d9dfff]"
      }
      return "bg-[#f6f7ff] hover:bg-[#e9ecff]"
    }

    if (cell.isMine) {
      return "bg-[#ffe5ef] border-[#ffd1e0]"
    }

    return "bg-white border-[#e3e6ff]"
  }

  // 获取数字颜色
  const getNumberColor = (num: number) => {
    const colors = [
      "", // 0 - 空白
      "text-[#4b5cf5]", // 1
      "text-[#2b8b7d]", // 2
      "text-[#f56599]", // 3
      "text-[#6b46c1]", // 4
      "text-[#c05621]", // 5
      "text-[#2a8ca4]", // 6
      "text-[#2f3657]", // 7
      "text-[#6b6f96]", // 8
    ]

    return colors[num] || ""
  }

  return (
    <div className="w-full rounded-[36px] border border-white/70 bg-white/95 p-6 shadow-[0_35px_80px_rgba(120,136,255,0.25)] backdrop-blur-sm sm:p-10">
      <div className="flex flex-col gap-4 text-[#4a4fd3] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center text-xl font-semibold text-[#4d55d9]">
            <Heart className="mr-2 h-5 w-5 text-[#6f77ff]" />
            剩余小事: <span className="ml-1 font-bold">{flagsLeft}</span>
          </div>
          <p className="text-sm text-[#8a90c3]">记得插旗标记所有的小事，全部点亮即可解锁内容</p>
        </div>
        <button
          onClick={initializeGrid}
          className="inline-flex items-center justify-center rounded-2xl bg-[#6a6fff] px-6 py-2.5 text-base font-semibold text-white shadow-[0_18px_30px_rgba(98,103,255,0.35)] transition hover:bg-[#5b61f5]"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          重新开始
        </button>
      </div>

      <div className="mx-auto mt-8 w-full max-w-[920px] rounded-[32px] border border-[#e4e8ff] bg-gradient-to-b from-[#f4f6ff] to-[#e0e6ff] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
        <div className="rounded-[26px] border border-[#cfd4ff] bg-[#dfe4ff] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
          <div
            className="grid aspect-square w-full gap-[2.5px] rounded-[20px] bg-[#aebdff]/70 p-3 select-none"
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}
          >
            {grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  className={`flex items-center justify-center rounded-[6px] border border-white/70 text-sm font-semibold text-[#3b436f] transition-all duration-150 ${getCellAppearance(cell)} ${
                    typeof getCellContent(cell) === "number" ? getNumberColor(getCellContent(cell) as number) : ""
                  }`}
                  onClick={() => revealCell(rowIndex, colIndex)}
                  onContextMenu={(e) => toggleFlag(rowIndex, colIndex, e)}
                  disabled={gameOver}
                >
                  {getCellContent(cell)}
                </button>
              )),
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
