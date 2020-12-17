import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FeedModule } from './module/feed/feed.module';
import { UserDeviceModule } from './module/user-device/user-device.module';
import { UserDeviceService } from './service/user-device/user-device.service';

@Module({
  imports: [
    //dev
    //MongooseModule.forRoot('mongodb+srv://mudita-dev:mudita-dev@cluster0.ra4mq.mongodb.net/mudita-dev?retryWrites=true&w=majority', { useNewUrlParser: true }),
    
    //prod
    MongooseModule.forRoot('mongodb+srv://mudita:mudita@cluster-0.28abr.mongodb.net/mudita?retryWrites=true&w=majority', { useNewUrlParser: true }),
    FeedModule,
    //UserDeviceModule,
    //UserDeviceService
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}