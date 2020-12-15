import { Document } from 'mongoose';

export interface AddFeedDTO{
    guid: string,
    title: string,
    link: string,
    pubDate: string,
    source: string,
    score: string,
    magnitude: string,
    createdAt? : Date
}