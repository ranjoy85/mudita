import { Document } from 'mongoose';

export interface SourceModel extends Document{
    source: string,
    icon?: string,
    createdAt? : Date
}