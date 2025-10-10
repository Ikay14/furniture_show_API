export const notificationTemplates = {
  WELCOME_EMAIL: {
    subject: 'Welcome to ShopForYou!',
    template: 'welcome',
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
  ORDER_CREATED: {
    subject: 'Order Created!',
    template: 'order',
    channels: ['EMAIL'],
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
  REQUEST_PASSWORD_OTP: {
    subject: 'Request PASSWORD SENT!',
    template: 'request-password',
    channels: ['EMAIL'],
  },
};

