import {ApiProperty} from "@nestjs/swagger";

class OkResponseProductsAnalytics {
    @ApiProperty()
    productId: string
    @ApiProperty()
    category: number
    @ApiProperty()
    brand: number
    @ApiProperty()
    cityId: string
    @ApiProperty()
    lastRating: number
    @ApiProperty()
    lastReview: number
    @ApiProperty()
    trend: number
    @ApiProperty()
    ordersAmount: number
    @ApiProperty()
    lastSeller: number
    @ApiProperty()
    index: number
    @ApiProperty()
    avgPrice: number
    @ApiProperty()
    countAnalysis: number
}

class OkResponseWidgetProduct {
    @ApiProperty()
    productId: string
    @ApiProperty()
    rating: number
    @ApiProperty()
    reviewCount: number
    @ApiProperty()
    trend: number
    @ApiProperty()
    ordersAmount: number
    @ApiProperty()
    sellerCount: number
    @ApiProperty()
    index: number
    @ApiProperty()
    avgPrice: number
    @ApiProperty()
    countAnalysis: number
}

export class GetApiOkResProductsAnalytics {
    @ApiProperty({ example: 200 })
    statusCode: number;

    @ApiProperty({ example: 'SUCCESS' })
    message: string

    @ApiProperty({ type: [OkResponseProductsAnalytics] })
    list: OkResponseProductsAnalytics

    @ApiProperty({ example: 0 })
    total: number
}

export class GetApiResProducts {
    @ApiProperty({ example: 200 })
    statusCode: number;

    @ApiProperty({ example: 'SUCCESS' })
    message: string

    @ApiProperty({ example: [] })
    list: []

    @ApiProperty({ example: 0 })
    total: number
}

export class GetApiOkResWidgetProduct {
    @ApiProperty({ example: 200 })
    statusCode: number;

    @ApiProperty({ example: 'SUCCESS' })
    message: string

    @ApiProperty({ type: [OkResponseWidgetProduct] })
    list: OkResponseWidgetProduct

    @ApiProperty({ example: 0 })
    total: number
}

export class GetApiResWidget {
    @ApiProperty({ example: 401 })
    statusCode: number;

    @ApiProperty({ example: 'NOT_FOUNT_ID' })
    message: string
}