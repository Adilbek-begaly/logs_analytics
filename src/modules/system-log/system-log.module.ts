import {Module} from "@nestjs/common";
import {ClickHouseModule} from "@depyronick/nestjs-clickhouse";
import {ConfigService} from "@nestjs/config";
import {SystemLogController} from "./system-log.controller";
import {SystemLogService} from "./system-log.service";
import {RedisConnectModule} from "../../providers/redis/redis.module";

@Module({
    imports: [
        ClickHouseModule.registerAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                host: configService.get('CLICKHOUSE_HOST'),
                database: configService.get('CLICKHOUSE_DB'),
                username: configService.get('CLICKHOUSE_USER'),
                password: configService.get('CLICKHOUSE_PASSWORD')
            })
        }),
        RedisConnectModule,
    ],
    controllers: [SystemLogController],
    providers: [SystemLogService],
    exports: [SystemLogService]
})
export class SystemLogModule {}