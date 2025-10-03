import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Order } from './model/order.model';
import { Model, Connection } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from '../product/model/product.model';
import { Cart } from '../carts/model/carts.model';
import { InjectConnection } from '@nestjs/mongoose';
import { generateOrderRef } from 'src/utils/generate.order.reference';
import { OrderStatus } from './model/order.model';
import { PaymentService } from '../payment/payment.service';
import { User } from '../user/model/user.model';


@Injectable()
export class OrdersService {
    constructor(
        @InjectModel(Order.name) private orderModel: Model<Order>,
        @InjectModel(Cart.name) private cartModel: Model<Cart>,
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Product.name) private productModel: Model<Product>,
        @InjectConnection() private readonly connection: Connection,
        private paymentService: PaymentService
    ){}

    async createOrder(userId: string, cartId: string): Promise<{ msg: string; order: any }> {
    const session = await this.connection.startSession()
    session.startTransaction()

    try {
        const user = await this.userModel.findById(userId).session(session)
        if (!user) throw new NotFoundException('User not found')  

        const cart = await this.cartModel.findOne({ userId, isActive: true })
        .populate('products.productId')
        .session(session)
        if (!cart || cart.products.length === 0) throw new BadRequestException('Empty or invalid cart')


      // Validate products
        const productIds = cart.products.map(p => p.productId);
        const foundProducts = await this.productModel.find({ _id: { $in: productIds } }).session(session)

        if (foundProducts.length !== productIds.length) throw new NotFoundException('One or more products not found');
      

      // Check stock levels
        for (const item of cart.items) {
        const product = foundProducts.find(p => p.id.equals(item.productId));
        if (!product || product.inStock < item.quantity) throw new BadRequestException(`Product ${product?.name || item.productId} is out of stock`);

        }

      // Reduce stock
        for (const item of cart.items) {
        await this.productModel.updateOne(
            { _id: item.pr },
            { $inc: { inStock: -item.quantity } },
            { session }
        )
}
        const order = await  new this.orderModel(
        {
            user: userId,
            cart: cartId,
            products: cart.products,
            totalPrice: cart.totalPrice,
            orderRef: generateOrderRef(),
            status: OrderStatus.PROCESSING
        },
        { session }
)

      // mark user cart as inactive
      await this.cartModel.updateOne({ _id: cartId }, { isActive: false }, { session })

      await this.paymentService.initializePayment({
        customerId: userId,
        email: user.email,
        amount: order[0].totalPrice, 
        orderId: order[0]._id
      })

      // Commit transaction
      await session.commitTransaction()
      session.endSession()

      return {
        msg: 'Order created successfully',
        order: order[0] // Because create returns an array
      };


    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }
 
    async getUserOrders(userId: string): Promise<{ msg: string; orders: Order[] }> {

        const orders = await this.orderModel.find({ user: userId })
        .populate('products.productId')
        .populate('user', 'username email')
        .populate('cart', 'products totalPrice')
    
        if (!orders || orders.length === 0) {
        throw new NotFoundException(`No orders found for user with id ${userId}`);
        }
    
        return {
        msg: 'User orders fetched successfully',
        orders
        }
    }
}


