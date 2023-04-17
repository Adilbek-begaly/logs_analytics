import {Inject, Injectable} from "@nestjs/common";
import {CLICKHOUSE_ASYNC_INSTANCE_TOKEN, ClickHouseClient} from "@depyronick/nestjs-clickhouse";
import {GetProductsAnalyticDto} from "../dto/get-products-analytic.dto";
import {
    TotalI,
    IndexRivalI,
    PriceI,
    RangeI,
    TrendProducts
} from "../interface/product-analytics.interface";


@Injectable()
export class ProductAnalyticsService {
    constructor(
        @Inject(CLICKHOUSE_ASYNC_INSTANCE_TOKEN) private analyticService: ClickHouseClient
    ) {}

    async get(req: GetProductsAnalyticDto) {

        const SELECT = this.selectOptions(req)
        const findFilterProducts = await this.query(SELECT.options) as TrendProducts[]
        const total = await this.query(SELECT.total) as TotalI[]

        return {
            statusCode: 200,
            message: 'SUCCESS',
            list: findFilterProducts,
            total: +total[total.length-1].count,
        }
    }

    selectOptions(req: GetProductsAnalyticDto) {
        const {
            city,
            range,
            price,
            trend,
            brand,
            offset,
            search,
            sortBy,
            indexI,
            perPage,
            category,
            isSortDesc,
            productArrayId,
        } = this.paramsQuery(req)

        const index: IndexRivalI = this.rivalIndex(indexI)
        const orderBySort = this.orderBySort(sortBy, isSortDesc)
        const whereOperatorIN = this.whereOperatorIN(city, brand, category, search)
        const productId = JSON.stringify(productArrayId).replace(/"/g, "'")

        const whereProductsIN = productArrayId.length > 0
            ? `AND productId IN (${productId})`
            : ``
        const orderByTrend = trend
            ? `trend DESC,`
            : ``

        let options = `
                    SELECT productId, category, brand, cityId, 
                    join_table_2.lastRating, join_table_2.lastReview,join_table_2.trend,
                    if( 
                        join_table_2.trend > 0,
                        multiply(trend, 10), 0
                    ) AS ordersAmount,
                    argMax(sellerCount, eventDate) AS lastSeller,
                    multiIf( 
                        lastSeller > 0 and lastSeller < 3, 1, 
                        lastSeller > 18, 10,
                        ROUND(AVG(sellerCount) / 2)
                    ) AS index,
                    ROUND(AVG(price)) AS avgPrice,
                    toInt32(COUNT(*)) AS countAnalysis 
                    FROM product_analytic AS p_a_table_1
                    JOIN (
                            SELECT productId,
                            if(
                                minus(argMax(reviewCount, eventDate), argMin(reviewCount, eventDate)) < 0 , 0,
                                minus(argMax(reviewCount, eventDate), argMin(reviewCount, eventDate))
                            ) AS trend,
                            argMax(rating, eventDate) AS lastRating,
                            argMax(reviewCount, eventDate) AS lastReview
                            FROM product_analytic 
                            WHERE (eventDate BETWEEN ${range.from} AND ${range.to})
                            AND (price BETWEEN ${price.priceMin} AND ${price.priceMax})
                            AND (sellerCount BETWEEN ${index.indexMin} AND ${index.indexMax})
                            GROUP BY productId
                    ) AS join_table_2
                    ON (p_a_table_1.productId=join_table_2.productId)
                    WHERE ${ whereOperatorIN } ${ whereProductsIN }
                    AND (productId LIKE '%${search}%')
                    AND (eventDate BETWEEN ${range.from} AND ${range.to})
                    AND (price BETWEEN ${price.priceMin} AND ${price.priceMax})
                    AND (sellerCount BETWEEN ${index.indexMin} AND ${index.indexMax})
                    GROUP BY productId, category, brand, cityId, join_table_2.trend, 
                             join_table_2.lastRating, join_table_2.lastReview
                    ORDER BY ${orderByTrend} ${orderBySort}
                    LIMIT ${perPage} OFFSET ${offset}`.trim()

        let total = `
                    SELECT COUNT(DISTINCT productId, cityId) AS count FROM product_analytic
                    WHERE ${ whereOperatorIN } ${ whereProductsIN }
                    AND (productId LIKE '%${search}%')
                    AND (eventDate BETWEEN ${range.from} AND ${range.to})
                    AND (price BETWEEN ${price.priceMin} AND ${price.priceMax})
                    AND (sellerCount BETWEEN ${index.indexMin} AND ${index.indexMax})`.trim()

        return {
            options,
            total,
        }
    }

    paramsQuery(req: GetProductsAnalyticDto) {
        const perPage = +req.pagination?.perPage as number || 10
        const currentPage = +req.pagination?.currentPage as number || 1
        const offset = (currentPage -1) * perPage
        const search = req?.search as string || ""
        const city = req.filter?.city as string || ""
        const sortBy = req.sort?.sortBy as string || ""
        const trend = req.filter?.trend as boolean || false
        const isSortDesc = req.sort?.isSortDesc as boolean || false
        const brand: number[] = req.filter?.brand as any[] || []
        const category: number[] = req.filter?.category as any[] || []
        const productArrayId: string[] = req.filter?.productId as any[] || []
        const range: RangeI = {
            from: +req.filter?.date?.from as number || 0,
            to: +req.filter?.date?.to as number || Date.now()
        }
        const indexI: IndexRivalI = {
            indexMin: +req.filter?.index?.min as number || 1,
            indexMax: +req.filter?.index?.max as number || 10
        }
        const price: PriceI = {
            priceMin: +req.filter?.price?.min as number || 0,
            priceMax: +req.filter?.price?.max as number || 100000000
        }

        return {
            city,
            range,
            price,
            trend,
            brand,
            offset,
            search,
            sortBy,
            indexI,
            perPage,
            category,
            isSortDesc,
            currentPage,
            productArrayId,
        }
    }

    orderBySort(sortBy: string, isSortDesc: boolean) {
        return sortBy
            ? sortBy==="lastRating"
                ? isSortDesc
                    ? `lastRating ASC`
                    : `lastRating DESC`
            : sortBy==="lastSeller"
                ? isSortDesc
                        ? `lastSeller ASC`
                        : `lastSeller DESC`
            : sortBy==="lastReview" && isSortDesc
                ? `lastReview ASC`
                : `lastReview DESC`
            : `lastRating DESC, lastSeller ASC`
    }

    whereOperatorIN(city: string, brand: number[], category: number[], search: string) {
        const operatorIN = city
            ? category.length && brand.length > 0 && city
                ? `(category IN (${category}) AND brand IN (${brand})) AND cityId='${city}'`
                : category.length > 0 && city
                    ? `category IN (${category}) AND cityId='${city}'`
                    : brand.length > 0 && city
                        ? `brand IN (${brand}) AND cityId='${city}'`
                        : `cityId='${city}'`
            : category.length && brand.length > 0
                ? `(category IN (${category}) AND brand IN (${brand}))`
                : category.length > 0
                    ? `category IN (${category})`
                    : brand.length > 0
                        ? `brand IN (${brand})`
                        : `productId LIKE '%${search}%'`

        return operatorIN
    }

    rivalIndex(index: IndexRivalI) {

        if (index.indexMin === 1 && index.indexMax === 10) {
            index.indexMin = 1
            index.indexMax= 200
        }
        else if (index.indexMin !== 1 && index.indexMax !== 10) {
            index.indexMin *= 2
            index.indexMax *= 2
        }
        else if (index.indexMin !== 1 && index.indexMax === 10) {
            index.indexMin *= 2
            index.indexMax = 200
        }
        else if (index.indexMin === 1 && index.indexMax !== 10) {
            index.indexMin = 1
            index.indexMax *= 2
        }
        return index
    }

    stringifyProductsIDArray(productsID: string[]) {
        let stringifyProductsIDArray = JSON.stringify(productsID)
        let replacedProductsID;
        for (let i = 0; i < productsID.length * 2; i++ ) {
            replacedProductsID = stringifyProductsIDArray.replace('"', "'" )
            stringifyProductsIDArray = replacedProductsID;
        }
        return replacedProductsID;
    }

    query(select: string){
        return this.analyticService
            .queryPromise(select)
            .catch(err => console.log(err))
    }
}