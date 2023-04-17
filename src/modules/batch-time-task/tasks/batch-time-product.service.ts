import {Injectable, Logger} from "@nestjs/common";
import {InjectRedis} from "@liaoliaots/nestjs-redis";
import Redis from "ioredis";
import {ProductFormService} from "../../product-analytics/services/product-form.service";

@Injectable()
export class BatchTimeProductService {
    constructor(
        @InjectRedis() private readonly redis: Redis,
        private readonly productsService: ProductFormService,
    ) {}

    private logger: Logger = new Logger(BatchTimeProductService.name)

    async productsAnalyticTask() {

        this.logger.debug(`product analytic time batch`)

        const batch = []
        const productsListLength = await this.redis.llen('products')
        const currentTime = new Date().getTime()
        await this.redis.set('lastBatchCreationDate', currentTime)
        const redisData = await this.redis.lpop('products', productsListLength)
        if (!redisData) return
        redisData.forEach(element => batch.push(JSON.parse(element)))
        await this.productsService.write(batch)
    }
}