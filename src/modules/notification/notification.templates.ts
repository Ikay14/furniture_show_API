export const notificationTemplates = {
  WELCOME_EMAIL: {
    subject: 'Welcome to ShopForYou!',
    template: 'welcome',
    channels: ['EMAIL'],
  },
  FORGOT_PASSWORD: {
    subject: 'Reset your password',
    template: 'resetPassword',
    channels: ['EMAIL'],
  },
  VENDOR_APPROVAL: {
    subject: 'Vendor Approved!',
    template: 'vendor',
    channels: ['EMAIL', 'APP'],
  },
  PRODUCT_CREATED: {
    subject: 'Product Created!',
    template: 'productCreated',
    channels: ['EMAIL', 'APP'],
  },
  PRODUCT_UPDATED: {
    subject: 'Product Updated!',
    template: 'productUpdated',
    channels: ['EMAIL', 'APP'],
  },
  REQUEST_OTP: {
    subject: 'OTP Request!',
    template: 'request.otp',
    channels: ['EMAIL', 'APP'],
  },
};

