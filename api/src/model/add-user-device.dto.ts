import { Document } from 'mongoose';

export interface UserDeviceModel extends Document{
    userDeviceType : string;
    userDeviceId : string;
    userDeviceStatus : string;
    createdAt : Date;
}