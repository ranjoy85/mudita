export interface AddSentimentOverTimeDTO {
    date?: string,
    sentimentOverTime?: {
        time: string,
        score: string,
    }[]
}