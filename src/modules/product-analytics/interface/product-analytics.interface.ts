export interface FormProductI {
    productId: string
    category: number
    brand: number
    source: string
    cityId: string
    reviewCount: number
    rating: number
    sellerCount: number
    price: number
}

export interface ProductAnalytic{
    productId: string
    category: number
    brand: number
    source: string
    cityId: string
    reviewCount: number
    rating: number
    sellerCount: number
    price: number
    evenDate: Date
}

export interface TrendProducts {
    productId: string
    category: number
    brand: number
    cityId: string
    lastRating: number
    lastReview: number
    trend: number
    ordersAmount: number
    lastSeller: number
    index: number
    avgPrice: number
    countAnalysis: number
}

export interface PriceI {
    priceMin: number
    priceMax: number
}

export interface RangeI {
    from: number;
    to: number;
}

export interface IndexRivalI {
    indexMin: number
    indexMax: number
}

export interface AnalysisProductI {
    productId: string
    rating: number
    reviewCount: number
    trend: number
    ordersAmount: number
    sellerCount: number
    index: number
    avgPrice: number
    countAnalysis: number
}

export interface AvgAnalysisProductI {
    productId: string
    lastRating: number
    lastReview: number
    trend: number
    ordersAmount: number
    lastSeller: number
    index: number
    price: number
    countAnalysis: string
}

export interface GraphAnalysisProductI {
    productId: string
    category: number
    brand: number
    cityId: string
    ratingGraph: Array<number>
    reviewGraph: Array<number>
    sellerGraph: Array<number>
    priceGraph: Array<number>
    eventDateGraph: Array<number>
}

export interface TotalI {
    count: string
}