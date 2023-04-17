import {Injectable, Logger} from "@nestjs/common";
import {InjectRedis} from "@liaoliaots/nestjs-redis";
import Redis from "ioredis";
import {SystemLogService} from "../../system-log/system-log.service";

@Injectable()
export class BatchTimeLogService {
    constructor(
        @InjectRedis() private readonly redis: Redis,
        private readonly logsService: SystemLogService,
    ) {}

    private logger: Logger = new Logger(BatchTimeLogService.name)

    async systemLogsTask() {

        this.logger.debug(`system log time batch`)

        const batch = []
        const systemLogsLength = await this.redis.llen('logs')
        const currentTime = new Date().getTime()
        await this.redis.set('lastBatchCreationDate', currentTime)
        const redisData = await this.redis.lpop('logs', systemLogsLength)
        if (!redisData) return
        redisData.forEach(element => batch.push(JSON.parse(element)))
        await this.logsService.write(batch)
    }
}