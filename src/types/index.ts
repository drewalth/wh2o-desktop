export type Gage = {
    id: number
    name: string
    siteId: string
    createdAt: Date
    updatedAt: Date
}

export interface CreateGageDto {
    name: string
    siteId: string
}