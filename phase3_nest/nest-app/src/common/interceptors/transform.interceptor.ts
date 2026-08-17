import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from "@nestjs/common";
import {Observable} from "rxjs"
import { tap, map } from "rxjs";
import { LoggerService } from "../logger/logger.service";

@Injectable()
export class TransformInterceptor implements NestInterceptor {
    constructor(
        private readonly logger: LoggerService
    ) {}

    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const ctx = context.switchToHttp()
        const request = ctx.getRequest<Request>() // 填类型
        const time = Date.now()

        return next.handle().pipe(
            tap(() => {
                this.logger.info('HTTP请求完成', {name: TransformInterceptor.name, method: request.method, url: request.url, duration: Date.now() - time })
            }),
            map((data) => ({
                code: 200,
                message: "success",
                data
            }))
        )
    }
}