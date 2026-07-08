import { readdir, mkdir, rename, stat } from "node:fs/promises"
import { join } from "node:path"   // join 用来拼路径,跨平台安全

const SRC_DIR = "."
const ARCHIVE_DIR = "./archive"

// 1. 读目录,过滤出 .log 文件
// 2. 如果没有,打印提示并退出
// 3. 确保 archive 目录存在(mkdir 时加 recursive:true,已存在不报错)
// 4. 循环 rename 每个文件到 archive/ 下
// 5. 打印归档结果

try {
    const dirs = await readdir(SRC_DIR)
    const logDirs: string[] = [];

    for (const item of dirs) {
        if (item.endsWith('.log')) {
            const st = await stat(join(SRC_DIR, item))
            if (st.isFile()) {
                logDirs.push(item)
            }
        }
    }

    console.log(logDirs)

    if (logDirs && logDirs.length) {
        await mkdir(ARCHIVE_DIR, { recursive: true },)
        for (let i = 0; i < logDirs.length; i++) {
            const item = logDirs[i] as string;
            await rename(join('./', item), join(ARCHIVE_DIR, item))
            console.log(`已归档: ${item}`)
        }
    } else {
        console.log('没有.log文件')
    }
} catch (error) {
    console.log(error)
}


