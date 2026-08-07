/**
 * 关 47 并发基础 demo:单线程怎么并发?
 *
 * 模拟 3 个耗时的数据库查询(用 setTimeout 模拟 I/O 等待)
 * 观察:主线程不傻等,3 个查询"同时"进行,谁先完成谁先回调
 */

// 模拟一个耗时 1 秒的数据库查询
function fakeDbQuery(name: string, delay: number): Promise<string> {
    return new Promise((resolve) => {
        console.log(`[${name}] 发起查询,交给底层(主线程不傻等)`)
        setTimeout(() => {
            console.log(`[${name}] 查询完成(花了 ${delay}ms)`)
            resolve(`${name} 的数据`)
        }, delay)
    })
}

async function main() {
    console.log("=== 场景1:串行(await 一个等一个) ===")
    console.log("开始:", Date.now())
    const a = await fakeDbQuery("查询A", 1000)
    const b = await fakeDbQuery("查询B", 1000)
    const c = await fakeDbQuery("查询C", 1000)
    console.log("拿到:", a, b, c)
    console.log("结束:", Date.now())
    console.log("总耗时约 3 秒(1+1+1,串行)\n")

    console.log("=== 场景2:并发(Promise.all 同时发) ===")
    console.log("开始:", Date.now())
    // 三个查询同时发起,主线程不等单个完成
    const [x, y, z] = await Promise.all([
        fakeDbQuery("查询X", 1000),
        fakeDbQuery("查询Y", 1000),
        fakeDbQuery("查询Z", 1000),
    ])
    console.log("拿到:", x, y, z)
    console.log("结束:", Date.now())
    console.log("总耗时约 1 秒(三个并发,只等最慢那个)")
}

main()
