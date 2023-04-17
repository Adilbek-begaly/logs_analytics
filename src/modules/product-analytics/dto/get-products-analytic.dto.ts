import {
    IsBoolean, IsInt,
    IsNumber,
    IsObject,
    IsOptional, IsPositive,
    IsString, Max, Min,
    ValidateNested
} from "class-validator";
import {Type} from "class-transformer";
import {ApiProperty} from "@nestjs/swagger";

export class IndexMinMax{
    @ApiProperty({required: false})
    @IsInt()
    @IsOptional()
    @Min(0)
    @Max(10)
    min: number

    @ApiProperty({required: false})
    @IsInt()
    @IsOptional()
    @Min(0)
    @Max(10)
    max: number
}

export class PriceMinMax{
    @ApiProperty({required: false})
    @IsNumber()
    @IsOptional()
    min: number

    @ApiProperty({required: false})
    @IsNumber()
    @IsOptional()
    max: number
}

export class DateDto{
    @ApiProperty({required: false})
    @IsNumber()
    @IsOptional()
    readonly from: number

    @ApiProperty({required: false})
    @IsNumber()
    @IsOptional()
    readonly to: number
}

export class FilterProductsDto{
    @ApiProperty({required: false})
    @IsString({each: true})
    @IsOptional()
    productId: string[]

    @ApiProperty({required: false, type: 'array', items: {type: 'number'}})
    @IsNumber({},{ each: true })
    @IsOptional()
    category: number[]

    @ApiProperty({required: false, type: 'array', items: {type: 'number'}})
    @IsNumber({},{ each: true })
    @IsOptional()
    brand: number[]

    @ApiProperty({required: false})
    @IsString()
    @IsOptional()
    readonly city: string

    @ApiProperty({required: false})
    @IsBoolean()
    @IsOptional()
    readonly trend: boolean

    @ApiProperty({required: false, description: ''})
    @IsObject()
    @ValidateNested()
    @Type(() =>IndexMinMax)
    @IsOptional()
    readonly index: IndexMinMax

    @ApiProperty({required: false, description: ''})
    @IsObject()
    @ValidateNested()
    @Type(() => PriceMinMax)
    @IsOptional()
    readonly price: PriceMinMax

    @ApiProperty({required: false, description: ''})
    @IsObject()
    @ValidateNested()
    @Type(() =>DateDto)
    @IsOptional()
    readonly date: DateDto
}

export class SortDto{
    @IsString()
    @IsOptional()
    readonly sortBy: string;

    @IsBoolean()
    @IsOptional()
    readonly isSortDesc: boolean;
}

export class PaginationDto {
    @IsInt()
    @Max(100)
    @IsPositive()
    @IsOptional()
    readonly perPage: number;

    @IsInt()
    @IsPositive()
    @IsOptional()
    readonly currentPage: number;
}

export class GetProductsAnalyticDto {
    @ApiProperty({required: false})
    @IsString()
    @IsOptional()
    readonly search: string;

    @ApiProperty({required: false})
    @IsObject()
    @ValidateNested()
    @Type(() => FilterProductsDto)
    @IsOptional()
    readonly filter: FilterProductsDto

    @ApiProperty({required: false})
    @IsObject()
    @ValidateNested()
    @Type(() => SortDto)
    @IsOptional()
    readonly sort: SortDto

    @ApiProperty({required: false})
    @IsObject()
    @ValidateNested()
    @Type(() => PaginationDto)
    @IsOptional()
    readonly pagination: PaginationDto
}