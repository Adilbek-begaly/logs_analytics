import {Injectable, Logger} from "@nestjs/common";
import {InjectRedis} from "@liaoliaots/nestjs-redis";
import Redis from "ioredis";
import {ProfileLogService} from "../../profile-log/profile-log.service";

@Injectable()
export class BatchTimeProfileService {
    constructor(
        @InjectRedis() private readonly redis: Redis,
        private readonly profileService: ProfileLogService,
    ) {}

    private logger: Logger = new Logger(BatchTimeProfileService.name)

    async profileLogsTask() {

        this.logger.debug(`profile log time batch`)

        const batch = []
        const systemLogsLength = await this.redis.llen('profile-logs')
        const currentTime = new Date().getTime()
        await this.redis.set('lastBatchCreationDate', currentTime)
        const redisData = await this.redis.lpop('profile-logs', systemLogsLength)
        if (!redisData) return
        redisData.forEach(element => batch.push(JSON.parse(element)))
        await this.profileService.write(batch)
    }
}