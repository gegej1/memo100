export default function GameRules() {
  return (
    <section className="rounded-[32px] border border-white/70 bg-[#dee5ff]/90 p-6 text-base text-[#5960a6] shadow-[0_28px_70px_rgba(132,146,255,0.25)] sm:p-8">
      <h3 className="text-xl font-semibold text-[#6067da]">游戏规则</h3>
      <ul className="mt-4 list-disc space-y-2 rounded-[24px] bg-white/70 p-6 pl-8 text-[#5b6197] shadow-[0_15px_35px_rgba(122,137,255,0.15)]">
        <li>左键点击格子来揭开它。</li>
        <li>右键点击格子来插旗标记"小事"。</li>
        <li>标错可以再次右键取消，不会立即失败。</li>
        <li>直接点到含有"小事"的格子会立刻失败。</li>
        <li>目标：揭开所有安全格子并标记出所有小事。</li>
        <li>全部完成后，标记的小事会解锁为闪卡，可以翻阅内容。</li>
      </ul>
      <p className="mt-5 rounded-2xl bg-white/70 px-5 py-3 text-sm text-[#5a61c8] shadow-[0_12px_30px_rgba(122,137,255,0.12)]">
        <span className="font-semibold text-[#5c61ff]">提示：</span>键盘输入"win"可以快速通关（仅限测试）
      </p>
    </section>
  )
}
