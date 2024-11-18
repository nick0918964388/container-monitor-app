export function TimeDisplay() {
  return (
    <span suppressHydrationWarning>
      {new Date().toLocaleTimeString('zh-CN')}
    </span>
  )
} 