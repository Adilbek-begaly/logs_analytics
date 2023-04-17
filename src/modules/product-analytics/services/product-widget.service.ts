import {Inject, Injectable} from "@nestjs/common";
import {CLICKHOUSE_ASYNC_INSTANCE_TOKEN, ClickHouseClient} from "@depyronick/nestjs-clickhouse";
import {GetProductWidgetDto} from "../dto/get-product-widget.dto";
import {
    AnalysisProductI,
    AvgAnalysisProductI,
    GraphAnalysisProductI,
    RangeI
} from "../interface/product-analytics.interface";


@Injectable()
export class ProductWidgetService {
    constructor(
        @Inject(CLICKHOUSE_ASYNC_INSTANCE_TOKEN) private analyticService: ClickHouseClient
    ) {}

    async get(req: GetProductWidgetDto) {

        const SELECT = this.selectOptions(req)

        try {
            const avgProductCount = await this.query(SELECT.options) as AvgAnalysisProductI[]
            const productAnalysis: AnalysisProductI = this.changeFiled(avgProductCount)

            return {
                statusCode: 200,
                message: 'SUCCESS',
                entity: productAnalysis,
            }
        } catch (err) {
            return {
                statusCode: 401,
                message: 'NOT_FOUNT_ID',
            }
        }
    }

    changeFiled(avgProductCount: AvgAnalysisProductI[]){

        const productId: string = avgProductCount[avgProductCount.length-1].productId
        const rating: number = avgProductCount[avgProductCount.length-1].lastRating
        const reviewCount: number  = avgProductCount[avgProductCount.length-1].lastReview
        const trend: number = avgProductCount[avgProductCount.length-1].trend
        const ordersAmount: number = avgProductCount[avgProductCount.length-1].ordersAmount
        const sellerCount: number  = avgProductCount[avgProductCount.length-1].lastSeller
        const index: number = avgProductCount[avgProductCount.length-1].index
        const avgPrice: number  = avgProductCount[avgProductCount.length-1].price
        const countAnalysis: number  = Number(avgProductCount[avgProductCount.length-1].countAnalysis)

        return  {
            productId,
            rating,
            reviewCount,
            trend,
            ordersAmount,
            sellerCount,
            index,
            avgPrice,
            countAnalysis,
        }
    }

    selectOptions(req: GetProductWidgetDto) {
        const { range, city, productID } = this.paramsQuery(req)

        const whereCity = city
            ? `AND cityId='${city}'`
            : ``

        const whereProductId = productID
            ? `productId='${productID}'`
            : `productId LIKE '%%'`

        const options = `
                      SELECT productId, join_table_2.lastRating,join_table_2.lastReview, join_table_2.trend,
                      if( 
                          join_table_2.trend > 0,
                          multiply(trend, 10), 1
                      ) AS ordersAmount,
                      argMax(sellerCount, eventDate) AS lastSeller,
                      multiIf( 
                          lastSeller > 0 and lastSeller < 3, 1, 
                          lastSeller > 18, 10,
                          ROUND(AVG(sellerCount) / 2)
                      ) AS index,
                      ROUND(AVG(price)) AS price,
                      COUNT(*) AS countAnalysis 
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
                            GROUP BY productId
                      ) AS join_table_2
                      ON (p_a_table_1.productId=join_table_2.productId)
                      WHERE ${ whereProductId }
                      ${ whereCity }
                      AND (eventDate BETWEEN ${range.from} AND ${range.to})
                      GROUP BY productId, join_table_2.trend, 
                      join_table_2.lastRating, join_table_2.lastReview`.trim()

        const total = `
                      SELECT productId, category, brand, cityId,
                      arraySort((x,y) -> y, groupArray(rating), groupArray(eventDate)) as ratingGraph,
                      arraySort((x,y) -> y, groupArray(reviewCount), groupArray(eventDate)) as reviewGraph,
                      arraySort((x,y) -> y, groupArray(sellerCount), groupArray(eventDate)) as sellerGraph,
                      arraySort((x,y) -> y, groupArray(price), groupArray(eventDate)) as priceGraph,
                      arraySort(groupArray(toInt32(toDateTime(eventDate, 'UTC')))) as eventDateGraph
                      FROM product_analytic
                      WHERE (productId = '${productID}')
                      ${ whereCity }
                      AND (eventDate BETWEEN ${range.from} AND ${range.to})
                      GROUP BY productId, category, brand, cityId`.trim()

        return {
            total,
            options,
        }
    }

    paramsQuery(req: GetProductWidgetDto) {

        const rangeTimeTo = Math.ceil((Date.now()) / 1000)
        const rangeTimeFrom = Math.ceil(rangeTimeTo - (30 * 24 * 60 * 60))
        const city: string = req.filter?.city as string || ""
        const productID: string = req.filter?.productId as string || ""
        const range: RangeI = {
            from: +req.filter?.date?.from as number || rangeTimeFrom,
            to: +req.filter?.date?.to as number || rangeTimeTo
        }

        return {
            city,
            range,
            productID,
        }
    }

    query(select: string) {
        return this.analyticService
            .queryPromise(select)
            .catch(err => console.log(err))
    }
}