import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Order } from './model/order.model';
import { Model, Connection, ClientSession } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from '../product/model/product.model';
import { Cart, CartDocument, CartItemRaw } from '../carts/model/carts.model';
import { InjectConnection } from '@nestjs/mongoose';
import { generateOrderRef } from 'src/utils/generate.order.reference';
import { OrderStatus } from './model/order.model';
import { PaymentService } from '../payment/payment.service';
import { User } from '../user/model/user.model';


@Injectable()
export class OrdersService {
    constructor(
        @InjectModel(Order.name) private orderModel: Model<Order>,
        @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Product.name) private productModel: Model<Product>,
        @InjectConnection() private readonly connection: Connection,
        private paymentService: PaymentService
    ){}

    async createOrders(cartId: string, userId: string) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const cart = await this.validateCart(cartId, userId, session)

      const foundProducts = await this.validateProducts(cart, session)

      await this.checkStockLevels(cart, foundProducts)

      const vendorOrders: Record<string, CartItemRaw[]> = this.groupItemsByVendor(cart)

      const createdOrders = await Promise.all(
        Object.entries(vendorOrders).map(([vendorId, items]) =>
          this.createVendorOrder(userId, cart, vendorId, items, session)
        )
      )

      await this.deactivateCart(cartId, session);

      await session.commitTransaction()
      return { msg: 'Orders created successfully', orders: createdOrders }
    } catch (err) {
      await session.abortTransaction()
      throw err;
    } finally {
      session.endSession()
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

    async checkout(orderIds: string[], userId: string) {
    // Fetch orders
    const orders = await this.orderModel.find({ 
      _id: { $in: orderIds }, 
      user: userId, 
      status: 'PENDING_PAYMENT' 
    }).populate('user', 'email');

    if (!orders || orders.length === 0) {
      throw new NotFoundException('No pending orders found');
    }

    // Calculate total across all vendor orders
    const totalAmount = orders.reduce((sum, order) => sum + order.totalPrice, 0);

    // Call payment provider
    const paymentSession = await this.paymentService.initializePayment({
      amount: totalAmount,
      customerId: userId,
      orderId: orders.map(o => String(o._id)),
      email: (orders[0].user as any).email, 
    });

    return {
      msg: 'Checkout initialized',
      paymentSession,
    };
  }


    private async createVendorOrder(
          userId: string,
          cart: Cart,
          vendorId: string,
          items: any[],
          session: ClientSession
        ) {
         const totalPrice = items.reduce(
            (sum, item) => sum + item.product.price * item.quantity, 0);

          // Reduce stock for only these vendor items
          await this.reduceStock(items, session);

          // Create vendor-specific order record
         const order = await this.createOrderRecord(userId, vendorId, cart.id, items, totalPrice, session);

          return order;
}

  private async validateCart(cartId: string, userId: string, session: ClientSession) {
  const cart = await this.cartModel.findOne({ _id: cartId, user: userId, isActive: true })
    .populate('items.product', 'name price inStock vendor')
    .session(session);

  if (!cart || cart.items.length === 0) throw new BadRequestException('Empty cart');
  return cart;
}



    private async validateProducts(cart: any, session: ClientSession) {
    const productIds = cart.items.map((item: any) => item.product._id)

    const foundProducts = await this.productModel.find({ _id: { $in: productIds } }).session(session)

    if (foundProducts.length !== productIds.length) {
    throw new NotFoundException('One or more products not found')
  }

    return foundProducts
}


    private async checkStockLevels(cart: any, foundProducts: any[]) {
    for (const item of cart.items) {
    const product = foundProducts.find(p => p.id.equals(item.product._id))
    if (!product || product.inStock < item.quantity) {
      throw new BadRequestException(`Product ${product?.name || item.product._id} is out of stock`)
    }
  }
}


private async reduceStock(items: any[], session: ClientSession) {
  for (const item of items) {
    await this.productModel.updateOne(
      { _id: item.product._id },
      { $inc: { inStock: -item.quantity } },
      { session }
    );
  }
}


    private async createOrderRecord(
        userId: string,
        vendorId: string,
        cartId: string,
        items: any[],
        totalPrice: number,
        session: ClientSession
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
          }],
          { session }
        );

      return order[0]
}


private groupItemsByVendor(cart: Cart): Record<string, CartItemRaw[]> {
  return cart.items.reduce((acc, item) => {
    const vendorId = item.vendor.toString()
    if (!acc[vendorId]) acc[vendorId] = []
    acc[vendorId].push(item);
    return acc;
  }, {} as Record<string, CartItemRaw[]>)
}

  private async deactivateCart(cartId: string, session: ClientSession) {
  await this.cartModel.updateOne({ _id: cartId }, { isActive: false }, { session })
}
 
 private async checkoutOrderPayment(){}

}


