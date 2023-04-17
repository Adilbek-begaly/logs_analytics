import {Inject, Injectable, Logger, OnModuleInit} from "@nestjs/common";
import {CLICKHOUSE_ASYNC_INSTANCE_TOKEN, ClickHouseClient} from "@depyronick/nestjs-clickhouse";
import {InjectRedis} from "@liaoliaots/nestjs-redis";
import Redis from "ioredis";
import {MAX_BATCH_SIZE, MAX_POP_SIZE} from "../utils/consts";
import {GetProfileLogDto} from "./dto/get-profile-logs.dto";
import {
    DateI,
    TotalI,
    GetProfileLogsI,
    FormProfileLogsI,
} from "./interface/profile-log.interface";


@Injectable()
export class ProfileLogService implements OnModuleInit{
    constructor(
        @Inject(CLICKHOUSE_ASYNC_INSTANCE_TOKEN) private analyticsService: ClickHouseClient,
        @InjectRedis() private readonly redis: Redis,
    ) {}

    private logger: Logger = new Logger(ProfileLogService.name)

    async onModuleInit() {
        const profileLog = 'profile_log'
        await this.createTableProfileLog(profileLog)
    }

    private createTableProfileLog(tableName: string){
        return this.analyticsService.query(`
                CREATE TABLE IF NOT EXISTS ${tableName} (
                    traceId String, 
                    microservice String, 
                    service String, 
                    method String, 
                    message String, 
                    eventDate DateTime DEFAULT NOW()
                )   ENGINE=MergeTree() 
                PARTITION BY toYYYYMMDDhhmmss(eventDate) 
                ORDER BY (eventDate)`.trim()
        )
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

    async handleBatch(data: FormProfileLogsI[]) {

        data.forEach( async (element) => {
            await this.redis.lpush('profile-logs', JSON.stringify(element))
        })

        const listLogsLength = await this.redis.llen('profile-logs')
        this.logger.debug(`profile-logs: ${listLogsLength}`)

        // if (listLogsLength >= MAX_BATCH_SIZE) {
        //
        //     const currentTime: number = new Date().getTime()
        //     const batch: FormProfileLogsI[] = []
        //     const redisData: string[] = await this.redis.lpop('profile-logs', MAX_POP_SIZE)
        //     if (!redisData) return
        //     redisData.forEach(element => {batch.push(JSON.parse(element))})
        //
        //     this.logger.debug( `profile logs writing length: ${batch.length}`)
        //
        //     await this.write(batch)
        //     await this.redis.set('lastBatchCreationDate', currentTime)
        // }
    }

    write(data: FormProfileLogsI[]) {
        return this.analyticsService.insert('profile_log', data)
            .subscribe({
                error: (err: any): void => {
                    this.logger.debug(`ERROR ${err}`)
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

    async get(req: GetProfileLogDto) {

        const SELECT = this.selectOptions(req)
        const list = await this.query(SELECT.options) as GetProfileLogsI[]
        const total = await this.query(SELECT.total) as TotalI[]

        return {
            statusCode: 200,
            message: 'SUCCESS',
            list,
            total: +total[total.length-1].total
        }
    }

    selectOptions(req: GetProfileLogDto) {
        const {
            date,
            search,
            offset,
            sortBy,
            perPage,
            isSortDesc,
            microservice,
        } = this.paramsQuery(req)

        const whereOptions = this.whereOptions(microservice, search)
        const orderBySort = this.orderBySort(sortBy, isSortDesc)

        const options = `SELECT traceId, microservice, service, method, message,
                                toInt32(toDateTime(eventDate, 'UTC')) as eventDate
                         FROM profile_log
                         WHERE ${whereOptions}
                         AND (eventDate BETWEEN ${date.from} AND ${date.to})
                         ORDER BY ${orderBySort}
                         LIMIT ${perPage} OFFSET ${offset}`.trim()

        const total = `SELECT COUNT(*) AS total FROM profile_log
                       WHERE ${whereOptions}
                       AND (eventDate BETWEEN ${date.from} AND ${date.to})`.trim()

        return {
            options,
            total
        }
    }

    paramsQuery(req: GetProfileLogDto) {
        const perPage = +req.pagination?.perPage as number || 10
        const currentPage = +req.pagination?.currentPage as number || 1
        const offset = (currentPage - 1) * perPage
        const search = req?.search as string || ""
        const microservice = req.filter?.microservice as string || ""
        const sortBy = req.sort?.sortBy as string || ""
        const isSortDesc= req.sort?.isSortDesc as boolean || false
        const date: DateI = {
            from: +req.filter?.date?.from || 0,
            to: +req.filter?.date?.to || Date.now()
        }

        return {
            date,
            search,
            offset,
            sortBy,
            perPage,
            isSortDesc,
            microservice,
        }
    }

    whereOptions(microservice: string, search: string) {
        return microservice
            ? `(microservice='${microservice}') 
               AND (traceId LIKE '%${search}%' OR service LIKE '%${search}%' OR method LIKE '%${search}%')`
            : `(traceId LIKE '%${search}%' OR service LIKE '%${search}%' OR method LIKE '%${search}%')`
    }

    orderBySort(sortBy: string, isSortDesc: boolean) {
        return sortBy==='service'
            ? isSortDesc
                ? `service ASC, eventDate DESC`
                : `service DESC, eventDate DESC`
            : `eventDate DESC`
    }

    query(select: string) {
        return this.analyticsService
            .queryPromise(select)
            .catch(err => this.logger.debug(`ERROR: ${err}`))
    }
}