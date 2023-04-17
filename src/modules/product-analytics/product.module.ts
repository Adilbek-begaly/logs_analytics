import {Module} from "@nestjs/common";
import {ClickHouseModule} from "@depyronick/nestjs-clickhouse";
import {ConfigService} from "@nestjs/config";
import {RedisConnectModule} from "../../providers/redis/redis.module";
import {ProductController} from "./product.controller";
import {ProductAnalyticsService} from "./services/product-analytics.service";
import {ProductTrendService} from "./services/product-trend.service";
import {ProductWidgetService} from "./services/product-widget.service";
import {ProductFormService} from "./services/product-form.service";

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
        RedisConnectModule
    ],
    controllers: [ProductController],
    providers: [ProductAnalyticsService, ProductTrendService, ProductWidgetService, ProductFormService],
    exports: [ProductAnalyticsService, ProductFormService],
})
export class ProductModule {}