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
}

bootstrap()