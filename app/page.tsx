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
    <main className="relative min-h-screen overflow-hidden bg-[#eef3ff] px-4 py-12 text-[#4b5592] sm:py-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-1/2 top-[-120px] h-[360px] w-[720px] -translate-x-1/2 rounded-[320px] bg-gradient-to-b from-white via-white/70 to-transparent blur-3xl" />
        <div className="absolute left-[-80px] top-32 h-64 w-64 rounded-full bg-[#d9e4ff] blur-[120px]" />
        <div className="absolute right-[-40px] bottom-10 h-72 w-72 rounded-full bg-[#d0e8ff] blur-[150px]" />
      </div>
      <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center gap-10">
        <header className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-[#4f55ff] sm:text-[48px]">我们的100件小事</h1>
          <p className="mt-3 text-lg font-medium text-[#7c84bd]">来扫雷吧！成功以后即可解锁😉</p>
        </header>

        <div className="w-full space-y-8">
          {gameState === "playing" && (
            <>
              <Minesweeper
                onGameLost={handleGameLost}
                onGameWon={handleGameWon}
                mineCount={mineCount}
                gridSize={20}
                savedProgress={gameProgress}
              />
              <GameRules />
              {/* 隐藏的一键通关按钮 */}
              <div className="sr-only">
                <button onClick={() => window.dispatchEvent(new CustomEvent("secretWin"))}>一键通关</button>
              </div>
            </>
          )}

          {gameState === "revival" && (
            <div className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-[0_35px_60px_rgba(120,136,255,0.2)]">
              <VideoRevival
                onRevival={handleRevival}
                onRestart={handleRestart}
                playedVideoIndexes={playedVideoIndexes}
                onVideoPlayed={handleVideoPlayed}
              />
            </div>
          )}

          {gameState === "lost" && (
            <div className="rounded-[32px] border border-white/70 bg-white/95 p-8 text-center shadow-[0_35px_80px_rgba(255,128,160,0.25)]">
              <h2 className="text-2xl font-bold text-[#ff6b81]">游戏结束</h2>
              <p className="mb-6 mt-3 text-[#7a7ea8]">很遗憾，你踩到了地雷！再来一次吧～</p>
              <button
                onClick={handleRestart}
                className="rounded-2xl bg-[#5c6bff] px-6 py-3 font-semibold text-white shadow-[0_12px_30px_rgba(92,107,255,0.35)] transition hover:bg-[#505ceb]"
              >
                重新开始
              </button>
            </div>
          )}

          {gameState === "flashcards" && (
            <div className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-[0_35px_60px_rgba(120,136,255,0.2)]">
              <FlashCards minePositions={minePositions} />
            </div>
          )}
        </div>

        <footer className="pb-6 text-center text-sm font-semibold text-[#7580b3]">
          <p>为小花特别制作 · © {new Date().getFullYear()}</p>
        </footer>
      </div>
    </main>
  )
}
