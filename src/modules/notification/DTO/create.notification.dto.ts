import { IsString } from "class-validator";


export class NotificationDTO{
    @IsString()
    recipient: string

    @IsString()
    message: string

    @IsString()
    notificationType: any

}