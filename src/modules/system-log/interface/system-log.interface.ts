export interface FormLogsI {
    traceId: string
    microservice: string
    service: string
    method: string
    type: string
    data: string
    message: string
}

export interface SystemLogsI {
    traceId: string
    microservice: string
    service: string
    method: string
    type: string
    data: string
    message: string
    eventDate: Date
}

export interface RangeI {
    from : number;
    to : number;
}

export interface TotalI{
    totals: string
}