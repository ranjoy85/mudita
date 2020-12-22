import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { AddSourceDTO } from 'src/dto/add-source.dto';
import { LoggerService } from 'src/service/logger/logger.service';
import { SourceService } from 'src/service/source/source.service';

@Controller('source')
export class SourceController {
    constructor(
        private sourceService: SourceService,
        private loggerService: LoggerService
    ) { }

    // add a customer
    @Post('/add')
    async addSource(@Res() res, @Body() addSourceDTO: AddSourceDTO) {
        this.loggerService.log(JSON.stringify(addSourceDTO));
        const feed = await this.sourceService.addSource(addSourceDTO);
        return res.status(HttpStatus.OK).json({
            message: "Feed source has been added successfully",
            feed
        })
    }
}
