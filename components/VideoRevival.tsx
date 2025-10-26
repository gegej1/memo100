"use client"

import { useState, useRef, useEffect } from "react"
import { Play, RefreshCw } from "lucide-react"

interface VideoRevivalProps {
  onRevival: () => void
  onRestart: () => void
  playedVideoIndexes: number[]
  onVideoPlayed: (videoIndex: number) => void
}

export default function VideoRevival({ onRevival, onRestart, playedVideoIndexes, onVideoPlayed }: VideoRevivalProps) {
  const [showVideo, setShowVideo] = useState(false)
  const [videoEnded, setVideoEnded] = useState(false)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(-1)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // 视频ID列表
  const allVideoIds = [
    "1ehrKvIRyXhG1WEp_jicmJ93XYfjM2F30", // 第一个视频
    "1Q3Vxd8v_6wMJfGx6Q1M1LKSM2bOphDvj", // 第二个视频
    "1B0bBZsUZZ5jJCyvdXMLxNHnaCna35Ofd", // 第三个视频
    "1MA-uDzRLhqmA2l9hPpoRr2hVX__OiSxq", // 第四个视频
    "1YRz0_Q9D8aXmTYakOFNDeqtLlJET04uh", // 第五个视频
    "1ZYXZjyPNScYEpBeVQMVaxV1LbOYNpSBE", // 第六个视频
    "1doaBEYqqf2IxhWCLXkJCtAxzA33T8-MQ", // 第七个视频
    "1syWNpbIQa0YR-BLruw1ApY4nSK7ytSIV", // 第八个视频
  ]

  // 智能选择视频：优先选择未播放的视频
  const selectVideo = () => {
    // 获取未播放的视频索引
    const unplayedIndexes = []
    for (let i = 0; i < allVideoIds.length; i++) {
      if (!playedVideoIndexes.includes(i)) {
        unplayedIndexes.push(i)
      }
    }

    let selectedIndex
    if (unplayedIndexes.length > 0) {
      // 如果有未播放的视频，从中随机选择
      const randomIndex = Math.floor(Math.random() * unplayedIndexes.length)
      selectedIndex = unplayedIndexes[randomIndex]
    } else {
      // 如果所有视频都播放过了，完全随机选择
      selectedIndex = Math.floor(Math.random() * allVideoIds.length)
    }

    return selectedIndex
  }

  // 选择视频
  useEffect(() => {
    if (showVideo && currentVideoIndex === -1) {
      const selectedIndex = selectVideo()
      setCurrentVideoIndex(selectedIndex)
    }
  }, [showVideo, currentVideoIndex, playedVideoIndexes])

  // 创建嵌入链接
  const getEmbedUrl = () => {
    if (currentVideoIndex >= 0 && currentVideoIndex < allVideoIds.length) {
      return `https://drive.google.com/file/d/${allVideoIds[currentVideoIndex]}/preview`
    }
    return null
  }

  const handleWatchVideo = () => {
    setShowVideo(true)
  }

  // 监听视频播放状态
  useEffect(() => {
    if (!showVideo || currentVideoIndex === -1) return

    // 设置一个定时器，在视频播放一段时间后允许复活
    const timer = setTimeout(() => {
      setVideoEnded(true)
      // 记录这个视频已经播放过
      onVideoPlayed(currentVideoIndex)
    }, 15000) // 15秒后允许复活

    return () => clearTimeout(timer)
  }, [showVideo, currentVideoIndex, onVideoPlayed])

  const handleRevivalClick = () => {
    if (videoEnded) {
      onRevival()
    }
  }

  // 重置组件状态（当组件重新挂载时）
  useEffect(() => {
    setShowVideo(false)
    setVideoEnded(false)
    setCurrentVideoIndex(-1)
  }, [])

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      {!showVideo ? (
        <>
          <h2 className="text-2xl font-bold text-center mb-4 text-red-600">你踩到了地雷！</h2>

          <div className="flex flex-col space-y-4">
            <button
              onClick={handleWatchVideo}
              className="px-4 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition flex items-center justify-center"
            >
              <Play className="mr-2 h-5 w-5" />
              观看视频复活
            </button>
            <button
              onClick={onRestart}
              className="px-4 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition flex items-center justify-center"
            >
              <RefreshCw className="mr-2 h-5 w-5" />
              重新开始游戏
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center">
          <h3 className="text-xl font-semibold mb-2 text-indigo-600">观看视频以复活</h3>

          <div className="w-full rounded-lg overflow-hidden shadow-lg bg-black aspect-video mb-4">
            {currentVideoIndex >= 0 && (
              <iframe
                ref={iframeRef}
                src={getEmbedUrl()}
                className="w-full h-full"
                allow="autoplay"
                allowFullScreen
              ></iframe>
            )}
          </div>

          <div className="mt-2 text-center">
            {videoEnded ? (
              <button
                onClick={handleRevivalClick}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                点击复活
              </button>
            ) : (
              <p className="text-sm text-gray-600">请观看视频后复活...</p>
            )}
          </div>

          <button
            onClick={onRestart}
            className="mt-4 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
          >
            跳过视频，重新开始
          </button>
        </div>
      )}
    </div>
  )
}
