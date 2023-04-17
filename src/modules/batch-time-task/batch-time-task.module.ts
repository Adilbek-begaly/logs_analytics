import {Module} from "@nestjs/common";
import {BullModule} from "@nestjs/bull";
import {ConfigService} from "@nestjs/config";
import {SystemLogModule} from "../system-log/system-log.module";
import {BatchTimeProcess} from "./batch-time.process";
import {BatchTimeTaskService} from "./batch-time-task.sevice";
import {ProductModule} from "../product-analytics/product.module";
import {BatchTimeProductService} from "./tasks/batch-time-product.service";
import {BatchTimeLogService} from "./tasks/batch-time-log.service";
import {ProfileLogModule} from "../profile-log/profile-log.module";
import {BatchTimeProfileService} from "./tasks/batch-time-profile.service";

@Module({
    imports: [
        BullModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                redis: {
                    host: configService.get('REDIS_HOST'),
                    port: configService.get('REDIS_PORT'),
                    password: configService.get('REDIS_PASSWORD'),
                }
            })
        }),
        BullModule.registerQueue({
            name: 'LOG_TASK',
        }),
        SystemLogModule,
        ProductModule,
        ProfileLogModule,
    ],
    providers: [
        BatchTimeProcess,
        BatchTimeTaskService,
        BatchTimeProductService,
        BatchTimeLogService,
        BatchTimeProfileService,
    ],
    controllers: [],
})
export class BatchTimeTaskModule {}