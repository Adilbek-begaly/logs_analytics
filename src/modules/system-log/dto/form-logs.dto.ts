import {ArrayNotEmpty, IsArray, IsNotEmpty, IsString, ValidateNested} from "class-validator";
import {Type} from "class-transformer";
import {ApiProperty} from "@nestjs/swagger";

export class CreateTableSystemLogDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    traceId: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    microservice: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    service: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    method: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    type: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    data: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    message: string;
}

export class FormSystemLogsDto {
    @ApiProperty({type: [CreateTableSystemLogDto]})
    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({each:true})
    @Type(() => CreateTableSystemLogDto)
    list: CreateTableSystemLogDto[]
}