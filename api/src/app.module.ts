import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { FeedModule } from './module/feed/feed.module';

@Module({
  imports: [
    ConfigModule.forRoot(),

    //dev
    //MongooseModule.forRoot(process.env.MONGODB_URL, { useNewUrlParser: true }),
    
    //prod
    MongooseModule.forRoot('mongodb+srv://mudita:mudita@cluster-0.28abr.mongodb.net/mudita?retryWrites=true&w=majority', { useNewUrlParser: true }),
    FeedModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}