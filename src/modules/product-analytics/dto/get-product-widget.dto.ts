import {
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsObject,
    IsOptional,
    IsPositive,
    IsString,
    Max,
    ValidateNested
} from "class-validator";
import {Type} from "class-transformer";
import {ApiProperty} from "@nestjs/swagger";

export class DateDto{
    @IsNumber()
    @IsOptional()
    readonly from: number

    @IsNumber()
    @IsOptional()
    readonly to: number
}

export class FilterWidgetDto  {
    @ApiProperty({required: false})
    @IsString()
    @IsNotEmpty()
    readonly productId: string

    @ApiProperty({required: false})
    @IsString()
    @IsOptional()
    readonly city: string

    @ApiProperty({required: false})
    @IsObject()
    @ValidateNested()
    @Type(() =>DateDto)
    @IsOptional()
    readonly date: DateDto
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

export class GetProductWidgetDto {
    @ApiProperty({required: false})
    @IsObject()
    @ValidateNested()
    @Type(() => FilterWidgetDto)
    readonly filter: FilterWidgetDto

    @ApiProperty({required: false})
    @IsObject()
    @ValidateNested()
    @Type(() => PaginationDto)
    @IsOptional()
    readonly pagination: PaginationDto
}