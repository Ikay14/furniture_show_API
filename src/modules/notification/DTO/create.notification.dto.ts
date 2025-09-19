import { IsString } from "class-validator";


export class NotificationDTO{
    @IsString()
    recipientId: string

    @IsString()
    recipientType: 'User' | 'Vendor' | 'Admin'

    @IsString()
    message: string

    @IsString()
    notificationType: any

}