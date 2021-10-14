export enum GageSource {
    USGS = 'usgs'
}

export type Gage = {
    id: number
    name: string
    source: GageSource
    siteId: string
    metric: string
    reading: number
    delta: number
    createdAt: Date
    updatedAt: Date
}

export interface CreateGageDto {
    name: string
    source: GageSource
    siteId: string
}

export type RequestStatus = 'loading' | 'success' | 'failure'
