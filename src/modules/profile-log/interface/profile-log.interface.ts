export interface FormProfileLogsI {
    traceId: string
    microservice: string
    service: string
    method: string
    message: string
}

export interface GetProfileLogsI {
    traceId: string
    microservice: string
    service: string
    method: string
    message: string
    eventDate: Date
}

export interface DateI {
    from: number,
    to: number,
}

export interface TotalI {
    total: number
}