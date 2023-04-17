import {ArgumentsHost, BadRequestException, Catch, ExceptionFilter} from "@nestjs/common";

@Catch(BadRequestException)
export class ValidationFilters implements ExceptionFilter{
    catch(exception: BadRequestException, host: ArgumentsHost): any {
        return exception.getResponse()
    }
}