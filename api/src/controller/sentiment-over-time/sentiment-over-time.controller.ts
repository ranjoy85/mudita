import { Controller, Get, HttpStatus, LoggerService, Param, Res } from '@nestjs/common';
import { SentimentOverTimeService } from 'src/service/sentiment-over-time/sentiment-over-time.service';
import * as moment from 'moment';

/**
 * Controller
 */
@Controller('/api/sentiments-over-time')
export class SentimentOverTimeController {

    /**
     * Creates an instance of sentiment over time controller.
     * @param loggerService 
     * @param sentimentOverTimeService 
     */
    constructor(
        private sentimentOverTimeService: SentimentOverTimeService
    ) { }

    /**
     * Gets sentiment over time controller
     * @param date 
     * @param res 
     * @returns  
     */
    @Get('/sentiments/:date')
    async getAllFeedsByDate(@Param('date') date, @Res() res) {
        const sentiments = await this.sentimentOverTimeService.getSentimentOverTime(date);
        const times = sentiments.sentimentOverTime; 
        await this.sentimentOverTimeService.sortTime(times);
        
        let { timeSeries, scoreSeries } = await this.sentimentOverTimeService.findTimeGapBestSentiment(times);
        return res.status(HttpStatus.OK).json(
            {
                date: date,  
                timeSeries: timeSeries, 
                scoreSeries: scoreSeries
            }
        );
    }

    
}
