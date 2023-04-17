import {Module} from "@nestjs/common";
import {ProfileLogController} from "./profile-log.controller";
import {ProfileLogService} from "./profile-log.service";
import {ClickHouseModule} from "@depyronick/nestjs-clickhouse";
import {ConfigService} from "@nestjs/config";
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
    controllers: [ProfileLogController],
    providers: [ProfileLogService],
    exports: [ProfileLogService]
})
export class ProfileLogModule {}