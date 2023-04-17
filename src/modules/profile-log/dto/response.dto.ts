import {ApiProperty} from "@nestjs/swagger";

class OkResponseProfileLog {
    @ApiProperty()
    traceId: string
    @ApiProperty()
    microservice: string
    @ApiProperty()
    service: string
    @ApiProperty()
    method: string
    @ApiProperty()
    message: string
    @ApiProperty()
    eventDate: Date
}

export class GetApiOkResProfileLogs {
    @ApiProperty({ example: 200 })
    statusCode: number;

    @ApiProperty({ example: 'SUCCESS' })
    message: string

    @ApiProperty({ type: [OkResponseProfileLog] })
    list: OkResponseProfileLog

    @ApiProperty({ example: 0 })
    total: number
}

export class GetApiResProfileLogs {
    @ApiProperty({ example: 200 })
    statusCode: number;

    @ApiProperty({ example: 'SUCCESS' })
    message: string

    @ApiProperty({ example: [] })
    list: []

    @ApiProperty({ example: 0 })
    total: number
}