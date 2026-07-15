// ============================================================
// RabbitmqModule —— 全局共享 RabbitmqService
// ============================================================
import { Global, Module } from "@nestjs/common"
import { RabbitmqService } from "./rabbitmq.service"

@Global()
@Module({
  providers: [RabbitmqService],
  exports: [RabbitmqService],
})
export class RabbitmqModule {}
