import EventEmitter from "node:events"

class Downloader extends EventEmitter {
    private fileName: string

    constructor(fileName: string) {
        super()
        this.fileName = fileName;
    }
    async start() {
        // 模拟下载:从 0% 到 100%,每隔 100ms 涨 10%
        // 在关键节点 emit 事件:
        //   - 每涨 10% → emit "progress",传入当前百分比
        //   - 到 100%  → emit "done",传入文件名
        //   - (隐藏考点)如果 fileName 是空字符串 → emit "error",抛个错误
        if (this.fileName === "") {
            this.emit("error", new Error("文件名不能为空"))
            return   // 注意 return,不然还会继续往下跑
        }
       // 模拟下载循环
        for (let percent = 10; percent <= 100; percent += 10) {
            await new Promise(resolve => setTimeout(resolve, 100))   // 等 100ms
            this.emit("progress", percent)                            // 报进度
        }
        this.emit("done", this.fileName)                            // 完成
    }
    
}


const dl = new Downloader("movie.mp4")

dl.on("progress", (percent: number) => {
  console.log(`下载中... ${percent}%`)
})

dl.on("done", (name: string) => {
  console.log(`✅ ${name} 下载完成!`)
})

dl.on("error", (err: Error) => {
  console.error(`❌ 下载失败:`, err.message)
})

await dl.start()