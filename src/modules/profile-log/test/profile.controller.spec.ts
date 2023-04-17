import {INestApplication} from "@nestjs/common";
import {Test, TestingModule} from "@nestjs/testing";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {ClickHouseModule} from "@depyronick/nestjs-clickhouse";
import {ProfileLogModule} from "../profile-log.module";
import * as request from 'supertest';
import {RedisModule} from "@liaoliaots/nestjs-redis";
import {ProfileLogService} from "../profile-log.service";

describe('e2e-test ProfileController', () => {
    let app: INestApplication;
    let moduleRef: TestingModule;
    let service: ProfileLogService;

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
                ProfileLogModule,
            ],
        }).compile()

        service = await moduleRef.get(ProfileLogService)
        app = await moduleRef.createNestApplication()
        await app.init()
    })

    describe('/SERVICE', () => {
        it('should return to be defined Service', () => {
            expect(service).toBeDefined()
        })

        it('write logs to testing', async () => {
            const data = [
                {
                    traceId: '1',
                    microservice: 'analytics',
                    service: 'analytics service',
                    method: 'write',
                    message: 'data analytics',
                },
                {
                    traceId: '2',
                    microservice: 'new',
                    service: 'new service',
                    method: 'post',
                    message: 'data new',
                },
                {
                    traceId: '3',
                    microservice: 'external',
                    service: 'external service',
                    method: 'proxy',
                    message: 'data proxy',
                },
                {
                    traceId: '4',
                    microservice: 'acc',
                    service: 'acc service',
                    method: 'get',
                    message: 'data acc',
                },
            ]

            const res = await service.write(data)

            expect(res).toBeDefined()
            expect(res).toBeTruthy()
        })
    })

    describe('/POST get profile logs', () => {
        it('should return create method', async () => {
            const body = {
                list: [
                    {
                        traceId: '111111',
                        microservice: 'analytics',
                        service: 'test analytics service',
                        method: 'test query',
                        message: 'test data colum not found',
                    }
                ]
            }

            await request(app.getHttpServer())
                .post('/log.form.profile.logs')
                .send(body)
                .expect(201)
        })
    })

    describe('/GET form profile logs', () => {

        it('should return get all', async () => {
            const body = {}
            const response = await request(app.getHttpServer())
                .get('/log.get.profile.logs')
                .send(body)
                .expect(200)

            expect(response.body).toStrictEqual({
                statusCode: 200,
                message: 'SUCCESS',
                list: expect.any(Array),
                total: expect.any(Number)
            })
        })

        describe('SEARCH', () => {
            it('success should find search', async () => {
                const req = { search: "a"}
                const response = await request(app.getHttpServer())
                    .get('/log.get.profile.logs')
                    .send(req)
                    .expect(200)

                expect(response.body).toStrictEqual({
                    statusCode: 200,
                    message: 'SUCCESS',
                    list: expect.any(Array),
                    total: expect.any(Number)
                })
            })

            it('fail should find search', async () => {
                const req = { search: "aaaaaaaa"}
                const response = await request(app.getHttpServer())
                    .get('/log.get.profile.logs')
                    .send(req)
                    .expect(200)

                expect(response.body).toStrictEqual({
                    statusCode: 200,
                    message: 'SUCCESS',
                    list: [],
                    total: 0,
                })
            })
        })

        describe('PAGINATION', () => {

            it('success perPage = 1', async () => {
                const body = {
                    pagination: {
                        perPage: 1,
                        currentPage: 0
                    }
                }
                const response = await request(app.getHttpServer())
                    .get('/log.get.profile.logs')
                    .send(body)
                    .expect(200)

                expect(response.body.list.length).toBe(1)
                expect(response.body).toStrictEqual({
                    statusCode: 200,
                    message: 'SUCCESS',
                    list: expect.any(Array),
                    total: expect.any(Number)
                })
            })

            it('success perPage = 2', async () => {
                const body = {
                    pagination: {
                        perPage: 2,
                        currentPage: 0
                    }
                }
                const response = await request(app.getHttpServer())
                    .get('/log.get.profile.logs')
                    .send(body)
                    .expect(200)

                expect(response.body.list.length).toBe(2)
                expect(response.body).toStrictEqual({
                    statusCode: 200,
                    message: 'SUCCESS',
                    list: expect.any(Array),
                    total: expect.any(Number)
                })
            })
        })

        describe('SORT', () => {
            it('sort ASC and DESC', async () => {
                const req1 = { sort: { sortBy: 'service', isSortDesc: true } }
                const req2 = { sort: { sortBy: 'service', isSortDesc: false } }

                const response1 = await request(app.getHttpServer())
                    .get('/log.get.profile.logs')
                    .send(req1)
                    .expect(200)

                const response2 = await request(app.getHttpServer())
                    .get('/log.get.profile.logs')
                    .send(req2)
                    .expect(200)

                expect(response1.body.list[0].service).not.toBe(response2.body.list[0].service);
            })
        })

        describe('FILTER', () => {
            it('filter microservice', async () => {
                const req = { filter: { microservice: 'analytics'} }

                const response = await request(app.getHttpServer())
                    .get('/log.get.profile.logs')
                    .send(req)
                    .expect(200)

                expect(response.body.list[0].microservice).toBe('analytics')
                expect(response.body).toStrictEqual({
                    statusCode: 200,
                    message: 'SUCCESS',
                    list: expect.any(Array),
                    total: expect.any(Number)
                })
            })

            it('fail filter microservice', async () => {
                const req = { filter: { microservice: 'test-microservice'} }

                const response = await request(app.getHttpServer())
                    .get('/log.get.profile.logs')
                    .send(req)
                    .expect(200)

                expect(response.body).toStrictEqual({
                    statusCode: 200,
                    message: 'SUCCESS',
                    list: [],
                    total: 0,
                })
            })
        })
    })

    afterAll(async () => {
        // await service.query(`TRUNCATE TABLE profile_log`)
        await app.close()
    })
})