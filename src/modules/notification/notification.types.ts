export type NotificationChannel = 'EMAIL' | 'APP';

export type NotificationType =
  | 'WELCOME_EMAIL'
  | 'FORGOT_PASSWORD'
  | 'PRODUCT_CREATED' 
  | 'VENDOR_APPROVAL'
  | 'REQUEST_OTP'
  | 'ORDER_CREATED'
  | 'REQUEST_PASSWORD_OTP'

export interface NotificationPayload {
  type: NotificationType;
  channel: NotificationChannel[];
  to: string;
  subject?: string;
  data: Record<string, any>;
}


