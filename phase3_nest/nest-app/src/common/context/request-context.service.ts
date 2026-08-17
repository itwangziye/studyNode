import { Injectable } from '@nestjs/common'
import { AsyncLocalStorage } from 'node:async_hooks'

export interface RequestContext {
  requestId: string
}

@Injectable()
export class RequestContextService {
  // TODO ① 造"行李箱机制":照 demo 里那行 new AsyncLocalStorage,类型参数换成 RequestContext
  //   放类的【实例属性】上,private readonly。
  //   ⚠️ 为什么不能每次调用时 new 一个?——箱子(机制)全局只有一个,箱里的【内容】才按执行流隔离;
  //   每次新建箱子 = 别的层读的是另一个空箱子,永远 undefined
  private readonly als = new AsyncLocalStorage<RequestContext>();

  // 开箱:中间件入口处调用。注意 next 在 run 回调【内部】执行——
  // 这条分界线决定了"整条下游链是否在箱子里"
  run(context: RequestContext, next: () => void): void {
    this.als.run(context, () => next())
  }

  // TODO ② 读箱:返回 requestId;箱外调用(启动阶段等)返回 undefined
  //   提示:this.als.getStore() 拿到 RequestContext | undefined,用 ?. 取字段
  getRequestId(): string | undefined {
    // 你来写
    return this.als.getStore()?.requestId
  }
}