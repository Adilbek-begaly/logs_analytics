import {Test, TestingModule} from "@nestjs/testing";
import {ClickHouseModule} from "@depyronick/nestjs-clickhouse";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {INestApplication} from "@nestjs/common";
import * as request from 'supertest'
import {SystemLogModule} from "../system-log.module";
import {GetSystemLogsDto} from "../dto/get-logs.dto";
import {RedisModule} from "@liaoliaots/nestjs-redis";

describe('e2e-testing SystemLogController', () => {
    let app: INestApplication;
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
                SystemLogModule,
            ],
            controllers: [],
            providers: [],
        }).compile()

        app = await moduleRef.createNestApplication()
        await app.init()
    })

    describe('/GET get system logs',() => {

        it('should return log.get.system.logs', async () => {
            const req = { } as GetSystemLogsDto
            const res = await request(app.getHttpServer())
                .get('/log.get.system.logs')
                .send(req)
                .expect(200)

            expect(res).toBeDefined()
            expect(res.body).toStrictEqual({
                statusCode: 200,
                message: 'SUCCESS',
                list: expect.any(Array),
                total: expect.any(Number)
            })
        });

    })

    // describe('/POST form system logs', () => {
    //     it('write logs', async () => {
    //         const body = { list: [] } as FormLogsDto
    //         const res = await request(app.getHttpServer())
    //             .post('/log.form.system.logs')
    //             .send(body)
    //             .expect(201)
    //
    //         console.log(res.body)
    //     })
    // })

    beforeAll(async () => {
        await app.close()
    })
})