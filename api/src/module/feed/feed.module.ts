import { HttpModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FeedController } from 'src/controller/feed/feed.controller';
import { FeedSchema } from 'src/schema/feed.schema';
import { FeedService } from 'src/service/feed/feed.service';
import { UserDeviceService } from 'src/service/user-device/user-device.service';
import { UserDeviceModule } from '../user-device/user-device.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'FeedModel', schema: FeedSchema }]),
        HttpModule,
        UserDeviceModule
      ],
      controllers: [FeedController],
      providers: [FeedService]
})
export class FeedModule {}
