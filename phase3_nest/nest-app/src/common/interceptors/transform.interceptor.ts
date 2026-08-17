import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import {Observable} from "rxjs"
import { tap, map } from "rxjs";
import { LoggerService } from "../logger/logger.service";
import { MetricsService } from '../metrics/metrics.service';
import { Request } from 'express'
@Injectable()
export class TransformInterceptor implements NestInterceptor {
    constructor(
        private readonly logger: LoggerService,
        private readonly metrics: MetricsService
    ) {}

    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const ctx = context.switchToHttp()
        const request = ctx.getRequest<Request>() // 填类型
        const time = Date.now()
        const route = request.route?.path ?? request.url.split('?')[0]

        return next.handle().pipe(
            tap(() => {
                this.logger.info('HTTP请求完成', {name: TransformInterceptor.name, method: request.method, url: request.url, duration: Date.now() - time })
                try {
                    this.metrics.requestsTotal.inc({method: request.method, route, code: '200'})
                    this.metrics.requestDuration.observe({method: request.method, route}, Date.now() - time)
                } catch (error) {
                    this.logger.warn('监控打点失败', { url: request.url })
                }
            }),
            map((data) => {
                if (request.url.startsWith('/metrics')) return data
                return { code: 200, message: "success", data }
            })
        )
    }
}