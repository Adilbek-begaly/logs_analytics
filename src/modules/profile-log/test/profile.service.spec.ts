import {Test, TestingModule} from "@nestjs/testing";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {ClickHouseModule} from "@depyronick/nestjs-clickhouse";
import {RedisModule} from "@liaoliaots/nestjs-redis";
import {ProfileLogService} from "../profile-log.service";

describe('Unit test ProfileService', () => {
    let service;
    let moduleRef: TestingModule;

    beforeAll(async () => {
        moduleRef = await Test.createTestingModule({
            imports: [
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
                RedisModule.forRootAsync({
                    inject: [ConfigService],
                    useFactory: (configService: ConfigService) => ({
                        closeClient: true,
                        config: {
                            host: configService.get('REDIS_HOST'),
                            port: configService.get('REDIS_PORT'),
                            password: configService.get('REDIS_PASSWORD'),
                        }
                    })
                }),
            ],
            providers: [ProfileLogService]
        }).compile()

        service = await moduleRef.get<ProfileLogService>(ProfileLogService)
    })

    it('should return to be defined ProfileService', () => {
        expect(service).toBeDefined()
    })

    describe('/Unit testing method', () => {
        it('write method', () => {
            const data = [
                {
                    traceId: '1',
                    microservice: 'analytics',
                    service: 'profile service',
                    method: 'write',
                    message: 'test data colum not found',
                },
                {
                    traceId: '2',
                    microservice: 'unit-test',
                    service: 'unit-test service',
                    method: 'write',
                    message: 'test data colum not found',
                }
            ]

            const response = service.write(data)

            expect(response).toBeTruthy()
            expect(response).toBeDefined()
        })

        it('get method', async () => {
            const req = {}
            const response = await service.get(req)

            expect(response).toBeTruthy()
            expect(response).toBeDefined()
            expect(response).toStrictEqual({
                statusCode: 200,
                message: 'SUCCESS',
                list: expect.any(Array),
                total: expect.any(Number)
            })
        })

        it('selectOptions method', () => {
            const req = {}
            const response = service.selectOptions(req)

            expect(response).toBeTruthy()
            expect(response).toBeDefined()
            expect(response).toHaveProperty('options')
            expect(response).toHaveProperty('total')
            expect(response).toMatchObject({options: /SELECT/, total: /COUNT/})
        })

        it('queryParams method', () => {
            const req = {}
            const res = service.paramsQuery(req)

            expect(res).toStrictEqual({
                date: expect.any(Object),
                search: "",
                offset: 0,
                sortBy: "",
                perPage: 10,
                isSortDesc: false,
                microservice: ""
            })
        })

        it('whereOptions method', () => {
            const microservice_1 = 'analytics'
            const search_1 = ''
            const microservice_2 = 'analytics'
            const search_2 = 'test'
            const microservice_3 = ''
            const search_3 = 'test'

            const response_1 = service.whereOptions(microservice_1, search_1)
            const response_2 = service.whereOptions(microservice_2, search_2)
            const response_3 = service.whereOptions(microservice_3, search_3)

            expect(response_1).toStrictEqual(`(microservice='analytics') 
               AND (traceId LIKE '%%' OR service LIKE '%%' OR method LIKE '%%')`)
            expect(response_2).toStrictEqual(`(microservice='analytics') 
               AND (traceId LIKE '%test%' OR service LIKE '%test%' OR method LIKE '%test%')`)
            expect(response_3).toStrictEqual(`(traceId LIKE '%test%' OR service LIKE '%test%' OR method LIKE '%test%')`)
        })

        it('orderBySort method', () => {
            const sortBy_1 = 'service'
            const sortBy_2 = 'test'
            const isSortAsc = true
            const isSortDesc = false

            const res_Asc = service.orderBySort(sortBy_1, isSortAsc)
            const res_Desc = service.orderBySort(sortBy_1, isSortDesc)
            const res_test = service.orderBySort(sortBy_2, isSortAsc)

            expect(res_Asc).toBe(`service ASC, eventDate DESC`)
            expect(res_Desc).toBe(`service DESC, eventDate DESC`)
            expect(res_test).toBe(`eventDate DESC`)
        })

        it('query method', async () => {
            const select = `select count(*) as total from product_analytic`
            const query = await service.query(select)

            expect(query).toBeTruthy()
            expect(query).toBeDefined()
            expect(query).toStrictEqual([
                {
                    total: expect.any(String)
                }
            ])
        })
    })

    afterAll(async () => {
        // await service.query(`TRUNCATE TABLE profile_log`)
        await moduleRef.close()
    })
})