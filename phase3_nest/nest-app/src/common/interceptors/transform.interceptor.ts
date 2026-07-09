import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from "@nestjs/common";
import {Observable} from "rxjs"
import { tap, map } from "rxjs";

@Injectable()
export class TransformInterceptor implements NestInterceptor {
    private readonly logger = new Logger(TransformInterceptor.name)

    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const ctx = context.switchToHttp()
        const request = ctx.getRequest<Request>() // 填类型
        const time = Date.now()

        return next.handle().pipe(
            tap(() => {
                this.logger.log(`${request.method} ${request.url} - ${Date.now() - time}ms`)
            }),
            map((data) => ({
                code: 200,
                message: "success",
                data
            }))
        )
    }
}