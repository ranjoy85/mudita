import * as mongoose from 'mongoose';

export const UserDeviceSchema = new mongoose.Schema({
    userDeviceType : String,
    userDeviceId : String,
    userDeviceStatus : String,
    createdAt: { type: Date, default: Date.now }
})