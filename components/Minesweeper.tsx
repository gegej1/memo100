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
      return <Flag className="w-4 h-4 text-indigo-700" />
    }

    if (!cell.isRevealed) {
      return null
    }

    if (cell.isMine) {
      return <Heart className="w-4 h-4 text-red-500" />
    }

    return cell.adjacentMines === 0 ? null : cell.adjacentMines
  }

  // 获取格子颜色
  const getCellColor = (cell: Cell) => {
    if (!cell.isRevealed) {
      return "bg-indigo-100 hover:bg-indigo-200"
    }

    if (cell.isMine) {
      return "bg-red-500"
    }

    return "bg-slate-100"
  }

  // 获取数字颜色
  const getNumberColor = (num: number) => {
    const colors = [
      "", // 0 - 空白
      "text-blue-600", // 1
      "text-green-600", // 2
      "text-red-600", // 3
      "text-purple-800", // 4
      "text-yellow-600", // 5
      "text-teal-600", // 6
      "text-black", // 7
      "text-gray-600", // 8
    ]

    return colors[num] || ""
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <div className="text-lg font-bold flex items-center text-indigo-700">
          <Heart className="w-5 h-5 mr-2" />
          剩余小事: {flagsLeft}
        </div>
        <button
          onClick={initializeGrid}
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center transition-colors duration-150"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          重新开始
        </button>
      </div>

      {/* 修复布局问题，确保是正方形 */}
      <div className="relative w-full pb-[100%]">
        <div
          className="absolute top-0 left-0 w-full h-full grid gap-0.5 bg-indigo-200 p-1 rounded-md shadow-inner select-none"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}
        >
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                className={`w-full h-full flex items-center justify-center font-bold ${getCellColor(cell)} ${
                  typeof getCellContent(cell) === "number" ? getNumberColor(getCellContent(cell) as number) : ""
                } transition-colors duration-200`}
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
  )
}
