import { Body, Controller, Get, HttpStatus, Post, Res } from '@nestjs/common';
import { AddUserDeviceDTO } from 'src/dto/add-user-device.dto';
import { LoggerService } from 'src/service/logger/logger.service';
import { UserDeviceService } from 'src/service/user-device/user-device.service';

@Controller('/api/userDevice')
export class UserDeviceController {
    /**
     * Creates an instance of user device controller.
     * @param userDeviceService 
     * @param loggerService 
     */
    constructor(
        private userDeviceService: UserDeviceService,
        private loggerService: LoggerService
    ) { }

    /**
     * Posts user device controller
     * @param res 
     * @param addUserDeviceDTO 
     * @returns  
     */
    @Post('/add')
    async addUserDevice(@Res() res, @Body() addUserDeviceDTO: AddUserDeviceDTO) {
        this.loggerService.log(JSON.stringify(addUserDeviceDTO));
        const feed = await this.userDeviceService.addUserDevice(addUserDeviceDTO);
        return res.status(HttpStatus.OK).json({
            message: "User device has been added successfully",
            feed
        })
    }

    /**
     * Gets user device controller
     * @param res 
     * @returns  
     */
    @Get('/testPush')
    async testPushNotification(@Res() res){
        this.userDeviceService.testPush();
        return res.status(HttpStatus.OK).json({
            message: "Push sent successfully",
        })
    }
}
