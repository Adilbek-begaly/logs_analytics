import {Controller, Post, UseFilters, UsePipes, ValidationPipe} from "@nestjs/common";
import {EventPattern, MessagePattern, Payload} from "@nestjs/microservices";
import {ApiBody, ApiOkResponse, ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger";
import {SystemLogService} from "./system-log.service";
import {FormSystemLogsDto} from "./dto/form-logs.dto";
import {GetSystemLogsDto} from "./dto/get-logs.dto";
import {SystemLogTopics} from "../utils/enumis/topics.enum";
import {ValidationFilters} from "../../common/filters/validation-filters";
import {GetApiOkResSystemLogs, GetApiResSystemLogs} from "./dto/response.dto";


@UsePipes( new ValidationPipe({whitelist: true}))
@UseFilters(ValidationFilters)
@ApiTags('System-log Controller')

@Controller()
export class SystemLogController {
    constructor( readonly logsService: SystemLogService ) {}

    @EventPattern(SystemLogTopics.formSystemLogs)
    postData(@Payload() req: FormSystemLogsDto ){
        this.logsService.handleBatch(req.list)
    }

    @MessagePattern(SystemLogTopics.getSystemLogs)
    getData(@Payload() req: GetSystemLogsDto) {
        return this.logsService.get(req)
    }


    @ApiOperation({description: 'write system-logs'})
    @ApiBody({type: FormSystemLogsDto})
    @ApiOkResponse({description: 'EventPattern (никакой ответ не возвращет)'})
    @Post(SystemLogTopics.formSystemLogs)
    post(@Payload() req: FormSystemLogsDto) {
        this.logsService.handleBatch(req.list)
    }

    @ApiOperation({description: 'get system-logs'})
    @ApiBody({type: GetSystemLogsDto})
    @ApiOkResponse({type: GetApiOkResSystemLogs})
    @ApiResponse({type: GetApiResSystemLogs})
    @Post(SystemLogTopics.getSystemLogs)
    get(@Payload() req: GetSystemLogsDto) {
        return this.logsService.get(req)
    }
}