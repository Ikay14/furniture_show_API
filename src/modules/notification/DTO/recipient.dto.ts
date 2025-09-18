export class CreateNotificationRecipientDto {
  recipientId: string; // _id of user/vendor/admin
  recipientModel: 'User' | 'Vendor' | 'Admin';
}
