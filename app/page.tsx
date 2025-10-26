"use client"

import { useState, useEffect } from "react"
import Minesweeper from "@/components/Minesweeper"
import VideoRevival from "@/components/VideoRevival"
import FlashCards from "@/components/FlashCards"
import { flashCardTexts } from "@/data/flashCardTexts"
import GameRules from "@/components/GameRules"

export default function Home() {
  const [gameState, setGameState] = useState<"playing" | "lost" | "won" | "revival" | "flashcards">("playing")
  const [minePositions, setMinePositions] = useState<{ row: number; col: number; momentId?: number }[]>([])
  const [secretKey, setSecretKey] = useState("")
  const [gameProgress, setGameProgress] = useState<{
    grid: any[][]
    flagsLeft: number
    firstClick: boolean
  } | null>(null)

  // 添加视频播放记录状态
  const [playedVideoIndexes, setPlayedVideoIndexes] = useState<number[]>([])
  const totalVideoCount = 8 // 总视频数量

  // 确保地雷数量与小事数量一致
  const mineCount = flashCardTexts.length

  const handleGameLost = (currentProgress: any) => {
    // 保存当前游戏进度
    setGameProgress(currentProgress)
    // 每次死亡都进入复活状态，不再检查revivalUsed
    setGameState("revival")
  }

  const handleGameWon = (positions: { row: number; col: number; momentId?: number }[]) => {
    setMinePositions(positions)
    setGameState("flashcards")
  }

  const handleRevival = () => {
    setGameState("playing")
    // 复活时不重置游戏进度，保留之前的状态
  }

  const handleRestart = () => {
    setGameState("playing")
    setGameProgress(null) // 重新开始时重置游戏进度
    setPlayedVideoIndexes([]) // 重新开始时重置视频播放记录
  }

  // 视频播放完成后的回调
  const handleVideoPlayed = (videoIndex: number) => {
    setPlayedVideoIndexes((prev) => {
      const newPlayed = [...prev, videoIndex]
      // 如果所有视频都播放过了，重置记录
      if (newPlayed.length >= totalVideoCount) {
        return []
      }
      return newPlayed
    })
  }

  // 添加隐藏的一键通关功能
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 记录按键序列
      setSecretKey((prev) => {
        const newKey = prev + e.key
        // 检查是否包含"win"
        if (newKey.toLowerCase().includes("win")) {
          // 触发一键通关事件
          const event = new CustomEvent("secretWin")
          window.dispatchEvent(event)
          return ""
        }
        // 只保留最后5个按键
        return newKey.slice(-5)
      })
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-slate-100 font-sans text-gray-700">
      <header className="my-8 text-center">
        <h1 className="text-4xl font-bold text-indigo-600">我们的100件小事</h1>
        <p className="text-lg text-indigo-500 mt-2">来扫雷吧！成功以后即可解锁😉</p>
      </header>

      <div className="w-full max-w-2xl bg-white p-6 rounded-xl shadow-xl">
        {gameState === "playing" && (
          <>
            <Minesweeper
              onGameLost={handleGameLost}
              onGameWon={handleGameWon}
              mineCount={mineCount}
              gridSize={20} // 保持网格大小为20x20
              savedProgress={gameProgress} // 传递保存的游戏进度
            />
            <GameRules />
            {/* 隐藏的一键通关按钮 */}
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("secretWin"))}
                className="opacity-0 absolute w-4 h-4 cursor-default"
                aria-hidden="true"
              >
                一键通关
              </button>
            </div>
          </>
        )}

        {gameState === "revival" && (
          <VideoRevival
            onRevival={handleRevival}
            onRestart={handleRestart}
            playedVideoIndexes={playedVideoIndexes}
            onVideoPlayed={handleVideoPlayed}
          />
        )}

        {gameState === "lost" && (
          <div className="text-center p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-red-600 mb-4">游戏结束</h2>
            <p className="mb-4">很遗憾，你踩到了地雷！</p>
            <button
              onClick={handleRestart}
              className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition"
            >
              重新开始
            </button>
          </div>
        )}

        {gameState === "flashcards" && <FlashCards minePositions={minePositions} />}
      </div>

      <footer className="mt-8 text-center text-sm text-slate-500">
        <p>为小花特别制作 &copy; {new Date().getFullYear()}</p>
      </footer>
    </main>
  )
}
