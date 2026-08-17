// ALS 对照实验:两个请求交错执行,全局变量 vs AsyncLocalStorage 的命运对比
// 运行:pnpm lesson phase3_nest/als-demo.ts
import { AsyncLocalStorage } from 'node:async_hooks'

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

// ===== 对照组:全局变量(经典的"串了") =====
let globalName = ''
async function globalRequest(name: string) {
  globalName = name                                        // 写公共位置
  console.log(`[全局变量版] ${name} 进来,写入 ${globalName}`)
  await sleep(50)                                          // 模拟查库,让出主线程
  // 让出期间别人进来覆盖了公共位置
  console.log(`[全局变量版] ${name} await回来,读到 ${globalName}`,
    globalName === name ? '✅' : '❌ 被别人覆盖了!')
}

// ===== 实验组:ALS(各拿各的) =====
const als = new AsyncLocalStorage<{ name: string }>()
async function alsRequest(name: string) {
  als.run({ name }, async () => {                          // 开自己的箱
    console.log(`[ALS版] ${name} 进来,开箱 ${JSON.stringify(als.getStore())}`)
    await sleep(50)                                        // 同样让出主线程
    console.log(`[ALS版] ${name} await回来,读到 ${JSON.stringify(als.getStore())}`,
      als.getStore()?.name === name ? '✅ 还是自己的' : '❌')
  })
}

async function main() {
  console.log('--- 全局变量版:A、B 并发交错 ---')
  await Promise.all([globalRequest('请求A'), globalRequest('请求B')])
  console.log('--- ALS版:A、B 并发交错 ---')
  await Promise.all([alsRequest('请求A'), alsRequest('请求B')])
}
main()
