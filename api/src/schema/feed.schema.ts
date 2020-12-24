import * as mongoose from 'mongoose';

export const FeedSchema = new mongoose.Schema({
    guid: String,
    title: String,
    description: String,
    imageUrl: String,
    link: String,
    twitterHandle: String,
    Keywords: String,
    pubDate: String,
    source: String,
    score: String,
    magnitude: String,
    createdAt : { type: Date, default: Date.now }
})