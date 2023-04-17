import {ArrayNotEmpty, IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested} from "class-validator";
import {Type} from "class-transformer";
import {ApiProperty} from "@nestjs/swagger";

export class CreateTableProfileLogDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    public traceId: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    public microservice: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    public service: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    public method: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    public message: string;
}

export class FormProfileLogDto {
    @ApiProperty({type: [CreateTableProfileLogDto]})
    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({each: true})
    @Type(() => CreateTableProfileLogDto)
    list: CreateTableProfileLogDto[]
}