import { Document } from 'mongoose';

export interface FeedModel extends Document{
    endpoint ?: string,
    expirationTime ?: number | null,
    keys ?: {
      p256dh ?: string,
      auth ?: string
    },
    createdAt : Date
}