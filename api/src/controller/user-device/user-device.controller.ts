import { Body, Controller, Get, HttpStatus, Post, Res } from '@nestjs/common';
import { AddUserDeviceDTO } from 'src/dto/add-user-device.dto';
import { UserDeviceService } from 'src/service/user-device/user-device.service';

@Controller('/api/userDevice')
export class UserDeviceController {
    constructor(private userDeviceService: UserDeviceService) { }

    @Get('/push')
    async getAllFeeds(@Res() res) {
        const feeds = await this.userDeviceService.sendPush();
        return res.status(HttpStatus.OK).json(feeds);
    }

    // add a customer
    @Post('/add')
    async addCustomer(@Res() res, @Body() addUserDeviceDTO: AddUserDeviceDTO) {
        console.log(JSON.stringify(addUserDeviceDTO));
        const feed = await this.userDeviceService.addUserDevice(addUserDeviceDTO);
        return res.status(HttpStatus.OK).json({
            message: "User device has been added successfully",
            feed
        })
    }
}
