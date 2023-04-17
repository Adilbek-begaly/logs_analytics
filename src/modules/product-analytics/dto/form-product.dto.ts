import {ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber, IsString, Max, ValidateNested} from "class-validator";
import {Type} from "class-transformer";
import {ApiProperty} from "@nestjs/swagger";

export class CreateTableProductsDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    productId: string

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    category: number

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    brand: number

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    source: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    cityId: string

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    reviewCount: number

    @ApiProperty()
    @IsNumber()
    @Max(5)
    @IsNotEmpty()
    rating: number

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    sellerCount: number

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    price: number
}

export class FormProductDto {
    @ApiProperty({type: [CreateTableProductsDto]})
    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({each: true})
    @Type(() => CreateTableProductsDto)
    list: CreateTableProductsDto[]
}