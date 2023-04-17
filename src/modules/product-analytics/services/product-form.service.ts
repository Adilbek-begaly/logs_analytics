import {Inject, Injectable, Logger, OnModuleInit} from "@nestjs/common";
import {CLICKHOUSE_ASYNC_INSTANCE_TOKEN, ClickHouseClient} from "@depyronick/nestjs-clickhouse";
import {InjectRedis} from "@liaoliaots/nestjs-redis";
import Redis from "ioredis";
import {FormProductI} from "../interface/product-analytics.interface";
import {MAX_BATCH_SIZE, MAX_POP_SIZE} from "../../utils/consts";

@Injectable()
export class ProductFormService implements OnModuleInit{
    constructor(
        @Inject(CLICKHOUSE_ASYNC_INSTANCE_TOKEN) private analyticService: ClickHouseClient,
        @InjectRedis() private readonly redis: Redis,
    ) {}

    private logger: Logger = new Logger(ProductFormService.name)

    async onModuleInit() {
        const table: string = 'product_analytic'
        await this.createTable(table)
    }

    private createTable (tableName: string) {
        return this.analyticService.query(`
                CREATE TABLE IF NOT EXISTS ${tableName} (
                    productId String,
                    category UInt8,
                    brand UInt8,
                    source String,
                    cityId String,
                    reviewCount UInt8,
                    rating Float32,
                    sellerCount UInt8,
                    price UInt32,
                    eventDate DateTime DEFAULT NOW()
                )   ENGINE=MergeTree()
                PARTITION BY toYYYYMMDDhhmmss(eventDate)
                ORDER BY(eventDate)`.trim())
            .subscribe({
                error: (err: any): void => {
                    this.logger.debug(`ERROR: ${err}`)
                    // console.error('ERROR', err)
                },
                next: (row): void => {
                    console.log(row);
                },
                complete: (): void => {
                    this.logger.debug(`создание таблицы ${tableName}`)
                    // console.log('создание таблицы')
                },
            });
    }

    async handleBatch(data: FormProductI[]) {

        data.forEach( async (element: FormProductI) => {
            await this.redis.lpush('products', JSON.stringify(element))
        })

        const listProductsLength: number = await this.redis.llen('products')

        this.logger.debug(`products: ${listProductsLength}`)

        if (listProductsLength >= MAX_BATCH_SIZE) {
            const currentTime: number = new Date().getTime()
            const batch: FormProductI[] = []
            const redisData: Array<string> = await this.redis.lpop('products', MAX_POP_SIZE)
            if (!redisData) return
            redisData.forEach(element => batch.push(JSON.parse(element)))

            this.logger.debug(`products writing length: ${batch.length}`)
            await this.write(batch)
            await this.redis.set('lastBatchCreationDate', currentTime)
        }
    }

    write(data: FormProductI[]) {
        this.analyticService.insert('product_analytic', data)
            .subscribe({
                error: (err: any): void => {
                    this.logger.debug(`ERROR: ${err}`)
                    // console.error('ERROR', err)
                },
                next: (row): void => {
                    console.log(row);
                },
                complete: (): void => {
                    this.logger.debug(`поток завершен`)
                    // console.log('поток завершен')
                },
            });
    }
}