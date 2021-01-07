import { Document } from 'mongoose';

export interface SentimentOverTimeModel extends Document{
    date: string,
    sentimentOverTime?: {
        time: string,
        score: string,
    }[]
}