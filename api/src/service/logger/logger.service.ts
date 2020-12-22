import { Injectable } from '@nestjs/common';

@Injectable()
export class LoggerService {
    constructor(){}

    async log(message: string){
        if(process.env.LOG === 'true'){
            console.log(message);
        }
    }
}
