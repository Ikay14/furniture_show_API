import { IsString } from 'class-validator'


export class CreateNotificationRecipientDto {

  @IsString()
  recipientId: string; // _id of user/vendor/admin

  @IsString()
  recipientType: 'User' | 'Vendor' | 'Admin'
}
