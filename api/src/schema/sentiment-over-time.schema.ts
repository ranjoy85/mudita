import * as mongoose from 'mongoose';

export const SentimentOverTimeSchema = new mongoose.Schema({
    date: String,
    sentimentOverTime: [{
        time: String,
        score: String
    }]
})