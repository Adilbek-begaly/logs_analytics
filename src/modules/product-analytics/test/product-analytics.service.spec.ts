import {Test, TestingModule} from "@nestjs/testing";
import {ClickHouseModule} from "@depyronick/nestjs-clickhouse";
import {ProductAnalyticsService} from "../services/product-analytics.service";
import {GetProductsAnalyticDto} from "../dto/get-products-analytic.dto";
import {ConfigModule, ConfigService} from "@nestjs/config";

describe('ProductTrendService', () => {
    let moduleRef: TestingModule
    let service: ProductAnalyticsService

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
            ],
            providers: [ProductAnalyticsService],
        }).compile()

        service = await moduleRef.get<ProductAnalyticsService>(ProductAnalyticsService)
    })

    it('should be defined ProductAnalyticsService', () => {
        expect(service).toBeDefined()
    })

    describe('Unit-testing method ProductAnalyticsService', () => {

        it('method get', async () => {
            const req = {} as GetProductsAnalyticDto
            const res = await service.get(req)

            expect(res).toBeDefined()
            expect(res).toStrictEqual({
                statusCode: 200,
                message: 'SUCCESS',
                list: expect.any(Array),
                total: expect.any(Number)
            })
        })

        it('method selectOptions', () => {
            const req = {} as GetProductsAnalyticDto
            const res = service.selectOptions(req)

            expect(res).toBeTruthy()
            expect(res).toBeDefined()
            expect(res).toHaveProperty('options')
            expect(res).toHaveProperty('total')
            expect(res).toMatchObject({options: /SELECT/, total: /COUNT/})
        })

        it('method paramsQuery', () => {
            const req_1 = {} as any
            const req_2 = {
                search: "1234",
                filter: {
                    category: [1],
                    brand: [111],
                    trend: true,
                    city: "75000000",
                    index: {
                        min: 1,
                        max: 5
                    }
                },
                sort: {
                    sortBy: "lastSeller",
                    isSortDesc: true,
                },
                pagination: {
                    perPage: 5
                }
            } as GetProductsAnalyticDto

            const res_1 = service.paramsQuery(req_1)
            const res_2 = service.paramsQuery(req_2)

            expect(res_1).toStrictEqual({
                city: '',
                range: { from: 0, to: expect.any(Number) },
                price: { priceMin: 0, priceMax: 100000000 },
                trend: false,
                brand: [],
                offset: 0,
                search: '',
                sortBy: '',
                indexI: { indexMin: 1, indexMax: 10 },
                perPage: 10,
                category: [],
                isSortDesc: false,
                currentPage: 1,
                productArrayId: []

            })
            expect(res_2).toStrictEqual({
                city: '75000000',
                range: { from: 0, to: expect.any(Number) },
                price: { priceMin: 0, priceMax: 100000000 },
                trend: true,
                brand: [ 111 ],
                offset: 0,
                search: '1234',
                sortBy: 'lastSeller',
                indexI: { indexMin: 1, indexMax: 5 },
                perPage: 5,
                category: [ 1 ],
                isSortDesc: true,
                currentPage: 1,
                productArrayId: []

            })
        })

        it('method orderBySort', () => {
            const res_1 = service.orderBySort('lastRating', true)
            const res_2 = service.orderBySort('lastRating', false)
            const res_3 = service.orderBySort('lastSeller', true)
            const res_4 = service.orderBySort('lastSeller', false)
            const res_5 = service.orderBySort('lastReview', true)
            const res_6 = service.orderBySort('lastReview', false)
            const res_7 = service.orderBySort('', true)

            expect(res_1).toBe('lastRating ASC')
            expect(res_2).toBe('lastRating DESC')
            expect(res_3).toBe('lastSeller ASC')
            expect(res_4).toBe('lastSeller DESC')
            expect(res_5).toBe('lastReview ASC')
            expect(res_6).toBe('lastReview DESC')
            expect(res_7).toBe('lastRating DESC, lastSeller ASC')
        })

        it('method whereOperationIN', () => {
            const res_city = service.whereOperatorIN('75', [], [], '')
            const res_city_category = service.whereOperatorIN('75', [], [1], '')
            const res_city_category_brand = service.whereOperatorIN('75', [22], [1], '')
            const res_category = service.whereOperatorIN('',[],[1], '')
            const res_category_brand = service.whereOperatorIN('',[33],[2], '')
            const res_search = service.whereOperatorIN('',[],[],'75')

            expect(res_city).toBe(`cityId='75'`)
            expect(res_city_category).toBe(`category IN (1) AND cityId='75'`)
            expect(res_city_category_brand).toBe(`(category IN (1) AND brand IN (22)) AND cityId='75'`)
            expect(res_category).toBe(`category IN (1)`)
            expect(res_category_brand).toBe(`(category IN (2) AND brand IN (33))`)
            expect(res_search).toBe(`productId LIKE '%75%'`)
        })

        it('method rivalIndex', () => {
            const indexI = {indexMin: 1, indexMax: 10}
            const result = {indexMin: 1, indexMax: 200}
            const res = service.rivalIndex(indexI)

            expect(res).toStrictEqual(result)
            expect(res).toHaveProperty('indexMax')
            expect(res).toHaveProperty('indexMin')
        })

        it('method stringifyProductsIDArray', () => {
            const productId: string[] = ["1", "2"];
            const productStringifyId: string = `['1','2']`
            const result = service.stringifyProductsIDArray(productId)

            expect(result).toBeDefined()
            expect(result).toStrictEqual(productStringifyId)
        });

        it('method query', async () => {
            const select = `SELECT COUNT(*) AS total FROM product_analytic`
            const res = await service.query(select)

            expect(res).toBeTruthy()
            expect(res).toBeDefined()
            expect(res).toStrictEqual([
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