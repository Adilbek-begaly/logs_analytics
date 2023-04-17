import {SystemLogService} from "../system-log.service";
import {Test, TestingModule} from "@nestjs/testing";
import {ClickHouseModule} from "@depyronick/nestjs-clickhouse";
import {GetSystemLogsDto} from "../dto/get-logs.dto";
import {RedisConnectModule} from "../../../providers/redis/redis.module";
import {ConfigModule, ConfigService} from "@nestjs/config";

describe('SystemLogService', () => {
    let moduleRef: TestingModule;
    let service: SystemLogService;

    beforeAll(async () => {
        moduleRef = await Test.createTestingModule({
            imports: [
                RedisConnectModule,
                ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: [process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env'],
                }),
                ClickHouseModule.registerAsync({
                    inject: [ConfigService],
                    useFactory: (configService: ConfigService) => ({
                        host: configService.get('CLICKHOUSE_HOST'),
                        database: configService.get('CLICKHOUSE_DB'),
                        username: configService.get('CLICKHOUSE_USER'),
                        password: configService.get('CLICKHOUSE_PASSWORD')
                    })
                }),
            ],
            providers: [SystemLogService]
        }).compile()

        service = await moduleRef.get<SystemLogService>(SystemLogService)
    })

    it('should to be defined systemLogService', () => {
        expect(service).toBeDefined()
    })

    describe('Unit-testing method SystemLogsService', () => {

        it('method get',async () => {
            const req = {} as GetSystemLogsDto
            const res = await service.get(req)

            expect(res).toBeDefined()
            expect(res.statusCode).toBe(200)
            expect(res.message).toBe('SUCCESS')
            expect(res).toStrictEqual({
                statusCode: 200,
                message: 'SUCCESS',
                list: expect.any(Array),
                total: expect.any(Number)
            })
        })

        it('method selectOptions', () => {
            const req = {} as GetSystemLogsDto
            const res = service.selectOptions(req)

            expect(res).toString()
            expect(res).toBeDefined()
            expect(res).toHaveProperty('options')
            expect(res).toHaveProperty('total')
            expect(res).toMatchObject({options: /SELECT/, total: /COUNT/})
        })

        it('method paramsQuery', () => {
            const req_1 = {} as GetSystemLogsDto
            const req_2 = {
                search: "10001000",
                filter: {
                    type: "error",
                    microservice: "analytics"
                },
                sort: {
                    sortBy: "service",
                    isSortDesc: true
                },
                pagination: {
                    perPage: 3,
                    currentPage: 2,
                }
            } as GetSystemLogsDto
            const res_1 = service.paramsQuery(req_1)
            const res_2 = service.paramsQuery(req_2)

            expect(res_1).toStrictEqual({
                type: '',
                range: { from: 0, to: expect.any(Number) },
                offset: 0,
                search: '',
                sortBy: '',
                perPage: 10,
                isSortDesc: false,
                currentPage: 1,
                microservice: ''

            })
            expect(res_2).toStrictEqual({
                type: 'error',
                range: { from: 0, to: expect.any(Number) },
                offset: 3,
                search: '10001000',
                sortBy: 'service',
                perPage: 3,
                isSortDesc: true,
                currentPage: 2,
                microservice: 'analytics'

            })

        })

        it('method whereOptions', () => {
            const res_1 = service.whereOptions('', '', '')
            const res_2 = service.whereOptions('error', '', '')
            const res_3 = service.whereOptions('', 'analytics', '')
            const res_4 = service.whereOptions('', '', 'query')
            const res_5 = service.whereOptions('error', 'analytics', '')

            expect(res_1).toBe(`(traceId LIKE '%%' OR service LIKE '%%' OR method LIKE '%%')`)
            expect(res_2).toBe(`type='error'`)
            expect(res_3).toBe(`microservice='analytics'`)
            expect(res_4).toBe(`(traceId LIKE '%query%' OR service LIKE '%query%' OR method LIKE '%query%')`)
            expect(res_5).toBe(`(type='error' AND microservice='analytics')`)
        })

        it('method orderBySort', () => {
            const res_1 = service.orderBySort('service', true)
            const res_2 = service.orderBySort('service', false)
            const res_3 = service.orderBySort('method', true)
            const res_4 = service.orderBySort('method', false)
            const res_5 = service.orderBySort('', false)

            expect(res_1).toBe(`service ASC`)
            expect(res_2).toBe(`service DESC`)
            expect(res_3).toBe(`method ASC`)
            expect(res_4).toBe(`method DESC`)
            expect(res_5).toBe(`eventDate DESC`)
        })

        it('method query', async () => {
            const select = `SELECT COUNT(*) AS total FROM product_analytic`
            const query = await service.query(select)

            expect(query).toBeDefined()
            expect(query).toStrictEqual([
                {
                    total: expect.any(String)
                }
            ])
        })
    })

    afterAll(() => {
        moduleRef.close()
    })
})