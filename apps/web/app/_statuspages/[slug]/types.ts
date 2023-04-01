import { Platform } from "@prisma/client"



export type Metrics = {
    p75: number
    p90: number
    p95: number
    p99: number
    count: number
    errors: number
}

export type MetricsOverTime = (Metrics & { time: number })[]



export type EndpointData = {

    id: string,
    name: string,
    regions: {
        [regionId: string]: Metrics & {
            id: string
            platform: Platform
            name: string,
            series: MetricsOverTime
        }
    }
}
