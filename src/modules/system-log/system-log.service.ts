import {Inject, Injectable, Logger, OnModuleInit} from "@nestjs/common";
import {CLICKHOUSE_ASYNC_INSTANCE_TOKEN, ClickHouseClient} from "@depyronick/nestjs-clickhouse";
import Redis from "ioredis";
import {InjectRedis} from "@liaoliaots/nestjs-redis";
import {FormLogsI, RangeI, SystemLogsI, TotalI} from "./interface/system-log.interface";
import {MAX_BATCH_SIZE, MAX_POP_SIZE} from "../utils/consts";
import {GetSystemLogsDto} from "./dto/get-logs.dto";


@Injectable()
export class SystemLogService implements OnModuleInit {

    constructor(
        @Inject(CLICKHOUSE_ASYNC_INSTANCE_TOKEN) private analyticService: ClickHouseClient,
        @InjectRedis() private readonly  redis: Redis
    ) {}

    private logger: Logger = new Logger(SystemLogService.name)

    async onModuleInit() {
        const systemLog = 'system_log'
        await this.createTableSystemLog(systemLog)
    }

    private createTableSystemLog(tableName: string){
        return this.analyticService.query(`
                CREATE TABLE IF NOT EXISTS ${tableName} (
                    traceId String, 
                    microservice String, 
                    service String, 
                    method String, 
                    type String, 
                    data String, 
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

    async handleBatch(data: FormLogsI[]) {

        data.forEach( async (element) => {
            await this.redis.lpush('logs', JSON.stringify(element))
        })

        const listLogsLength: number = await this.redis.llen('logs')

        this.logger.debug(`logs: ${listLogsLength}`)

        if (listLogsLength >= MAX_BATCH_SIZE) {

            const currentTime: number = new Date().getTime()
            const batch: Array<FormLogsI> = []
            const redisData: Array<string> = await this.redis.lpop('logs', MAX_POP_SIZE)
            if (!redisData) return
            redisData.forEach(element => {batch.push(JSON.parse(element))})

            this.logger.debug( `system logs writing length: ${batch.length}`)

            await this.write(batch)
            await this.redis.set('lastBatchCreationDate', currentTime)
        }
    }

    write(data: FormLogsI[]) {
        this.analyticService.insert('system_log', data)
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

    async get(req: GetSystemLogsDto) {

        const SELECT = this.selectOptions(req)
        const logs =  await this.query(SELECT.options) as SystemLogsI[]
        const total = await this.query(SELECT.total) as TotalI[]

        return {
            statusCode: 200,
            message: 'SUCCESS',
            list: logs,
            total: +total[total.length-1].totals
        }
    }

    selectOptions(req: GetSystemLogsDto) {
        const {
            type,
            range,
            offset,
            search,
            sortBy,
            perPage,
            isSortDesc,
            microservice,
        } = this.paramsQuery(req)
        const whereOptions = this.whereOptions(type, microservice, search)
        const orderBySort = this.orderBySort(sortBy, isSortDesc)

        let options = `
                    SELECT traceId, microservice, service, 
                           method, type, data, message, 
                           toInt32(toDateTime(eventDate, 'UTC')) AS eventDate
                    FROM system_log 
                    WHERE ${whereOptions}
                    AND (traceId LIKE '%${search}%' OR service LIKE '%${search}%' OR method LIKE '%${search}%') 
                    AND (eventDate BETWEEN ${range.from} AND ${range.to})
                    ORDER BY ${orderBySort}
                    LIMIT ${perPage} OFFSET ${offset}`.trim()

        let total = `
                    SELECT COUNT(*) AS totals FROM system_log 
                    WHERE  ${ whereOptions }
                    AND (traceId LIKE '%${search}%' OR service LIKE '%${search}%' OR method LIKE '%${search}%')
                    AND (eventDate BETWEEN ${range.from} AND ${range.to})`.trim()

        return {
            options,
            total,
        }
    }

    paramsQuery(req: GetSystemLogsDto) {
        const perPage = +req.pagination?.perPage as number || 10;
        const currentPage = +req.pagination?.currentPage as number || 1;
        const offset = (currentPage - 1) * perPage;
        const search = req?.search as string || ""
        const type = req.filter?.type as string || ""
        const microservice = req.filter?.microservice as string || ""
        const sortBy = req.sort?.sortBy as string || ""
        const isSortDesc = req.sort?.isSortDesc as boolean || false
        const range: RangeI = {
            from: +req.filter?.date?.from || 0,
            to: +req.filter?.date?.to || Date.now()
        }
        return {
            type,
            range,
            offset,
            search,
            sortBy,
            perPage,
            isSortDesc,
            currentPage,
            microservice,
        }
    }

    whereOptions(type: string, microservice: string, search: string) {
        const where = type && microservice
            ? `(type='${type}' AND microservice='${microservice}')`
            : type
                ? `type='${type}'`
                : microservice
                    ? `microservice='${microservice}'`
                    : `(traceId LIKE '%${search}%' OR service LIKE '%${search}%' OR method LIKE '%${search}%')`
        return where
    }

    orderBySort(sortBy: string, isSortDesc: boolean) {
        const sort = sortBy
            ? sortBy==="service"
                ? isSortDesc
                    ? `service ASC`
                    : `service DESC`
                : sortBy==="method"
                    ? isSortDesc
                        ? `method ASC`
                        : `method DESC`
                    : `method DESC`
            : `eventDate DESC`
        return sort
    }

    query(select: string){
        return this.analyticService
            .queryPromise(select)
            .catch((err) => console.log(err))
    }
}