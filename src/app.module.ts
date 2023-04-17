import {Module} from "@nestjs/common";
import {ConfigModule} from "@nestjs/config";
import {SystemLogModule} from "./modules/system-log/system-log.module";
import {BatchTimeTaskModule} from "./modules/batch-time-task/batch-time-task.module";
import {ProductModule} from "./modules/product-analytics/product.module";
import {ProfileLogModule} from "./modules/profile-log/profile-log.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: [process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env'],
        }),
        SystemLogModule,
        ProductModule,
        BatchTimeTaskModule,
        ProfileLogModule,
    ],
    controllers: [],
    providers: []
})
export class AppModule {}