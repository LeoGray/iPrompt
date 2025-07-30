export function HomePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">欢迎使用 iPrompt</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-card rounded-lg border">
          <h2 className="text-xl font-semibold mb-3">快速开始</h2>
          <p className="text-muted-foreground">
            创建、管理和组织您的 Prompt 集合，支持版本控制和智能搜索。
          </p>
        </div>
        <div className="p-6 bg-card rounded-lg border">
          <h2 className="text-xl font-semibold mb-3">跨平台支持</h2>
          <p className="text-muted-foreground">
            同时支持 Web 和桌面端，数据实时同步，随时随地访问您的 Prompt。
          </p>
        </div>
      </div>
    </div>
  )
}