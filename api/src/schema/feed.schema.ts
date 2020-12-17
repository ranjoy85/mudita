import * as mongoose from 'mongoose';

export const FeedSchema = new mongoose.Schema({
    endpoint : String,
    expirationTime : Number,
    keys : {
      p256dh : String,
      auth : String
    },
    createdAt: { type: Date, default: Date.now }
})