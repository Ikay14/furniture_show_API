export interface UserOrderNotificationData {
  // User info 
  userId: string;
  name?: string;
  email: string;

  // Order info
  orderId: string;
  orderTotal: number;
  orderDate: Date;

  // Product info (for summary)
  products: {
    name: string;
    quantity: number;
    price: number;
  }[];

  // Vendor info 
  vendorName?: string;
}
