import { Body, Controller, Get, HttpStatus, NotFoundException, Param, Post, Query, Res } from '@nestjs/common';
import { AddFeedDTO } from 'src/dto/add-feed.dto';
import { FeedService } from 'src/service/feed/feed.service';
import * as xml2js from 'xml2js';
import * as googleCloudLanguage from '@google-cloud/language';
import { FeedModule } from 'src/module/feed/feed.module';
import { FeedModel } from 'src/model/feed.model';

@Controller('feed')
export class FeedController {
    constructor(private feedService: FeedService) { }

    // add a customer
    @Post('/create')
    async addCustomer(@Res() res, @Body() addFeedDTO: AddFeedDTO) {
        const feed = await this.feedService.addFeed(addFeedDTO);
        return res.status(HttpStatus.OK).json({
            message: "Customer has been created successfully",
            feed
        })
    }

    // Retrieve customers list
    @Get('/feeds/:date')
    async getAllFeeds(@Param('date') date, @Res() res) {
        const feeds = await this.feedService.getAllFeed(date);
        return res.status(HttpStatus.OK).json(feeds);
    }

    /**
     * Gets feed controller
     * @param res 
     */
    @Get('/feedsFromSource')
    async getAllNewsFeedsFromSource(@Res() res) {
        
        

        const feeds = await (await this.feedService.getAllNewsFeedsFromSource()).subscribe(async response=>{
            const parseXml = await this.feedService.parseXml(response.data);
            const feeds = parseXml.rss.channel[0].item;
            feeds.forEach(async element => {
                
                const guid = element.guid[0]._;
                const getIfFeedExist = await this.feedService.getIfFeedExist(guid);
                
                if(getIfFeedExist){
                    console.log('guid: '+guid+' already exist');
                    console.log('----------- already exist -----------');
                }
                else{
                    const sentiment = await this.feedService.getNlpScore(element.title[0]);
                
                    const addFeedDTO : AddFeedDTO = {
                        guid : guid,
                        title: await this.feedService.filterTitle(element.title[0]),
                        link: element.link[0],
                        pubDate: element.pubDate[0],
                        source: element.source[0]._,
                        score: `${sentiment.score}`,
                        magnitude: `${sentiment.magnitude}`,

                    };

                    await this.feedService.addFeed(addFeedDTO);

                    console.log('guid: '+guid+' added');
                    console.log('----------- added -----------');
                }
            });
            return res.status(HttpStatus.OK).json({status:'ok'});
        });
    }
}