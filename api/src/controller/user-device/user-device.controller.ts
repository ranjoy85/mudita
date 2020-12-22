import { Body, Controller, Get, HttpStatus, Post, Res } from '@nestjs/common';
import { AddUserDeviceDTO } from 'src/dto/add-user-device.dto';
import { LoggerService } from 'src/service/logger/logger.service';
import { UserDeviceService } from 'src/service/user-device/user-device.service';

@Controller('/api/userDevice')
export class UserDeviceController {
    constructor(
        private userDeviceService: UserDeviceService,
        private loggerService: LoggerService
    ) { }

    // add a customer
    @Post('/add')
    async addUserDevice(@Res() res, @Body() addUserDeviceDTO: AddUserDeviceDTO) {
        this.loggerService.log(JSON.stringify(addUserDeviceDTO));
        const feed = await this.userDeviceService.addUserDevice(addUserDeviceDTO);
        return res.status(HttpStatus.OK).json({
            message: "User device has been added successfully",
            feed
        })
    }
}
