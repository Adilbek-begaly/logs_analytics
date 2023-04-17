import {ApiProperty} from "@nestjs/swagger";

class OkResponseSystemLog {
    @ApiProperty()
    traceId: string
    @ApiProperty()
    microservice: string
    @ApiProperty()
    service: string
    @ApiProperty()
    method: string
    @ApiProperty()
    type: string
    @ApiProperty()
    data: string
    @ApiProperty()
    message: string
    @ApiProperty()
    eventDate: Date
}

export class GetApiOkResSystemLogs {
    @ApiProperty({ example: 200 })
    statusCode: number;

    @ApiProperty({ example: 'SUCCESS' })
    message: string

    @ApiProperty({ type: [OkResponseSystemLog] })
    list: OkResponseSystemLog

    @ApiProperty({ example: 0 })
    total: number
}

export class GetApiResSystemLogs {
    @ApiProperty({ example: 200 })
    statusCode: number;

    @ApiProperty({ example: 'SUCCESS' })
    message: string

    @ApiProperty({ example: [] })
    list: []

    @ApiProperty({ example: 0 })
    total: number
}