export default function GameRules() {
  return (
    <div className="mt-4 text-sm text-gray-600 bg-indigo-100 p-4 rounded-md">
      <h3 className="font-semibold text-indigo-500 mb-2">游戏规则:</h3>
      <ul className="list-disc list-inside space-y-1">
        <li>左键点击格子来揭开它。</li>
        <li>右键点击格子来插旗标记"小事"。</li>
        <li>错误地标记非"小事"格子不会导致游戏失败，可以再次右键取消标记。</li>
        <li>直接点击含有"小事"的方块会导致游戏失败。</li>
        <li>目标：揭开所有安全格子并标记出所有小事。</li>
        <li>成功后，所有标记的小事会变成可点击的卡片，翻开查看内容。</li>
      </ul>
      <p className="mt-2 text-xs text-indigo-600">
        <strong>提示：</strong> 键盘输入"win"可以快速通关（仅用于测试）
      </p>
    </div>
  )
}
