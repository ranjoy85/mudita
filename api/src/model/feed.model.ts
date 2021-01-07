import { Document } from 'mongoose';

export interface FeedModel extends Document{
    guid: string,
    title: string,
    description: string,
    imageUrl: string,
    link: string,
    pubDate: Date,
    source: string,
    score: string,
    magnitude: string,
    createdAt : Date
}