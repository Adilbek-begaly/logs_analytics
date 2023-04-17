import {IsBoolean, IsNumber, IsObject, IsOptional, IsString, Max, ValidateNested} from "class-validator";
import {Type} from "class-transformer";
import {ApiProperty} from "@nestjs/swagger";


export class DateDto {
    @ApiProperty({required: false})
    @IsNumber()
    @IsOptional()
    readonly from: number

    @ApiProperty({required: false})
    @IsNumber()
    @IsOptional()
    readonly to: number
}

export class FilterDto {
    @ApiProperty({required: false})
    @IsString()
    @IsOptional()
    readonly type: string

    @ApiProperty({required: false})
    @IsString()
    @IsOptional()
    readonly microservice: string

    @ApiProperty({required: false})
    @IsObject()
    @ValidateNested({each:true})
    @Type(() => DateDto)
    @IsOptional()
    readonly date: DateDto
}

export class SortDto {
    @ApiProperty({required: false})
    @IsString()
    @IsOptional()
    readonly sortBy: string

    @ApiProperty({required: false})
    @IsBoolean()
    @IsOptional()
    readonly isSortDesc: boolean
}

export class PaginationDto {
    @ApiProperty({required: false})
    @IsNumber()
    @Max(100)
    @IsOptional()
    readonly perPage: number

    @ApiProperty({required: false})
    @IsNumber()
    @IsOptional()
    readonly currentPage: number
}

export class GetSystemLogsDto {
    @ApiProperty({required: false})
    @IsString()
    @IsOptional()
    readonly search: string

    @ApiProperty({required: false})
    @IsObject()
    @ValidateNested({each:true})
    @Type(() => FilterDto)
    @IsOptional()
    readonly filter: FilterDto

    @ApiProperty({required: false})
    @IsObject()
    @ValidateNested({each: true})
    @Type(() => SortDto)
    @IsOptional()
    readonly sort: SortDto

    @ApiProperty({required: false})
    @IsObject()
    @ValidateNested({each:true})
    @Type(() => PaginationDto)
    @IsOptional()
    readonly pagination: PaginationDto
}

