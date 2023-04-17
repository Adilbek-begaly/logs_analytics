import {Test, TestingModule} from "@nestjs/testing";
import {ClickHouseModule} from "@depyronick/nestjs-clickhouse";
import {ProductFormService} from "../services/product-form.service";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {RedisModule} from "@liaoliaots/nestjs-redis";
import {INestApplication} from "@nestjs/common";
import {ProductModule} from "../product.module";
import * as request from 'supertest';
import {GetProductsAnalyticDto} from "../dto/get-products-analytic.dto";
import {FormProductDto} from "../dto/form-product.dto";

describe('e2e-test ProductController', () => {
    let app: INestApplication;
    let moduleRef: TestingModule;
    let service: ProductFormService;

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
                ProductModule,
            ],
        }).compile()

        service = await moduleRef.get<ProductFormService>(ProductFormService)
        app = await moduleRef.createNestApplication()
        await app.init()
    })

    describe('/SERVICE', () => {
        it('should return to be defined service', () => {
            expect(service).toBeDefined()
        })

        it('write logs analytics', async () => {
            const data = [
                {
                    productId: "1701027",
                    category: 1,
                    brand: 11,
                    source: "KASPI",
                    cityId: "750000000",
                    reviewCount: 60,
                    rating: 5,
                    sellerCount: 33,
                    price: 50000
                },
                {
                    productId: "1701027",
                    category: 1,
                    brand: 11,
                    source: "KASPI",
                    cityId: "750000000",
                    reviewCount: 60,
                    rating: 5,
                    sellerCount: 33,
                    price: 50000
                }
            ]

            await service.write(data)
        })
    })

    describe('/POST form products analytics', () => {
        it('should return create method', async () => {
            const body = {
                list: [
                    {
                        productId: "1701027",
                        category: 1,
                        brand: 11,
                        source: "KASPI",
                        cityId: "750000000",
                        reviewCount: 60,
                        rating: 5,
                        sellerCount: 33,
                        price: 50000
                    }
                ]
            } as FormProductDto

            await request(app.getHttpServer())
                .post('/log.form.products.analytics')
                .send(body)
                .expect(201)
        })
    })

    describe('/GET get products analytics', () => {
        it('should return get all', async () => {
            const req = {} as GetProductsAnalyticDto
            const response = await request(app.getHttpServer())
                .get('/log.get.products.analytics')
                .send(req)
                .expect(200)

            expect(response.body).toStrictEqual({
                statusCode: 200,
                message: 'SUCCESS',
                list: expect.any(Array),
                total: expect.any(Number)
            })
        })

        describe('search', () => {
            it('success should return search productId', async () => {
                const req = { search: "1701027" }
                const res = await request(app.getHttpServer())
                    .get('/log.get.products.analytics')
                    .send(req)
                    .expect(200)

                expect(res.body.list[0].productId).toBe('1701027')
                expect(res.body).toStrictEqual({
                    statusCode: 200,
                    message: 'SUCCESS',
                    list: expect.any(Array),
                    total: expect.any(Number)
                })
            })

            it('fail should return search productId', async () => {
                const req = { search: "00000" }
                const res = await request(app.getHttpServer())
                    .get('/log.get.products.analytics')
                    .send(req)
                    .expect(200)

                expect(res.body).toStrictEqual({
                    statusCode: 200,
                    message: 'SUCCESS',
                    list: [],
                    total: 0,
                })
            })
        })

        describe('sort', () => {
            it('sort ASC and DESC', async () => {
                const req1 = { sort: { sortBy: 'lastRating', isSortDesc: true } }
                const req2 = { sort: { sortBy: 'lastRating', isSortDesc: false } }

                const res1 = await request(app.getHttpServer())
                    .get('/log.get.products.analytics')
                    .send(req1)
                    .expect(200)

                const res2 = await request(app.getHttpServer())
                    .get('/log.get.products.analytics')
                    .send(req2)
                    .expect(200)

                expect(res1.body.list[0].productId).toBe(res2.body.list.at(-1).productId);
            })
        })
    })

    describe('/GET get products trend', () => {
        it('get all trend products', async () => {
            const req = {} as any
            const response = await request(app.getHttpServer())
                .get('/log.get.products.trend')
                .send(req)
                .expect(200)

            expect(response.body).toStrictEqual({
                statusCode: 200,
                message: 'SUCCESS',
                list: expect.any(Array),
                total: expect.any(Number)
            })
        })
    })

    describe('/GET get product widget', () => {
        it('success should return product', async () => {
            const req = {filter: {productId: "1701027", city: "750000000"}} as any
            const res = await request(app.getHttpServer())
                .get('/log.get.product.widget')
                .send(req)
                .expect(200)

            expect(res.body).toStrictEqual({
                statusCode: 200,
                message: 'SUCCESS',
                entity: expect.any(Object)
            })
        })

        it('fail should return product', async () => {
            const req = {filter: {productId: "8989", city: "3454"}} as any
            const res = await request(app.getHttpServer())
                .get('/log.get.product.widget')
                .send(req)

            expect(res.body).toStrictEqual({
                statusCode: 401,
                message: 'NOT_FOUNT_ID'
            })
        })
    })

    afterAll(async () => {
        await app.close()
    })
})