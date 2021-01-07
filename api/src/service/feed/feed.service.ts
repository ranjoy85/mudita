import { HttpService, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AnyMxRecord } from 'dns';
import { json } from 'express';
import * as moment from 'moment';
import { Model } from 'mongoose';
import { env } from 'process';
import { AddFeedDTO } from 'src/dto/add-feed.dto';
import { AddSentimentOverTimeDTO } from 'src/dto/add-sentiment-over-time.dto';
import { AddSourceDTO } from 'src/dto/add-source.dto';
import { FeedModel } from 'src/model/feed.model';
import { SentimentOverTimeModel } from 'src/model/sentiment-over-time.model';
import { WebsiteMetadataModel } from 'src/model/website-metadata.model';
import { LoggerService } from '../logger/logger.service';
import { SentimentOverTimeService } from '../sentiment-over-time/sentiment-over-time.service';
import { SourceService } from '../source/source.service';

@Injectable()
export class FeedService {
	constructor(
		@InjectModel('FeedModel') private readonly feedModel: Model<FeedModel>,
		private httpService: HttpService,
		private sourceService: SourceService,
		private sentimentOverTimeService: SentimentOverTimeService,
		private loggerService: LoggerService
	) { }

	/**
	 * Gets all feeds by date
	 * @param date 
	 * @returns all feeds by date 
	 */
	async getAllFeedsByDate(date): Promise<FeedModel[]> {
		var d = new Date(date);
		let query = { createdAt: { $lte: d } };
		let sort = { createdAt: 'desc' };
		return await this.feedModel
			.find(query)
			.sort(sort)
			.limit(20)
			.exec();
	}

	/**
	 * Gets all feed
	 * @returns all feed 
	 */
	async getAllFeed(): Promise<FeedModel[]> {
		return await this.feedModel
			.find()
			.exec();
	}

	/**
	 * Gets feed
	 * @param guid 
	 * @returns feed 
	 */
	async getFeed(guid): Promise<FeedModel> {
		const feed = await this.feedModel.findById(guid).exec();
		return feed;
	}

	/**
	 * Gets if feed exist
	 * @param guid 
	 * @returns if feed exist 
	 */
	async getIfFeedExist(guid): Promise<boolean> {

		const entityExist = await this.feedModel.exists({ guid: guid });
		return entityExist;
	}

	/**
	 * Adds feed
	 * @param addFeedDTO 
	 * @returns feed 
	 */
	async addFeed(addFeedDTO: AddFeedDTO): Promise<FeedModel> {
		const newEntity = await new this.feedModel(addFeedDTO);
		return newEntity.save();
	}

	/**
	 * Updates feed
	 * @param addFeedDTO 
	 * @returns feed 
	 */
	async updateFeed(addFeedDTO: AddFeedDTO): Promise<FeedModel> {

		return await this.feedModel.updateOne({
			guid: addFeedDTO.guid
		}, { pubDate: addFeedDTO.pubDate }, { upsert: true });
	}

	/**
	 * Gets nlp score
	 * @param text 
	 * @returns  
	 */
	async getNlpScore(text) {

		// Imports the Google Cloud client library
		const language = require('@google-cloud/language');

		// Instantiates a client
		const client = new language.LanguageServiceClient();


		const document = {
			content: text,
			type: 'PLAIN_TEXT',
		};

		// Detects the sentiment of the text

		const [result] = await client.analyzeSentiment({ document: document });
		const sentiment = result.documentSentiment;

		return sentiment;
	}

	/**
	 * Parses xml
	 * @param response 
	 * @returns  
	 */
	async parseXml(xml) {
		let resultString: any;
		var parseString = require('xml2js').parseString;
		parseString(xml, async function (err, result) {
			resultString = result;
		});
		return resultString;
	}

	/**
	 * Gets all news feeds from source
	 * @returns  
	 */
	async getAllNewsFeedsFromSource() {
		return await this.httpService.get(process.env.FEED_SOURCE);
	}

	/**
	 * Filters title
	 * @param title 
	 * @returns  
	 */
	async filterTitle(title: string) {
		var filterTitle = title;
		return await filterTitle.substring(0, title.indexOf('-'));
	}

	/**
	 * Extracts meta data from url
	 * @param sourceUrl 
	 */
	async extractMetaDataFromURl(sourceUrl) {
		const extract = require('meta-extractor');
		return await extract({ uri: sourceUrl })
	};

	/**
	 * Gets page title
	 * @param websiteMetadataModel 
	 * @returns  
	 */
	async getPageTitle(websiteMetadataModel: WebsiteMetadataModel) {
		if (websiteMetadataModel.hasOwnProperty('title')) {
			return websiteMetadataModel.title;
		}
		else if (websiteMetadataModel.hasOwnProperty('ogTitle')) {
			return websiteMetadataModel.ogTitle;
		}
	}

	/**
	 * Gets page description
	 * @param websiteMetadataModel 
	 * @returns  
	 */
	async getPageDescription(websiteMetadataModel: WebsiteMetadataModel) {
		if (websiteMetadataModel.hasOwnProperty('description')) {
			return websiteMetadataModel.description;
		}
		else if (websiteMetadataModel.hasOwnProperty('ogDescription')) {
			return websiteMetadataModel.ogDescription;
		}
	}

	/**
	 * Gets page image
	 * @param websiteMetadataModel 
	 * @returns  
	 */
	async getPageImage(websiteMetadataModel: WebsiteMetadataModel) {
		if (websiteMetadataModel.hasOwnProperty('ogImage')) {
			return websiteMetadataModel.ogImage;
		}
		else {
			return 'default'
		}
	}

	/**
	 * Gets page twitter handle
	 * @param websiteMetadataModel 
	 * @returns  
	 */
	async getPageTwitterHandle(websiteMetadataModel: WebsiteMetadataModel) {
		if (websiteMetadataModel.hasOwnProperty('twitterSite')) {
			return websiteMetadataModel.twitterSite;
		}
		if (websiteMetadataModel.hasOwnProperty('twitterCreator')) {
			return websiteMetadataModel.twitterCreator;
		}
		else {
			return 'none'
		}
	}

	/**
	 * Gets page key words
	 * @param websiteMetadataModel 
	 * @returns  
	 */
	async getPageKeyWords(websiteMetadataModel: WebsiteMetadataModel) {
		if (websiteMetadataModel.hasOwnProperty('Keywords')) {
			return websiteMetadataModel.Keywords;
		}
		else {
			return ''
		}
	}

	/**
	 * Saves feeds, sources, sentiment, and send push
	 */
	async processFeeds() {

		let savedFeeds = [];

		const feeds = await (await this.getAllNewsFeedsFromSource()).subscribe(async response => {

			// parse Xml source
			const parseXml = await this.parseXml(response.data);

			// get feeds for the source
			const feeds = parseXml.rss.channel[0].item;

			for await (const element of feeds) {
				
				// save each feed
				await this.saveEachFeed(element)
			}

		});
	}

	/**
	 * Saves each feed
	 * @param element 
	 * @returns  
	 */
	private async saveEachFeed(element: any) {

		let addFeedDTO: AddFeedDTO;

		const guid = element.guid[0]._;

		//get lint
		const link = element.link[0];

		// get source
		const source = element.source[0]._;

		// get page published
		const pubDate = new Date(element.pubDate[0]);

		// check if feed exist
		const getIfFeedExist = await this.getIfFeedExist(guid);

		// if feed does not exist
		if (!getIfFeedExist) {

			// get metadata fro the source
			const websiteMetadataModel: WebsiteMetadataModel = await this.extractMetaDataFromURl(link)
				.catch(_ => this.loggerService.log(`META - ${link} -  could not be extracted`));

			// if meta data exist on the feed
			if (websiteMetadataModel) {

				// get page title
				const title = await this.getPageTitle(websiteMetadataModel);

				// get page description
				const description = await this.getPageDescription(websiteMetadataModel);

				//get page image
				const imageUrl = await this.getPageImage(websiteMetadataModel);

				// get sentiment of the content 
				const content = `${title} ${description}`;
				
				const sentiment = await this.getNlpScore(content).catch();

				//get page keywords
				const keywords = await this.getPageKeyWords(websiteMetadataModel);

				//get page twitter Handle
				const twitterHandle = await this.getPageTwitterHandle(websiteMetadataModel);

				// build feed object
				addFeedDTO = {
					guid: guid,
					title: title,
					description: description,
					imageUrl: imageUrl,
					link: link,
					pubDate: pubDate,
					twitterHandle: twitterHandle,
					Keywords: keywords,
					source: source,
					score: `${sentiment.score}`,
                    magnitude: `${sentiment.magnitude}`,
				};

				// add feed to db
				await this.addFeed(addFeedDTO)
					.then(_ => this.loggerService.log(`GUID - ${addFeedDTO.guid} -  added`))
					.catch(_ => this.loggerService.log(`GUID - ${addFeedDTO.guid} -  already exist`));
				
				// check is feed source is already exist in source model
				const saveSourceIfNotExist = await this.sourceService.saveSourceIfNotExist(source, addFeedDTO);

				// store sentiment for date 
				const storeSentimentIfNotExist = this.sentimentOverTimeService.storeSentimentIfNotExist(addFeedDTO);

				// send push notifications
				//await this.userDeviceService.sendPushNotifications(sentiment, addFeedDTO);

				console.log(`\n`);
				console.log(`\n`);
				console.log(`\n`);
				console.log(`\n`);
				console.log(`\n`);
				console.log(`\n`);
				console.log(`\n`);
				console.log(`\n`);
				console.log(`\n`);
				console.log(`\n`);
			}
		}
		else {
			this.loggerService.log(`GUID - ${guid} - already exist`);
		}

		console.log(addFeedDTO);

		return addFeedDTO;
	}

	

	

	
}
