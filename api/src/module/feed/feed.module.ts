import { HttpModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FeedController } from 'src/controller/feed/feed.controller';
import { FeedSchema } from 'src/schema/feed.schema';
import { FeedService } from 'src/service/feed/feed.service';
import { LoggerModule } from '../logger/logger.module';
import { SourceModule } from '../source/source.module';
import { UserDeviceModule } from '../user-device/user-device.module';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: 'FeedModel', schema: FeedSchema }]),
		HttpModule,
		UserDeviceModule,
		SourceModule,
		LoggerModule
	],
	controllers: [FeedController],
	providers: [FeedService],
})
export class FeedModule { }
