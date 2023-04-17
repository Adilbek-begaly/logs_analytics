import {Injectable} from "@nestjs/common";
import {Process, Processor} from "@nestjs/bull";
import {Job} from "bull";
import {BatchTimeTaskService} from "./batch-time-task.sevice";


@Injectable()
@Processor('LOG_TASK')
export class BatchTimeProcess {
    constructor(private readonly batchTimeService: BatchTimeTaskService) {}

    @Process()
    public processTask(job: Job<{taskData}>) {
        try {
             this.batchTimeService.handleTask()
        }
        catch (err: any) {
            console.log(err)
        }
    }
}