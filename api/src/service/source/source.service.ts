import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AddFeedDTO } from "src/dto/add-feed.dto";
import { AddSourceDTO } from "src/dto/add-source.dto";
import { SourceModel } from "src/model/source.model";
import { LoggerService } from "../logger/logger.service";


@Injectable()
export class SourceService {
	constructor(
		@InjectModel('SourceModel') private readonly sourceModel: Model<SourceModel>,
		private loggerService: LoggerService
	) { }

	/**
	 * Adds source
	 * @param addSourceDTO 
	 * @returns source 
	 */
	async addSource(addSourceDTO: AddSourceDTO): Promise<SourceModel> {
		const newEntity = await new this.sourceModel(addSourceDTO);
		return newEntity.save();
	}

	/**
     * Gets if source exist
     * @param source 
     * @returns if source exist 
     */
    async getIfSourceExist(source:string){

		const entityExist = await this.sourceModel.exists({ source: source });
		return entityExist;
	}

	/**
	 * Extracts favicons from url
	 * @param sourceUrl 
	 * @returns  
	 */
	async extractFaviconsFromURl(sourceUrl) {
		let favicons = 'default';
		const getWebsiteFavicon = require('get-website-favicon')
		await getWebsiteFavicon(sourceUrl).then(data=>{
			if(data.icons[0]){
				favicons = data.icons[0].src;
			}
		})
		return favicons;
	};

	/**
	 * Saves feed source
	 * @param addFeedDTO 
	 */
	async saveFeedSource(addFeedDTO: AddFeedDTO) {
        const sourceIcon = await this.extractFaviconsFromURl(addFeedDTO.link)
            .catch(_ => this.loggerService.log(`Icon - ${addFeedDTO.source} -  could not be extracted`));

        // if icon exist
        if (sourceIcon) {
            // build source model
            const addSourceDTO: AddSourceDTO = {
                source: addFeedDTO.source,
                icon: sourceIcon
            };

            // add source to db
            await this.addSource(addSourceDTO)
                .then(_ => this.loggerService.log(`Source - ${addFeedDTO.source} -  added`))
                .catch(_ => this.loggerService.log(`Source - ${addFeedDTO.source} -  already exist`));
        }
    }
}
