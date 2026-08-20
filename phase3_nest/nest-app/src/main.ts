import 'dotenv/config'
import { NestFactory } from '@nestjs/core'
import { ValidationPipe, Logger } from '@nestjs/common'    // ← 要 import 什么?提示:校验管道 + 日志
import { AppModule } from './app.module'
import {SwaggerModule, DocumentBuilder} from '@nestjs/swagger'



async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // ① CORS:允许前端跨域(允许所有源)
  app.enableCors({origin: "*"})

  // ② ValidationPipe:全局校验 DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,              // 自动剔除多余字段
      forbidNonWhitelisted: true,   // 多余字段直接报错
      transform: true,              // 自动类型转换
      transformOptions: {
        enableImplicitConversion: true
      }
    })
  )

    const config = new DocumentBuilder()
        .setTitle('Task API')
        .setDescription('任务管理接口文档')
        .setVersion('1.0')
        .addBearerAuth()
        .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('api-docs', app, document)

  // ③ 启动
  const port = process.env.PORT ?? 3000
  await app.listen(port)

    // ⑤ 优雅停机:接管 SIGTERM,顺序 = 先排空在途请求,再关依赖(企业标准三步曲)
    const server = app.getHttpServer()            // 拿到底层 Node http server(Express 里面那颗)

    const shutdown = async (signal: string) => {
        console.log(`收到${signal}:停止接新连接,排空在途请求...`)
        server.close(async () => {                   // ① 不再接受新连接;等在途请求全部完成后才进这个回调
            console.log('在途请求已排空,关闭依赖(触发 onModuleDestroy 钩子链)...')
            await app.close()                          // ② 手动触发钩子链:Prisma/Redis/ES/MQ 依次断开
            process.exit(0)                            // ③ 干净退出
        })
        setTimeout(() => {                           // ④ 兜底:10秒排不完就强制退,不能比 K8s 宽限期(30s)还能拖
            console.error('排空超时,强制退出')
            process.exit(1)
        }, 10000).unref()                            // unref:这个定时器自己不阻止进程退出
    }

    process.on('SIGTERM', () => shutdown('SIGTERM'))   // kill / K8s 删 Pod
    process.on('SIGINT', () => shutdown('SIGINT'))     // Ctrl+C,同一个 handler


}

bootstrap()