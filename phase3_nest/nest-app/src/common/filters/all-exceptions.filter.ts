// ============================================================
// AllExceptionsFilter —— 全局异常过滤器
// 职责:把所有异常(无论内置还是未知)统一成 { code, message, data }
// ============================================================
import {
  ExceptionFilter,      // 过滤器接口,实现 catch() 方法即可
  Catch,                // 装饰器:声明这个过滤器捕获哪些异常
  ArgumentsHost,        // 执行上下文,能拿到 request/response(跨协议抽象)
  HttpException,        // NestJS 内置 HTTP 异常基类
  HttpStatus,           // HTTP 状态码枚举
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '../logger/logger.service';
import { MetricsService } from '../metrics/metrics.service';

/**
 * 统一响应格式契约:
 *   成功(由关17的拦截器负责): { code: 200, message: 'success', data: {...} }
 *   失败(由本过滤器负责):    { code: <httpStatus>, message: '...', data: null }
 *
 * 前端只需一套解析逻辑: 看 code === 200 决定成功/失败
 */

// @Catch() 空括号 = 捕获【所有】异常
// 对比 @Catch(HttpException) 只捕获 HTTP 异常,未知错误会漏给框架默认处理(500 + 泄露)
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {

  constructor(
    private readonly logger: LoggerService,
    private readonly metrics: MetricsService
  ) {}

  // exception: 实际抛出的异常对象(unknown 类型,要先 instanceof 判断)
  // host:      执行上下文,能拿到 request/response(因为 NestJS 不绑定具体协议)
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();        // 切到 HTTP 协议上下文
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // ① 分类处理:提取状态码 + 友好消息
    let status: number;
    let message: string;

   

    if (exception instanceof HttpException) {
      // —— 已知异常:NestJS 内置异常(NotFoundException/BadRequestException/...)
      status = exception.getStatus();
      const res = exception.getResponse();
      //getResponse() 返回值有两种形态:
      //   ① 字符串: throw new HttpException('msg', 400) → 直接是 'msg'
      //   ② 对象:   内置子类 → { statusCode, message, error }
      //             DTO 校验失败时 message 是数组 ["title must be a string"]
      message =
        typeof res === 'string'
          ? res
          : Array.isArray((res as any).message)
            ? (res as any).message.join('; ')   // 校验错误数组合并成一句
            : (res as any).message || exception.message;

      this.logger.warn("请求异常-已知", { method: request.method, url: request.url, status, message })
    } else {
      // —— 未知异常:DB 连接断开、JSON.parse 失败、代码 bug...
      // 绝不把内部错误细节(堆栈/SQL)泄露给客户端!这是安全红线
      status = HttpStatus.INTERNAL_SERVER_ERROR; // 500
      message = '服务器内部错误,请稍后重试';
      // 详细错误写日志(服务端可见),方便排查
      this.logger.error("请求异常", {
        method: request.method,
        url: request.url,
        status,
        message,
        err: exception instanceof Error ? exception.stack : String(exception)   // ← 加回这行
      })
    }


    try {
        const route = request.route?.path ?? request.url.split('?')[0]   // 和拦截器同一套路由模板
        this.metrics.requestsTotal.inc({ method: request.method, route, code: String(status) })
    } catch {
        this.logger.warn('监控打点失败', { url: request.url })            // 老规矩:打点死了业务不能死
    }

    // ② 输出统一格式(注意 code 用 HTTP 状态码,和 status 一致)
    response.status(status).json({
      code: status,
      message,
      data: null,
    });
  }
}
