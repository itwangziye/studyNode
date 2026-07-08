import { createReadStream, createWriteStream } from "node:fs"
import { pipeline } from "node:stream/promises"
import { Transform } from "node:stream"

let lineCount = 0

const countLines = new Transform({
  transform(chunk: Buffer, _encoding, callback) {
    // 你的统计逻辑
    const text = chunk.toString();
    const lineMach = text.match(/\n/g);
    lineCount += lineMach ? lineMach.length : 0;
    callback(null, chunk)
  },
})

try {
  await pipeline(
    createReadStream("./phase1_core/lesson03_stream/big.log"),
    countLines,
    createWriteStream("./phase1_core/lesson03_stream/copy-big2.log"),
  )
  console.log(`复制完成,共 ${lineCount} 行`)   // ← 你刚才漏的
} catch (err) {
  console.error("复制失败:", err)
}