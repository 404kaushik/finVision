import { StockData } from "@/types/stock"

export async function fetchStockData(symbol: string): Promise<StockData | null>{
    try{
        const response = await fetch('https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.NEXT_PUBLIC_FINNHUB_API_KEY}')
        const data = await response.json()
        
        if (!response.ok) throw new Error(data.error || 'Failed to fetch stock data')

        return{
            symbol,
            currentPrice: data.c,
            change: data.d,
            changePercent: data.dp,
            high: data.h,
            low: data.l,
            open: data.o,
            previousClose: data.pc,
            timestamp: data.t,
            isRealTime: true
        }            
    } catch (error){
        console.log('Error fetching stock data: ', error)
        return null
    }
}