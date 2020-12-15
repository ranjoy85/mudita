import { HttpService, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AddFeedDTO } from 'src/dto/add-feed.dto';
import { FeedModel } from 'src/model/feed.model';

@Injectable()
export class FeedService {
	constructor(
		@InjectModel('FeedModel') private readonly feedModel: Model<FeedModel>,
		private httpService: HttpService
	) { }

	/**
	 * Gets all feed
	 * @returns all feed 
	 */
	async getAllFeed(date): Promise<FeedModel[]> {
		var d = new Date();
		let query = { createdAt: { $lte: d } };
		let sort = { createdAt: 'desc' };
		return await this.feedModel
			.find(query)
			.sort(sort)
			.limit(20)
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

		const feedExist = await this.feedModel.exists({ guid: guid });
		return feedExist;
	}

	/**
	 * Adds feed
	 * @param addFeedDTO 
	 * @returns feed 
	 */
	async addFeed(addFeedDTO: AddFeedDTO): Promise<FeedModel> {
		const newFeed = await new this.feedModel(addFeedDTO);
		return newFeed.save();
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
		return await this.httpService.get('https://news.google.com/rss/search?q=apple&hl=en-IN&gl=IN&ceid=IN:en');
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
}
