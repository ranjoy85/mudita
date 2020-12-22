import { Controller, Post, Res, Body, HttpStatus, Get, Param, UseFilters } from "@nestjs/common";
import { AddFeedDTO } from "src/dto/add-feed.dto";
import { AddSourceDTO } from "src/dto/add-source.dto";
import { FeedService } from "src/service/feed/feed.service";
import { LoggerService } from "src/service/logger/logger.service";
import { SourceService } from "src/service/source/source.service";
import { UserDeviceService } from "src/service/user-device/user-device.service";

@Controller('/api/feed')
export class FeedController {
    constructor(
        private feedService: FeedService,
        private sourceService: SourceService,
        private userDeviceService: UserDeviceService,
        private loggerService: LoggerService
    ) { }

    /**
     * Gets feed controller
     * @param res 
     * @returns  
    /**
     * Params feed controller
     * @param res 
     * @returns  
     */
    @Get('/hello')
    
    async pingFeed(@Res() res) {
        this.loggerService.log('Its up');
        return res.status(HttpStatus.OK).json({ status: 'ok', message:'Feed is up !!' });
    }

    /**
     * Posts feed controller
     * @param res 
     * @param addFeedDTO 
     * @returns  
     */
    @Post('/create')
    async addFeed(@Res() res, @Body() addFeedDTO: AddFeedDTO) {
        const feed = await this.feedService.addFeed(addFeedDTO);
        return res.status(HttpStatus.OK).json({
            message: "Feed has been created successfully",
            feed
        })
    }

    /**
     * Gets feed controller
     * @param date 
     * @param res 
     * @returns  
     */
    @Get('/feeds/:date')
    async getAllFeeds(@Param('date') date, @Res() res) {
        const feeds = await this.feedService.getAllFeed(date);
        return res.status(HttpStatus.OK).json(feeds);
    }

    /**
     * Gets feed controller
     * @param url 
     * @param res 
     * @returns  
     */
    @Get('/meta')
    async getMeta(@Res() res) {
        const url = '';
        var getFavicons = require('get-website-favicon')
        const favicons = getFavicons(url).then(data => {
            if(data.icons.length > 1){
                this.loggerService.log(data.icons[0].src);
            }
        })
        return res.status(HttpStatus.OK).json(favicons);
    }

    /**
     * Gets feed controller
     * @param res 
     * @returns  
     */
    @Get('/feedsFromSource')
    async getAllNewsFeedsFromSource(@Res() res) {

        const feeds = await (await this.feedService.getAllNewsFeedsFromSource()).subscribe(async response => {

            // parse Xml source
            const parseXml = await this.feedService.parseXml(response.data);

            // get feeds for the source
            const feeds = parseXml.rss.channel[0].item;

            // iterate through all the feeds
            feeds.forEach(async element => {
                
                //get lint
                const link = element.link[0];

                // get source
                const source = element.source[0]._;

                // check if source exist
                const getIfSourceExist = await this.sourceService.getIfSourceExist(source);

                // get metadata fro the source
                const meta = await this.feedService
                                        .extractMetaDataFromURl(link)
                                        .catch(_=> this.loggerService.log(`META - ${link} -  could not be extracted`));
                
                // if meta data exist on the feed
                if(meta && meta.og){
                    
                    // get sentiment of the content 
                    const content = `${meta.og.title} ${meta.og.description}`;
                    const sentiment = await this.feedService.getNlpScore(content).catch();

                    // build feed object
                    const addFeedDTO: AddFeedDTO = {
                        guid: element.guid[0]._,
                        title: meta.og.title,
                        description: meta.og.description,
                        imageUrl: meta.og.images[0].url,
                        link: element.link[0],
                        pubDate: element.pubDate[0],
                        source: source,
                        score: `${sentiment.score}`,
                        magnitude: `${sentiment.magnitude}`,
                    };

                    // add feed to db
                    await this.feedService
                        .addFeed(addFeedDTO)
                        .then(_=> this.loggerService.log(`GUID - ${addFeedDTO.guid} -  added`))
                        .catch(_=> this.loggerService.log(`GUID - ${addFeedDTO.guid} -  already exist`));

                    
                    // check is feed source is already exist in source model
                    if(getIfSourceExist){
                        this.loggerService.log(`Source - ${addFeedDTO.source} - already exist`)
                    }
                    else{

                        // get metadata fro the source
                        const sourceIcon = await this.sourceService
                                                .extractFaviconsFromURl(addFeedDTO.link)
                                                .catch(_=> this.loggerService.log(`Icon - ${addFeedDTO.source} -  could not be extracted`));
                        
                        // if icon exist
                        if(sourceIcon){
                            // build source model
                            const addSourceDTO: AddSourceDTO = {
                                source : addFeedDTO.source,
                                icon: sourceIcon
                            }

                            // add source to db
                            await this.sourceService
                                .addSource(addSourceDTO)
                                .then(_=> this.loggerService.log(`Source - ${addFeedDTO.source} -  added`))
                                .catch(_=> this.loggerService.log(`Source - ${addFeedDTO.source} -  already exist`));
                        }
                    }

                    // check if score is more than 0.1, its a non negative feed, send push

                    const sentimentThreshold = 0.1;
                    if (sentiment.score >= sentimentThreshold) {

                        //send push notification
                        await this.userDeviceService
                            .sendPushToAllDevices(addFeedDTO)
                            .catch();
                    }
                }
            });  
        })

        // return ok
        return res.status(HttpStatus.OK).json({ status: 'ok', message:'Feeds from sources received successfully' });
    }
}
