import {
    IsBoolean,
    IsInt,
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

export class FilterTrendDto  {
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

export class SortDto {
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

export class GetProductsTrendDto{
    @ApiProperty({required: false})
    @IsObject()
    @ValidateNested()
    @Type(() => FilterTrendDto)
    @IsOptional()
    readonly filter: FilterTrendDto

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