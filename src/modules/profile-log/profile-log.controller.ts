import {Controller, Post, UseFilters, UsePipes, ValidationPipe} from "@nestjs/common";
import {ProfileLogService} from "./profile-log.service";
import {ProfileLogTopics} from "../utils/enumis/topics.enum";
import {EventPattern, MessagePattern, Payload} from "@nestjs/microservices";
import {GetProfileLogDto} from "./dto/get-profile-logs.dto";
import {FormProfileLogDto} from "./dto/form-profile-logs.dto";
import {ValidationFilters} from "../../common/filters/validation-filters";
import {ApiBody, ApiOkResponse, ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger";
import {GetApiOkResProfileLogs, GetApiResProfileLogs} from "./dto/response.dto";

@UsePipes( new ValidationPipe({whitelist: true}))
@UseFilters(ValidationFilters)
@ApiTags('Profile-log Controller')

@Controller()
export class ProfileLogController {
    constructor(
        private readonly profileService: ProfileLogService
    ) {}

    @EventPattern(ProfileLogTopics.formProfileLogs)
    form(@Payload() body: FormProfileLogDto) {
        this.profileService.handleBatch(body.list)
    }

    @MessagePattern(ProfileLogTopics.getProfileLogs)
    get(@Payload() req: GetProfileLogDto) {
        return this.profileService.get(req)
    }


    @ApiOperation({description: 'write profile-logs'})
    @ApiBody({type: FormProfileLogDto})
    @ApiOkResponse({description: 'EventPattern (никакой ответ не возвращет)'})
    @Post(ProfileLogTopics.formProfileLogs)
    formProfile(@Payload() body: FormProfileLogDto) {
        this.profileService.handleBatch(body.list)
    }

    @ApiOperation({description: 'get-profile logs'})
    @ApiBody({type: GetProfileLogDto})
    @ApiOkResponse({type: GetApiOkResProfileLogs})
    @ApiResponse({type: GetApiResProfileLogs})
    @Post(ProfileLogTopics.getProfileLogs)
    getProfile(@Payload() req: GetProfileLogDto) {
        return this.profileService.get(req)
    }
}