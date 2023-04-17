import {ProductWidgetService} from "../services/product-widget.service";
import {Test, TestingModule} from "@nestjs/testing";
import {ClickHouseModule} from "@depyronick/nestjs-clickhouse";
import {GetProductWidgetDto} from "../dto/get-product-widget.dto";
import {ConfigModule, ConfigService} from "@nestjs/config";

describe('ProductWidgetService', () => {
    let moduleRef: TestingModule
    let service: ProductWidgetService

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
            providers: [ProductWidgetService],
        }).compile()

        service = await moduleRef.get<ProductWidgetService>(ProductWidgetService)
    })

    it('should be defined ProductWidgetService', () => {
        expect(service).toBeDefined()
    })

    describe('Unit-testing method ProductWidgetService', () => {

        it('success get method', async () => {
            const req = {filter: {productId: "1701027", city: "750000000"}} as any
            const res = await service.get(req)

            expect(res).toStrictEqual({
                statusCode: 200,
                message: 'SUCCESS',
                entity: expect.any(Object),
            })
        })

        it('error get method', async () => {
            const req = {filter: {productId: "0000", city: "750000000"}} as any
            const res = await service.get(req)

            expect(res).toStrictEqual({
                statusCode: 401,
                message: 'NOT_FOUNT_ID',
            })
        })

        it('method changeFiled', () => {
            const queryDataWidget = [
                {
                    productId: "111",
                    lastRating: 5,
                    lastReview: 20,
                    trend: 4,
                    ordersAmount: 40,
                    lastSeller: 10,
                    index: 5,
                    price: 5000,
                    countAnalysis: 1000,
                }
            ] as any

            const result = {
                productId: "111",
                rating: 5,
                reviewCount: 20,
                trend: 4,
                ordersAmount: 40,
                sellerCount: 10,
                index: 5,
                avgPrice: 5000,
                countAnalysis: 1000,
            }

            const fixesDataWidgetFn = service.changeFiled(queryDataWidget)

            expect(fixesDataWidgetFn).toStrictEqual(result)
        })

        it('method paramsQuery', () => {
            const req = {filter: {productId: "1701027", city: "750000000"}} as any
            const res = service.paramsQuery(req)

            expect(res.productID).toBe("1701027")
            expect(res.city).toBe("750000000")
            expect(res.range).toStrictEqual({
                from: expect.any(Number),
                to: expect.any(Number)
            })
        })

        it('method selectOptions', () => {
            const mockReq = {} as GetProductWidgetDto
            const selectOptions = service.selectOptions(mockReq)

            expect(selectOptions).toBeDefined()
            expect(selectOptions).toHaveProperty('options')
            expect(selectOptions).toHaveProperty('total')
            expect(selectOptions).toMatchObject({options: /SELECT/, total: /COUNT/})
        })

        it('method query', async () => {
            const select = `SELECT COUNT(*) AS total FROM product_analytic`
            const response = await service.query(select)

            expect(response).toBeDefined()
            expect(response).toStrictEqual([
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