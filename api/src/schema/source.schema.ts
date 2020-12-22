import * as mongoose from 'mongoose';

export const SourceSchema = new mongoose.Schema({
    source: String,
    icon: String,
    createdAt : { type: Date, default: Date.now }
})