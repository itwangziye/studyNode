import { Injectable } from '@nestjs/common'
import { Counter, Histogram, Registry, collectDefaultMetrics } from 'prom-client'

@Injectable()
export class MetricsService {
  // 注册表:所有指标登记在这,/metrics 接口从这导出文本
  readonly registry = new Registry()

  // TODO ① 请求总数计数器(撑起 RED 里的 Rate 和 Error)
  //   名字:http_requests_total(help 随便写句中文)
  //   labelNames:['method', 'route', 'code'] —— 为什么带 code 你想想要怎么算错误率
  //   形状:new Counter({ name, help, labelNames, registers: [this.registry] })
  readonly requestsTotal: Counter<string> = new Counter({
    name: "http_requests_total",
    help: '请求总数计数器',
    labelNames: ['method', 'route', 'code'],
    registers: [this.registry]
  })

  // TODO ② 请求耗时直方图(Duration)
  //   名字:http_request_duration_seconds
  //   buckets:[5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000](单位毫秒,和 observe 的值保持一致)
  //   形状:new Histogram({ name, help, buckets, registers: [this.registry] })
  readonly requestDuration: Histogram<string> = new Histogram({
    name: "http_request_duration_seconds",
    help: "请求耗时直方图",
    buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000],
    labelNames: ['method', 'route'],
    registers: [this.registry]
  })

  constructor() {
    // 白送:CPU/内存/事件循环延迟等进程默认指标,全登记进 registry
    collectDefaultMetrics({ register: this.registry })
  }
}