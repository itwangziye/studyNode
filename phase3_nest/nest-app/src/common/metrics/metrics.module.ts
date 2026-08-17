import { Global, Module } from "@nestjs/common";
import { MetricsService } from "./metrics.service";
import { MetricsController } from "./metrics.controller";

@Global()
@Module({
    exports: [MetricsService],
    providers: [MetricsService],
    controllers: [MetricsController]
})
export class MetricsModule {}