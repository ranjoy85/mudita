import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AddSentimentOverTimeDTO } from 'src/dto/add-sentiment-over-time.dto';
import { SentimentOverTimeModel } from 'src/model/sentiment-over-time.model';
import * as moment from 'moment';
import { readdirSync } from 'fs';
import { AddFeedDTO } from 'src/dto/add-feed.dto';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class SentimentOverTimeService {
	/**
	 * Creates an instance of sentiment over time service.
	 * @param sentimentOverTimeModel 
	 * @param httpService 
	 * @param loggerService 
	 */
	constructor(
		@InjectModel('SentimentOverTimeModel') private readonly sentimentOverTimeModel: Model<SentimentOverTimeModel>,
		private loggerService: LoggerService
	) { }

	/**
	 * Adds sentiment over time
	 * @param addSentimentOverTimeDTO 
	 * @returns sentiment over time 
	 */
	async addSentimentOverTime(addSentimentOverTimeDTO: AddSentimentOverTimeDTO): Promise<SentimentOverTimeModel> {
		const newEntity = await new this.sentimentOverTimeModel(addSentimentOverTimeDTO);
		return newEntity.save();
	}

	/**
	 * Updates feed
	 * @param addSentimentOverTimeDTO 
	 * @returns feed 
	 */
	async updateSentimentOverTime(addSentimentOverTimeDTO: AddSentimentOverTimeDTO): Promise<SentimentOverTimeModel> {

		return await this.sentimentOverTimeModel.updateOne({
			date: addSentimentOverTimeDTO.date
		}, { sentimentOverTime: addSentimentOverTimeDTO.sentimentOverTime }, { upsert: true });
	}

	/**
	 * Gets feed
	 * @param guid 
	 * @returns feed 
	 */
	async getSentimentOverTime(feedDate): Promise<SentimentOverTimeModel> {
		const entity = await this.sentimentOverTimeModel.findOne({ date: feedDate }).exec();
		return entity;
	}

	/**
	 * Gets if sentiment over time exist
	 * @param date 
	 * @returns if sentiment over time exist 
	 */
	async getIfSentimentOverTimeExist(date): Promise<boolean> {

		const entityExist = await this.sentimentOverTimeModel.exists({ date: date });
		console.log(`${date} ${entityExist}`);
		return entityExist;
	}

	/**
	 * Uniques feed dates
	 * @param feeds 
	 * @returns  
	 */
	async uniqueFeedDates(feeds){

		let uniqueFeedDates = new Set();
		for await (const feed of feeds) {
			const dateInPubDate = moment(feed.pubDate).format("YYYY-MM-DD");
			const timeInPubDate = moment(feed.pubDate).format("hh:mm a");
			if(dateInPubDate !== 'Invalid date'){
				uniqueFeedDates.add(dateInPubDate);
			}
		}
		
		return [...uniqueFeedDates];
	}

	/**
	 * Sentiments for date from job
	 * @param feeds 
	 * @returns  
	 */
	async sentimentForDateFromJob(feeds){
		const feedDates = await this.uniqueFeedDates(feeds);

		console.log(feedDates);

		const buildSentimentOverTime  = await this.buildSentimentOverTime(feeds, feedDates);

		const storeSentimentOverTime = await this.storeSentimentOverTime(buildSentimentOverTime);

		return storeSentimentOverTime;
	}
	/**
	 * Builds sentiment over time
	 * @param allFeed 
	 * @param filterFeed 
	 * @returns  
	 */
	async buildSentimentOverTime(allFeed, filterFeed) {
		let sentimentOverTimeModel: AddSentimentOverTimeDTO[] = [];
		for await (const eachFromFilterFeed of filterFeed) {
			let eachSentimentOverTime: AddSentimentOverTimeDTO = {};
			eachSentimentOverTime.date = eachFromFilterFeed;
			eachSentimentOverTime.sentimentOverTime = [];
			for await (const eachFromAllFeed of allFeed) {
				const dateInPubDate = moment(eachFromAllFeed.pubDate).format("YYYY-MM-DD");
				const timeInPubDate = moment(eachFromAllFeed.pubDate).format("hh:mm a");
				const score = eachFromAllFeed.score;

				if (dateInPubDate === eachFromFilterFeed) {

					const sentiment = {
						time: timeInPubDate,
						score: score,
					};
					eachSentimentOverTime.sentimentOverTime.push(sentiment);
				}
			}
			
			sentimentOverTimeModel.push(eachSentimentOverTime);
		}
		
		return sentimentOverTimeModel;
	}

	/**
	 * Builds each sentiment over time
	 * @param allFeed 
	 * @param filterFeed 
	 * @returns  
	 */
	async buildEachSentimentOverTime(eachFeed) {
		let eachSentimentOverTime: AddSentimentOverTimeDTO = {};
			
		const dateInPubDate = moment(eachFeed.pubDate).format("YYYY-MM-DD");
		const timeInPubDate = moment(eachFeed.pubDate).format("hh:mm a");
		eachSentimentOverTime.date = dateInPubDate;
		eachSentimentOverTime.sentimentOverTime = [];
		const score = eachFeed.score;
		
		const sentiment = {
			time: timeInPubDate,
			score: score,
		};

		eachSentimentOverTime.sentimentOverTime.push(sentiment);
		
		return eachSentimentOverTime;
	}

	/**
	 * Stores sentiment over time
	 * @param filteredSentimentOverTime 
	 */
	async storeSentimentOverTime(filteredSentimentOverTime) {
		for await (const eachSentimentOverTime of filteredSentimentOverTime) {
			await this.storeEachSentimentOverTime(eachSentimentOverTime);
		}
	}

	/**
	 * Stores each sentiment over time
	 * @param eachSentimentOverTime 
	 */
	async storeEachSentimentOverTime(eachSentimentOverTime) {
		console.log(`Saving sentiment ${eachSentimentOverTime.date}`);
		const ifSentimentOverTimeExist = await this.getIfSentimentOverTimeExist(eachSentimentOverTime.date);

		console.log(`${eachSentimentOverTime.date} ${ifSentimentOverTimeExist}`);

		if (ifSentimentOverTimeExist) {
			const getSentimentOverTime = await this.getSentimentOverTime(eachSentimentOverTime.date);

			let existingSentimentOverTime = [];

			if (getSentimentOverTime.sentimentOverTime) {
				for await (const element of getSentimentOverTime.sentimentOverTime) {
					existingSentimentOverTime.push(element);
				}
			}

			for await (const element of eachSentimentOverTime.sentimentOverTime) {
				existingSentimentOverTime.push(element);
			}
			
			getSentimentOverTime.sentimentOverTime = [...existingSentimentOverTime];

			console.log(`getSentimentOverTime ${getSentimentOverTime}`);
			await this.updateSentimentOverTime(getSentimentOverTime);
		}
		else {
			await this.addSentimentOverTime(eachSentimentOverTime);
		}
	}

	/**
	 * Stores sentiment if not exist
	 * @param addFeedDTO 
	 */
	async storeSentimentIfNotExist(addFeedDTO: AddFeedDTO) {
		const buildEachSentimentOverTime = await this.buildEachSentimentOverTime(addFeedDTO);

		const ifSentimentOverTimeExist = await this.getIfSentimentOverTimeExist(buildEachSentimentOverTime.date);

		console.log(`${buildEachSentimentOverTime.date} ${ifSentimentOverTimeExist}`);

		if (ifSentimentOverTimeExist) {
			const getSentimentOverTime = await this.getSentimentOverTime(buildEachSentimentOverTime.date);

			getSentimentOverTime.sentimentOverTime = await this.joinSentimentWithExistingForDate(getSentimentOverTime, buildEachSentimentOverTime);

			await this.updateSentimentOverTime(getSentimentOverTime)
				.then(_ => this.loggerService.log(`Sentiment for - ${getSentimentOverTime} -  updated`))
				.catch(_ => this.loggerService.log(`Sentiment for - ${getSentimentOverTime} - error out`));
		}
		else {
			await this.addSentimentOverTime(buildEachSentimentOverTime)
				.then(_ => this.loggerService.log(`Sentiment for - ${buildEachSentimentOverTime} -  added`))
				.catch(_ => this.loggerService.log(`Sentiment for - ${buildEachSentimentOverTime} - error out`));

		}
	}

	/**
	 * Joins sentiment with existing for date
	 * @param getSentimentOverTime 
	 * @param buildEachSentimentOverTime 
	 * @returns  
	 */
	private async joinSentimentWithExistingForDate(getSentimentOverTime: SentimentOverTimeModel, buildEachSentimentOverTime: AddSentimentOverTimeDTO) {
		let existingSentimentOverTime = [];

		if (getSentimentOverTime.sentimentOverTime) {

			for await (const element of getSentimentOverTime.sentimentOverTime) {
				existingSentimentOverTime.push(element);
			}
		}

		for await (const element of buildEachSentimentOverTime.sentimentOverTime) {
			existingSentimentOverTime.push(element);
		}
		

		console.log(JSON.stringify(existingSentimentOverTime));
		return [...existingSentimentOverTime];
	}

	/**
	 * Sorts time
	 * @param times 
	 */
	async sortTime(times:{time: string;score: string;}[]) {
		times.sort(function (a, b) {
			return Date.parse('01/01/1970 ' + a.time) - Date.parse('01/01/1970 ' + b.time)
		});
	}

	/**
	 * Finds most dominant sentiment
	 * @param a 
	 * @returns  
	 */
	async findMostDominantSentiment(scoreSeries) {

		scoreSeries.sort((x, y) => x - y);

		var bestStreak = 1;
		var bestElem = scoreSeries[0];
		var currentStreak = 1;
		var currentElem = scoreSeries[0];

		for (let i = 1; i < scoreSeries.length; i++) {
			if (scoreSeries[i - 1] !== scoreSeries[i]) {
				if (currentStreak > bestStreak) {
					bestStreak = currentStreak;
					bestElem = currentElem;
				}

				currentStreak = 0;
				currentElem = scoreSeries[i];
			}

			currentStreak++;
		}

		return currentStreak > bestStreak ? currentElem : bestElem;
	};

	/**
	 * Finds time gap best sentiment
	 * @param times 
	 * @returns  
	 */
	async findTimeGapBestSentiment(times: { time: string; score: string; }[]) {
        let timeSeries = [];
        let scoreSeries = [];

        let timeStopGap = [
            {
                "start": "12:00 am",
                "end": "2:00 am",
            },
            {
                "start": "2:01 am",
                "end": "4:00 am",
            },
            {
                "start": "4:10 am",
                "end": "6:00 am",
            },
            {
                "start": "6:01 am",
                "end": "8:00 am",
            },
            {
                "start": "8:01 am",
                "end": "10:00 am",
            },
            {
                "start": "10:01 am",
                "end": "12:00 pm",
            },
            {
                "start": "12:01 pm",
                "end": "2:00 pm",
            },
            {
                "start": "2:01 pm",
                "end": "4:00 pm",
            },
            {
                "start": "4:10 pm",
                "end": "6:00 pm",
            },
            {
                "start": "6:01 pm",
                "end": "8:00 pm",
            },
            {
                "start": "8:01 pm",
                "end": "10:00 pm",
            },
            {
                "start": "10:01 pm",
                "end": "11:59 pm",
            },
        ];

		for await (const timeStop of timeStopGap) {
			let startMoment = moment(timeStop.start, 'HH:mm a');
            let endMoment = moment(timeStop.end, 'HH:mm a');
            timeSeries.push(timeStop.end);

			let timeGapScore = [];
			for await (const eachTime of times) {
				let thisMoment = moment(eachTime.time, 'HH:mm a');
                if (thisMoment >= startMoment && thisMoment < endMoment) {

                    timeGapScore.push(eachTime.score);
                }
			}
            
			if(timeGapScore != null){
				scoreSeries.push(await this.findMostDominantSentiment(timeGapScore));
			}
			else{
				scoreSeries.push(0);
			}
		}
        return { timeSeries, scoreSeries };
    }
}
/**
 * Formats sentiment score
 * @param eachTime 
 * @returns sentiment score 
 */
function formatSentimentScore(score : string) {

	const providedScore = Number(score)
	if( providedScore >= -1.0 &&  providedScore < -0.49 )
	{
		return -1.0;
	}
	else if( providedScore >= -0.5 &&  providedScore < -0.99 )
	{
		return -0.5;
	}
	else if( providedScore >= 0.0 &&  providedScore < 0.49 )
	{
		return 0.0;
	}
	else if( providedScore >= 0.5 &&  providedScore < 0.99 )
	{
		return 0.5;
	}
	else if( providedScore >= 1.0)
	{
		return 1.0;
	}
	else
	{
		return 0.0;
	}
}

