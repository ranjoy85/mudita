import { HttpModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SentimentOverTimeController } from 'src/controller/sentiment-over-time/sentiment-over-time.controller';
import { SentimentOverTimeSchema } from 'src/schema/sentiment-over-time.schema';
import { SentimentOverTimeService } from 'src/service/sentiment-over-time/sentiment-over-time.service';
import { LoggerModule } from '../logger/logger.module';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: 'SentimentOverTimeModel', schema: SentimentOverTimeSchema }]),
		HttpModule,
		LoggerModule
	],
	controllers: [SentimentOverTimeController],
	providers: [SentimentOverTimeService],
	exports: [SentimentOverTimeService]
})
export class SentimentOverTimeModule { }
