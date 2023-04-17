import {Controller, Post, UseFilters, UsePipes, ValidationPipe} from "@nestjs/common";
import {EventPattern, MessagePattern, Payload} from "@nestjs/microservices";
import {ProductAnalyticsService} from "./services/product-analytics.service";
import {FormProductDto} from "./dto/form-product.dto";
import {ProductTrendService} from "./services/product-trend.service";
import {ProductWidgetService} from "./services/product-widget.service";
import {ProductFormService} from "./services/product-form.service";
import {GetProductsAnalyticDto} from "./dto/get-products-analytic.dto";
import {GetProductsTrendDto} from "./dto/get-products-trend.dto";
import {GetProductWidgetDto} from "./dto/get-product-widget.dto";
import {ProductAnalyticsTopics} from "../utils/enumis/topics.enum";
import {ValidationFilters} from "../../common/filters/validation-filters";
import {ApiBody, ApiOkResponse, ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger";
import {
    GetApiOkResProductsAnalytics,
    GetApiOkResWidgetProduct,
    GetApiResProducts,
    GetApiResWidget
} from "./dto/response.dto";


@UseFilters(ValidationFilters)
@UsePipes( new ValidationPipe({ whitelist: true }))
@ApiTags('Product Controller')


@Controller()
export class ProductController {
    constructor(
        private readonly productFormService: ProductFormService,
        private readonly productTrendService: ProductTrendService,
        private readonly productAnalyticService: ProductAnalyticsService,
        private readonly productWidgetService: ProductWidgetService,
    ) {}

    @EventPattern(ProductAnalyticsTopics.fromProductsAnalytics)
    postProduct(@Payload() req: FormProductDto) {
        this.productFormService.handleBatch(req.list)
    }

    @MessagePattern(ProductAnalyticsTopics.getProductsAnalytics)
    getProduct(@Payload() req: GetProductsAnalyticDto) {
        return this.productAnalyticService.get(req)
    }

    @MessagePattern(ProductAnalyticsTopics.getProductWidget)
    getWidgetProduct(@Payload() req: GetProductWidgetDto) {

        return this.productWidgetService.get(req)
    }

    @MessagePattern(ProductAnalyticsTopics.getProductsTrend)
    getTrendProducts(@Payload() req: GetProductsTrendDto) {
        return this.productTrendService.get(req)
    }


    @ApiOperation({description: 'write products-analytics'})
    @ApiBody({type: FormProductDto})
    @ApiOkResponse({description: 'EventPattern (никакой ответ не возвращет)'})
    @Post(ProductAnalyticsTopics.fromProductsAnalytics)
    post(@Payload() req: FormProductDto) {
        this.productFormService.handleBatch(req.list)
    }


    @ApiOperation({description: 'get products analytics'})
    @ApiBody({type: GetProductsAnalyticDto})
    @ApiOkResponse({type: GetApiOkResProductsAnalytics})
    @ApiResponse({type: GetApiResProducts})
    @Post(ProductAnalyticsTopics.getProductsAnalytics)
    get(@Payload() req: GetProductsAnalyticDto) {
        return this.productAnalyticService.get(req)
    }

    @ApiOperation({description: 'get widget product'})
    @ApiBody({type: GetProductWidgetDto})
    @ApiOkResponse({type: GetApiOkResWidgetProduct})
    @ApiResponse({type: GetApiResWidget, status: 401})
    @Post(ProductAnalyticsTopics.getProductWidget)
    getWidget(@Payload() req: GetProductWidgetDto) {
        return this.productWidgetService.get(req)
    }

    @ApiOperation({description: 'get trend products'})
    @ApiBody({type: GetProductsTrendDto})
    @ApiOkResponse({type: GetApiOkResProductsAnalytics})
    @ApiResponse({type: GetApiResProducts})
    @Post(ProductAnalyticsTopics.getProductsTrend)
    getTrendProduct(@Payload() req: GetProductsTrendDto) {
        return this.productTrendService.get(req)
    }
}