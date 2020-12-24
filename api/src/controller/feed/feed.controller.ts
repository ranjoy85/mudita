import { Controller, Post, Res, Body, HttpStatus, Get, Param } from "@nestjs/common";
import { AddFeedDTO } from "src/dto/add-feed.dto";
import { WebsiteMetadataModel } from "src/model/website-metadata.model";
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
        return res.status(HttpStatus.OK).json({ status: 'ok', message: 'Feed is up !!' });
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
    @Post('/favicons')
    async getFavicon(@Res() res,  @Body() addFeedDTO: AddFeedDTO) {
        const url = addFeedDTO.link;;
        var getFavicons = await this.sourceService.extractFaviconsFromURl(url);
       return res.status(HttpStatus.OK).json(getFavicons);
    }

    /**
     * Posts feed controller
     * @param res 
     * @param addFeedDTO 
     * @returns  
     */
    @Post('/meta')
    async getMeta(@Res() res, @Body() addFeedDTO: AddFeedDTO) {
        const link = addFeedDTO.link;
        const meta = await this.feedService.extractMetaDataFromURl(link);
        return res.status(HttpStatus.OK).json(meta);
    }

    /**
     * Posts feed controller
     * @param res 
     * @param addFeedDTO 
     * @returns  
     */
    @Post('/nlp')
    async getNlp(@Res() res, @Body() content: {content: string}) {
        const sentiment = await this.feedService.getNlpScore(content.content).catch();
        return res.status(HttpStatus.OK).json(sentiment);
    }

    /**
     * Gets feed controller
     * @param res 
     * @returns  
     */
    @Get('/feedsFromTestSource')
    async getAllNewsFeedsTestFromSource(@Res() res) {

        const feeds = await (await this.feedService.getAllNewsFeedsFromSource()).subscribe(async response => {

            // parse Xml source
            const parseXml = await this.feedService.parseXml(response.data);

            // get feeds for the source
            const feeds = parseXml.rss.channel[0].item;

            console.log(feeds.length);

            // iterate through all the feeds
            feeds.forEach(async element => {

                //get lint
                const link = element.link[0];

                // get source
                const source = element.source[0]._;

                console.log(`------Meta for link--------${link} `);

                // check if source exist
                //const getIfSourceExist = await this.sourceService.getIfSourceExist(source);

                // get metadata fro the source
                //const extract = require('meta-extractor');
                // const meta = await extract({ uri: link })
                //     .catch(_ => this.loggerService.log(`META - ${link} -  could not be extracted`));
                console.log(`score : siteContent`);

                // if (getIfSourceExist) {
                //     // if(meta.title){
                //     //     console.log('title : '+meta.title)
                //     // }
                //     // if(meta.ogTitle){
                //     //     console.log('ogTitle : '+meta.ogTitle)
                //     // }
                //     // if(meta.ogDescription){
                //     //     console.log('ogDescription : '+meta.ogDescription)
                //     // }
                //     // if(meta.description){
                //     //     console.log('description : '+meta.description)
                //     // }
                //     // if(meta.ogImage){
                //     //     console.log('ogImage : '+meta.ogImage)
                //     // }
                //     // if(meta.twitterSite){
                //     //     console.log('twitterSite : '+meta.twitterSite)
                //     // }
                //     // if(meta.twitterCreator){
                //     //     console.log('twitterCreator : '+meta.twitterCreator)
                //     // }
                //     if (meta.keywords) {
                //         console.log('keywords : ' + meta.keywords)
                //     }
                // }
                // else {
                //     console.log(`------Meta could not be extracted`);
                // }

                // // console.log('ogTitle : '+meta.ogTitle)
                // // console.log('ogDescription : '+meta.ogDescription)
                // // console.log('description : '+meta.description)
                // // console.log('ogImage : '+meta.ogImage)
                // // console.log('twitterSite : '+meta.twitterSite)
                // // console.log('twitterCreator : '+meta.twitterCreator)
                // // console.log('keywords : '+meta.keywords)

                // console.log(`------Meta over--------`);
                console.log(`\n\n`);
            });
        })

        // return ok
        return res.status(HttpStatus.OK).json({ status: 'ok', message: 'Feeds from sources received successfully' });
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

                // get guid
                const guid = element.guid[0]._

                //get lint
                const link = element.link[0];

                // get source
                const source = element.source[0]._;

                // get page published
                const pubDate = element.pubDate[0];

                // check if feed exist
                const getIfFeedExist = await this.feedService.getIfFeedExist(guid);

                // if feed does not exist
                if (!getIfFeedExist) {
                    
                    // check if source exist
                    const getIfSourceExist = await this.sourceService.getIfSourceExist(source);

                    // get metadata fro the source
                    const websiteMetadataModel: WebsiteMetadataModel = await this.feedService
                        .extractMetaDataFromURl(link)
                        .catch(_ => this.loggerService.log(`META - ${link} -  could not be extracted`));

                    // if meta data exist on the feed
                    if (websiteMetadataModel) {

                        // get page title
                        const title = await this.feedService.getPageTitle(websiteMetadataModel);

                        // get page description
                        const description = await this.feedService.getPageDescription(websiteMetadataModel);

                        //get page image
                        const imageUrl = await this.feedService.getPageImage(websiteMetadataModel);

                        // get sentiment of the content 
                        const content = `${title} ${description}`;
                        const sentiment = await this.feedService.getNlpScore(content).catch();

                        //get page keywords
                        const keywords = await this.feedService.getPageKeyWords(websiteMetadataModel);

                        //get page twitter Handle
                        const twitterHandle = await this.feedService.getPageTwitterHandle(websiteMetadataModel);

                        // build feed object
                        const addFeedDTO: AddFeedDTO = {
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
                        await this.feedService
                            .addFeed(addFeedDTO)
                            .then(_ => this.loggerService.log(`GUID - ${addFeedDTO.guid} -  added`))
                            .catch(_ => this.loggerService.log(`GUID - ${addFeedDTO.guid} -  already exist`));


                        // check is feed source is already exist in source model
                        if (getIfSourceExist) {
                            this.loggerService.log(`Source - ${addFeedDTO.source} - already exist`)
                        }
                        else {

                            // save page source
                            await this.sourceService.saveFeedSource(addFeedDTO);
                        }

                        // send push notifications
                        await this.userDeviceService.sendPushNotifications(sentiment, addFeedDTO);
                    }
                }
                else{
                    this.loggerService.log(`GUID - ${guid} - already exist`)
                }
                
            });
        })
        // return ok
        return res.status(HttpStatus.OK).json({ status: 'ok', message: 'Feeds from sources received successfully' });
    }
}

