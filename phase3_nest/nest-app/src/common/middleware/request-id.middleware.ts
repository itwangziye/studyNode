import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { RequestContextService } from '../context/request-context.service';

// 发身份证中间件:每个请求一进来就分配 requestId,贯穿整个生命周期
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
    constructor(
        private readonly context: RequestContextService
    ) {}
  use(req: Request, res: Response, next: NextFunction) {
    // TODO 你来填,三步:
    // ① 优先从请求头 X-Request-Id 里读(上游服务/网关可能已经生成了,跨服务串联就靠它透传)
    //    提示:req.headers['x-request-id'],它的 TS 类型是 string | string[] | undefined,要处理
    // ② 没有才自己生成一张新身份证(关 52 lockToken 用过同款 API,回忆一下)
    // ③ 把它塞进【响应头】x-request-id —— 用户报障时,让他说出这个 ID,你就能定位他那次请求
    let requestId = req.headers['x-request-id'] || crypto.randomUUID();
    if (Array.isArray(requestId)) requestId = requestId[0];
    res.setHeader("x-request-id", requestId)
    this.context.run({requestId}, ()=> {
        next()
    })
  }
}