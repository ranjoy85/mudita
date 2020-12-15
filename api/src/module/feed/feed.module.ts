import { HttpModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FeedController } from 'src/controller/feed/feed.controller';
import { FeedSchema } from 'src/schema/feed.schema';
import { FeedService } from 'src/service/feed/feed.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'FeedModel', schema: FeedSchema }]),
        HttpModule
      ],
      controllers: [FeedController],
      providers: [FeedService]
})
export class FeedModule {}
