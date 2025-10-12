import { BadRequestException, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Order } from './model/order.model';
import { Model, Connection, ClientSession, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from '../product/model/product.model';
import { Cart, CartDocument } from '../carts/model/carts.model';
import { InjectConnection } from '@nestjs/mongoose';
import { generateOrderRef } from 'src/utils/generate.order.reference';
import { OrderStatus } from './model/order.model';
import { PaymentService } from '../payment/payment.service';
import { User } from '../user/model/user.model';
import { OrderItemPopulated, CartItemRaw } from '../carts/cart.interface';
import { NotificationService } from '../notification/notification.service';
import { Vendor } from '../vendor/model/vendor.model';
import { toUserEntity, UserEntity } from '../user/DTO/user-entity.dto';
import { CheckoutDTO } from './dto/checkout.dto';

@Injectable()
export class OrdersService {
    private readonly logger = new Logger(OrdersService.name)
    constructor(
        @InjectModel(Order.name) private orderModel: Model<Order>,
        @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Product.name) private productModel: Model<Product>,
        private paymentService: PaymentService,
        private notificationService: NotificationService,
    ){}

    async createOrders(cartId: string, userId: string) {

    try {
      const user = await this.getuser(userId)

      const cart = await this.validateCart(cartId, userId)

      const foundProducts = await this.validateProducts(cart)

      await this.checkStockLevels(cart, foundProducts)

      const vendorOrders: Record<string, CartItemRaw[]> = this.groupItemsByVendor(cart)

      const createdOrders = await Promise.all(
        Object.entries(vendorOrders).map(([vendorId, items]) =>
          this.createVendorOrder(userId, cart, vendorId, items)
        )
      )
   
      await this.deactivateCart(cartId)

      // Populate the first order for notification
      const firstOrder = await this.orderModel
        .findById(createdOrders[0]._id)
        .populate<{ vendor: Vendor }>('vendor', 'storeName')
        .populate<{ items: OrderItemPopulated[] }>('items.product', 'name price')
        .lean()

      this.logger.log('Order email job added to the queue');
      if (firstOrder) {
        await this.notificationService.sendUserOrder({
          userId: userId,
          name: user.user.lastName,
          email: user.user.email,
          orderId: firstOrder.orderId,
          orderTotal: firstOrder.totalPrice,
          orderDate: firstOrder.createdAt,
          vendorName: firstOrder.vendor.storeName,
          products: firstOrder.items.map(item => ({
            name: item.product.name,    
            quantity: item.quantity,
            price: item.product.price, 
          })),
        })
}


      return { msg: 'Orders created successfully', orders: createdOrders }
    } catch (err) {
      throw err
    } 
}

 
    async getUserOrders(userId: string): Promise<{ msg: string; orders: Order[] }> {

        const orders = await this.orderModel.find({ user: userId })
        .populate('items.product')
        .populate('user', 'username email')
        .populate('cart', 'product totalPrice')
    
        if (!orders || orders.length === 0) {
        throw new NotFoundException(`No orders found for user with id ${userId}`);
        }
    
        return {
        msg: 'User orders fetched successfully',
        orders
        }
    }

  async checkout(dto: CheckoutDTO, userId: string ) {
    const { orderIds } = dto

  try {
    const orders = await this.orderModel.find({
        _id: { $in: orderIds },
        user: userId,
        status: OrderStatus.PROCESSING
        }).populate('user', 'email')

    if (!orders.length) throw new NotFoundException('No pending orders found for payment');


    const total = orders.reduce((sum, order) => sum + order.totalPrice, 0)
    const email = (orders[0].user as any).email 

    const paymentSession = await this.paymentService.initializePayment({
      amount: total * 100,
      customerId: userId,
      orderIds: orders.map(ord => String(ord._id)),
      email
    })

    return {
      msg: 'Checkout Initiated',
      paymentSession
  }

    } catch (error) {
      this.logger.warn(error)
      throw error
    }
}


    private async createVendorOrder( userId: string, cart: CartDocument,
          vendorId: string, items: any[] ) {
         const totalPrice = items.reduce(
            (sum, item) => sum + item.product.price * item.quantity, 0);

          // Create vendor-specific order record
         const order = await this.createOrderRecord(userId, vendorId, cart.id, items, totalPrice)

         return order
}

  private async validateCart(cartId: string, userId: string) {
  const cart = await this.cartModel.findById({ _id: cartId, user: userId, isActive: true })
    .populate('items.product', 'name price vendor')

  if (!cart || cart.items.length === 0) throw new BadRequestException('Empty cart');
  return cart;
}



    private async validateProducts(cart: CartDocument) {
    const productIds = cart.items.map((item) => item.product._id)

    const foundProducts = await this.productModel.find({ _id: { $in: productIds } })

    if (foundProducts.length !== productIds.length) {
    throw new NotFoundException('One or more products not found')
  }

    return foundProducts
}


private async checkStockLevels(cart: CartDocument, foundProducts: any[]) {
  const errors: string[] = [];

  for (const item of cart.items) {
    const itemProductId = item.product._id
      ? item.product._id.toString()
      : item.product.toString()

    const product = foundProducts.find(
      (p) => p._id.toString() === itemProductId
    );

    switch (true) {
      case !product:
        errors.push(`Product ${itemProductId} not found in inventory`);
        break;

      case product.inStock == null:
        errors.push(`Product ${product.name} has no stock data`);
        break;

      case product.inStock < item.quantity:
        errors.push(
          `Product ${product.name} is out of stock (requested: ${item.quantity}, available: ${product.inStock})`
        );
        break;

      default:
        break;
    }
  }

  if (errors.length > 0) {
    throw new BadRequestException(errors.join('; '));
  }
}



    private async createOrderRecord(
        userId: string,
        vendorId: string,
        cartId: string,
        items: any[],
        totalPrice: number
      ) {
        const order = await this.orderModel.create(
          [{
            user: userId,
            vendor: vendorId,
        cart: cartId,
            items,
            totalPrice,
            orderRef: generateOrderRef(),
            status: OrderStatus.PROCESSING,
          }]
        );

      return order[0]
}


private groupItemsByVendor(cart: CartDocument): Record<string, CartItemRaw[]> {
  return cart.items.reduce((acc, item) => {
    const vendorId = item.vendor.toString()
    if (!acc[vendorId]) acc[vendorId] = []
    acc[vendorId].push(item);
    return acc;
  }, {} as Record<string, CartItemRaw[]>)
}

  private async deactivateCart(cartId: string) {
  await this.cartModel.updateOne({ _id: cartId }, { isActive: false })
}

  private async getuser(userId: string):Promise<{user: UserEntity}>{
    const user = await this.userModel.findById(userId).lean()
    if(!user) throw new NotFoundException('user not found')
    return {user: toUserEntity(user) }
  }

}