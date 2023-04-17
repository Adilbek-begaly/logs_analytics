import {Injectable, Logger} from "@nestjs/common";
import {InjectQueue} from "@nestjs/bull";
import {InjectRedis} from "@liaoliaots/nestjs-redis";
import {Queue} from "bull";
import Redis from "ioredis";
import {BatchTimeLogService} from "./tasks/batch-time-log.service";
import {BatchTimeProductService} from "./tasks/batch-time-product.service";
import {BATCH_TIME_LOG} from "../utils/consts";
import {BatchTimeProfileService} from "./tasks/batch-time-profile.service";


@Injectable()
export class BatchTimeTaskService {
    constructor(
        @InjectQueue('LOG_TASK') private taskQueue: Queue,
        @InjectRedis() private readonly redis: Redis,
        private readonly batchTimeLogsService: BatchTimeLogService,
        private readonly batchTimeProductsService: BatchTimeProductService,
        private readonly batchTimeProfileService: BatchTimeProfileService,
    ) {}

    private logger: Logger = new Logger(BatchTimeTaskService.name)

    async onModuleInit() {
        this.logger.debug(`bull`)
        await this.taskQueue.removeRepeatableByKey('__default__:2::20000')
        await this.queueTask();

        // console.log(await this.taskQueue.getRepeatableJobs())
        // const job = await this.taskQueue.getJob('batch-time-task')
        // console.log(job)
        // this.taskQueue.
    }

    async queueTask() {
        await this.taskQueue.add({},
            {
                jobId: 2,
                removeOnComplete: true,
                repeat: {every: 20000},
            }
        )
    }

    async handleTask() {

        // this.logger.debug(`check batch`)

        const currentDate = new Date().getTime()
        const lastBatchCreationDate = Number(await this.redis.get('lastBatchCreationDate'))
        const timeBatch = currentDate - lastBatchCreationDate > BATCH_TIME_LOG
        if (timeBatch) {
            await  this.batchTimeLogsService.systemLogsTask()
            await  this.batchTimeProductsService.productsAnalyticTask()
            await  this.batchTimeProfileService.profileLogsTask()
        }
    }
}