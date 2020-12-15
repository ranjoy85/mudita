import * as mongoose from 'mongoose';

export const FeedSchema = new mongoose.Schema({
    guid: String,
    title: String,
    link: String,
    pubDate: String,
    source: String,
    score: String,
    magnitude: String,
    createdAt: { type: Date, default: Date.now }
})