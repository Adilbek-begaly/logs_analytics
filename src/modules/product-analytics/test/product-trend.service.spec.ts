import {Test, TestingModule} from "@nestjs/testing";
import {ClickHouseModule} from "@depyronick/nestjs-clickhouse";
import {ProductTrendService} from "../services/product-trend.service";
import {GetProductsTrendDto} from "../dto/get-products-trend.dto";
import {ConfigModule, ConfigService} from "@nestjs/config";

describe('ProductTrendService', () => {
    let moduleRef: TestingModule
    let service: ProductTrendService

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
            providers: [ProductTrendService],
        }).compile()

        service = await moduleRef.get<ProductTrendService>(ProductTrendService)
    })

    it('should be defined ProductTrendService', () => {
        expect(service).toBeDefined()
    })

    describe('Unit-testing method ProductTrendService', () => {

        it('method get', async () => {
            const req = {} as GetProductsTrendDto
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
            const mockReq = {} as GetProductsTrendDto
            const selectOptions = service.selectOptions(mockReq)

            expect(selectOptions).toBeDefined()
            expect(selectOptions).toHaveProperty('options')
            expect(selectOptions).toHaveProperty('total')
            expect(selectOptions).toMatchObject({options: /SELECT/, total: /COUNT/})
        })

        it('method paramsQuery', () => {
            const req_1 = {} as any
            const req_2 = {
                sort: {
                    sortBy: "lastSeller",
                    isSortDesc: true,
                },
                pagination: {
                    perPage: 5,
                }
            } as any

            const res_1 = service.paramsQuery(req_1)
            const res_2 = service.paramsQuery(req_2)

            expect(res_1).toStrictEqual({
                sortBy: '',
                offset: 0,
                perPage: 10,
                isSortDesc: false,
                currentPage: 1,
                range: {
                    from: expect.any(Number),
                    to: expect.any(Number)
                },
            })
            expect(res_2).toStrictEqual({
                sortBy: 'lastSeller',
                offset: 0,
                perPage: 5,
                isSortDesc: true,
                currentPage: 1,
                range: {
                    from: expect.any(Number),
                    to: expect.any(Number)
                },
            })
        })

        it('method orderSortBy', () => {
            const sortBy_1 = 'lastSeller'
            const isSortAsc = true
            const isSortDesc = false

            const res_1 = service.orderBySort(sortBy_1, isSortAsc)
            const res_1_2 = service.orderBySort(sortBy_1, isSortDesc)
            const res_2 = service.orderBySort('', isSortDesc)

            expect(res_1).toBe('seller ASC')
            expect(res_1_2).toBe('seller DESC')
            expect(res_2).toBe('lastRating ASC, lastSeller DESC')
        })

        it('method query', async () => {
            const select = `SELECT COUNT(*) AS total FROM product_analytic`
            const res = await service.query(select)

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