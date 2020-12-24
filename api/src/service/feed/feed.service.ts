import { HttpService, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AddFeedDTO } from 'src/dto/add-feed.dto';
import { AddSourceDTO } from 'src/dto/add-source.dto';
import { FeedModel } from 'src/model/feed.model';
import { WebsiteMetadataModel } from 'src/model/website-metadata.model';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class FeedService {
	constructor(
		@InjectModel('FeedModel') private readonly feedModel: Model<FeedModel>,
		private httpService: HttpService,
		private loggerService : LoggerService
	) { }

	/**
	 * Gets all feed
	 * @returns all feed 
	 */
	async getAllFeed(date): Promise<FeedModel[]> {
		var d = new Date(date);
		let query = { createdAt: { $lte: d } };
		let sort = { createdAt: 'desc' };
		return await this.feedModel
			.find(query)
			.sort(sort)
			.limit(12)
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
	async getPageTitle(websiteMetadataModel: WebsiteMetadataModel){
		if(websiteMetadataModel.hasOwnProperty('title')){
			return websiteMetadataModel.title;
		}
		else if(websiteMetadataModel.hasOwnProperty('ogTitle')){
			return websiteMetadataModel.ogTitle;
		}
	}

	/**
	 * Gets page description
	 * @param websiteMetadataModel 
	 * @returns  
	 */
	async getPageDescription(websiteMetadataModel: WebsiteMetadataModel){
		if(websiteMetadataModel.hasOwnProperty('description')){
			return websiteMetadataModel.description;
		}
		else if(websiteMetadataModel.hasOwnProperty('ogDescription')){
			return websiteMetadataModel.ogDescription;
		}
	}

	/**
	 * Gets page image
	 * @param websiteMetadataModel 
	 * @returns  
	 */
	async getPageImage(websiteMetadataModel: WebsiteMetadataModel){
		if(websiteMetadataModel.hasOwnProperty('ogImage')){
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
	async getPageTwitterHandle(websiteMetadataModel: WebsiteMetadataModel){
		if(websiteMetadataModel.hasOwnProperty('twitterSite')){
			return websiteMetadataModel.twitterSite;
		}
		if(websiteMetadataModel.hasOwnProperty('twitterCreator')){
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
	async getPageKeyWords(websiteMetadataModel: WebsiteMetadataModel){
		if(websiteMetadataModel.hasOwnProperty('Keywords')){
			return websiteMetadataModel.Keywords;
		}
		else {
			return ''
		}
	}
}
