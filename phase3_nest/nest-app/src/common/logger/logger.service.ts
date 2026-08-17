// src/common/logger/logger.service.ts
import { Injectable } from '@nestjs/common'
import pino from 'pino'
import { RequestContextService } from '../context/request-context.service'

@Injectable()
export class LoggerService {
  private readonly logger: pino.Logger

  constructor(private readonly context: RequestContextService) {
    this.logger = pino({
      level: 'info',
      // ★ 全关灵魂:mixin——pino 每打一行日志都会先调这个函数,
      //   返回的对象被【合并进这行日志的字段】。
      //   它从 ALS 行李箱里掏 requestId → 业务代码一行都不用管,每条日志自动带身份
      mixin: () => {
        const requestId = this.context.getRequestId()
        return requestId ? { requestId } : {}
      },
    })
  }

  info(msg: string, extra?: Record<string, unknown>) { this.logger.info(extra ?? {}, msg) }
  warn(msg: string, extra?: Record<string, unknown>) { this.logger.warn(extra ?? {}, msg) }
  error(msg: string, extra?: Record<string, unknown>) { this.logger.error(extra ?? {}, msg) }
}