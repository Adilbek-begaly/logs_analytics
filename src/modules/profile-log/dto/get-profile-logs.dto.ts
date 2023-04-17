import {IsBoolean, IsNumber, IsObject, IsOptional, IsString, Max, ValidateNested} from "class-validator";
import {Type} from "class-transformer";
import {ApiProperty} from "@nestjs/swagger";


export class DateDto {
    @IsNumber()
    @IsOptional()
    from: number

    @IsNumber()
    @IsOptional()
    to: number
}

export class FilterDto {
    @IsString()
    @IsOptional()
    microservice: string

    @IsObject()
    @ValidateNested({each:true})
    @Type(() => DateDto)
    @IsOptional()
    date: DateDto
}

export class SortDto {
    @IsString()
    @IsOptional()
    sortBy: string

    @IsBoolean()
    @IsOptional()
    isSortDesc: boolean
}

export class PaginationDto {
    @IsNumber()
    @Max(100)
    @IsOptional()
    perPage: number

    @IsNumber()
    @IsOptional()
    currentPage: number
}

export class GetProfileLogDto {
    @ApiProperty({required: false})
    @IsString()
    @IsOptional()
    search: string

    @ApiProperty({required: false})
    @IsObject()
    @ValidateNested({each:true})
    @Type(() => FilterDto)
    @IsOptional()
    filter: FilterDto

    @ApiProperty({required: false})
    @IsObject()
    @ValidateNested({each: true})
    @Type(() => SortDto)
    @IsOptional()
    sort: SortDto

    @ApiProperty({required: false})
    @IsObject()
    @ValidateNested({each:true})
    @Type(() => PaginationDto)
    @IsOptional()
    pagination: PaginationDto
}

