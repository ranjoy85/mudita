import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { AddUserDeviceDTO } from 'src/dto/add-user-device.dto';
import { UserDeviceService } from 'src/service/user-device/user-device.service';

@Controller('userDevice')
export class UserDeviceController {
    constructor(private userDeviceService: UserDeviceService) { }

    // add a customer
    @Post('/add')
    async addCustomer(@Res() res, @Body() addUserDeviceDTO: AddUserDeviceDTO) {
        const feed = await this.userDeviceService.addUserDevice(addUserDeviceDTO);
        return res.status(HttpStatus.OK).json({
            message: "User device has been added successfully",
            feed
        })
    }
}
