import {Inject, Injectable} from "@nestjs/common";
import {CLICKHOUSE_ASYNC_INSTANCE_TOKEN, ClickHouseClient, count} from "@depyronick/nestjs-clickhouse";
import {RangeI, TotalI, TrendProducts} from "../interface/product-analytics.interface";
import {GetProductsTrendDto} from "../dto/get-products-trend.dto";

@Injectable()
export class ProductTrendService {
    constructor(
        @Inject(CLICKHOUSE_ASYNC_INSTANCE_TOKEN) private analyticService: ClickHouseClient,
    ) {}

    async get(req: GetProductsTrendDto) {

        const SELECT = this.selectOptions(req)

        const productsTrendTop = await this.query(SELECT.options) as TrendProducts[]
        const totalProducts = await this.query(SELECT.total) as TotalI[]
        const total: number = +totalProducts[totalProducts.length - 1].count

        return {
            statusCode: 200,
            message: 'SUCCESS',
            list: productsTrendTop,
            total,
        }
    }

    selectOptions(req: GetProductsTrendDto) {
        const {
            range,
            sortBy,
            offset,
            perPage,
            isSortDesc,
        } = this.paramsQuery(req)
        const orderSortBy = this.orderBySort(sortBy, isSortDesc)

        let options =`
                    SELECT productId, category, brand, cityId, 
                    join_table_2.lastRating, join_table_2.lastReview, join_table_2.trend,
                    if(
                        join_table_2.trend > 0,
                        multiply(trend, 10), 1
                    ) AS ordersAmount,
                    argMax(sellerCount, eventDate) AS lastSeller,
                    multiIf( 
                        lastSeller > 0 and lastSeller < 3, 1, 
                        lastSeller > 18, 10,
                        ROUND(AVG(sellerCount) / 2)
                    ) as  index,
                    ROUND(AVG(price)) AS avgPrice,
                    COUNT(*) AS countAnalysis 
                    FROM product_analytic AS p_a_table_1
                    JOIN (
                            SELECT productId,
                            if( 
                                minus(argMax(reviewCount, eventDate), argMin(reviewCount, eventDate)) < 0, 0,
                                minus(argMax(reviewCount, eventDate), argMin(reviewCount, eventDate))
                            ) AS trend,
                            argMax(rating, eventDate) AS lastRating,
                            argMax(reviewCount, eventDate) AS lastReview
                            FROM product_analytic 
                            WHERE (eventDate BETWEEN ${range.from} AND ${range.to})
                            GROUP BY productId
                    ) AS join_table_2
                    ON p_a_table_1.productId=join_table_2.productId
                    WHERE (eventDate BETWEEN ${range.from} AND ${range.to})
                    GROUP BY productId, category, brand, cityId, 
                             join_table_2.trend, join_table_2.lastRating, join_table_2.lastReview
                    ORDER BY trend DESC, ${orderSortBy}
                    LIMIT ${perPage} OFFSET ${offset}`.trim()

        let total = `
                    SELECT COUNT(DISTINCT productId, cityId) AS count
                    FROM product_analytic
                    WHERE (eventDate BETWEEN ${range.from} AND ${range.to})`.trim()

        return {
            options,
            total,
        }
    }

    paramsQuery(req: GetProductsTrendDto) {

        const defaultTimeTo = Math.ceil((Date.now())/1000)
        const defaultTimeFrom = Math.ceil(defaultTimeTo - (7 * 24 * 60 * 60 ))
        const perPage: number = req.pagination?.perPage as number || 10
        const currentPage: number = req.pagination?.currentPage as number || 1
        const offset: number = (currentPage - 1) * perPage
        const sortBy: string = req.sort?.sortBy as string || ""
        const isSortDesc: boolean = req.sort?.isSortDesc || false
        const range: RangeI = {
            from: +req.filter?.date?.from as number || defaultTimeFrom,
            to: +req.filter?.date?.to as number || defaultTimeTo
        }

        return {
            range,
            sortBy,
            offset,
            perPage,
            isSortDesc,
            currentPage,
        }
    }

    orderBySort(sortBy: string, isSortDesc: boolean) {
        const sort = sortBy
            ? sortBy === "lastSeller"
                ? sortBy === "lastSeller" && isSortDesc
                    ? `seller ASC`
                    : `seller DESC`
                : sortBy === "lastRating" && isSortDesc
                    ? `lastRating ASC`
                    : `lastRating DESC`
            : `lastRating ASC, lastSeller DESC`
        return sort
    }

    query(select: string) {
        return this.analyticService
            .queryPromise(select)
            .catch(err => console.log(err))
    }
}