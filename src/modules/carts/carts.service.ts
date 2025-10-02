import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart } from './model/carts.model';
import { User } from '../user/model/user.model';
import { Product } from '../product/model/product.model';
import { CreateCartDto } from './dto/add.cart.dto';


@Injectable()
export class CartsService {
  private readonly logger = new Logger(CartsService.name)
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(User.name) private userModel: Model<User>
) {}

async createCart(createCartDto: CreateCartDto, userId: string): Promise<{ msg: string; cart: Cart }> {
  const { products } = createCartDto; // products: [{ productId, quantity }, ...]
  if (!products || products.length === 0) {
    throw new BadRequestException('Cart must contain at least one product');
  }

  // build ObjectId list
  const productIds = products.map(p => new Types.ObjectId(p.productId));

  // ensure user exists
  const user = await this.userModel.findById(userId);
  if (!user) throw new NotFoundException(`User with id ${userId} not found`);

  // get product documents for the requested productIDs
  const dbProducts = await this.productModel.find({ _id: { $in: productIds } }).lean();
  if (dbProducts.length !== productIds.length) {
    // some product IDs were not found
    throw new NotFoundException('One or more products not found');
  }

  // compute totalPrice by matching each db product to the requested quantity
  let totalPrice = 0;
  const cartProducts = dbProducts.map(dbp => {
    const requested = products.find(p => p.productId === dbp._id.toString())
    if(!requested) return
    const quantity = Math.max(1, (requested.quantity))
    const price = Number(dbp.price)
    totalPrice += price * quantity
    
    return {
      product: dbp._id,
      quantity,
      price
    };
  });

  const cart = await this.cartModel.create({
    products: cartProducts,
    user: userId,
    totalPrice,
  });

  return {
    msg: 'Cart created successfully',
    cart,
  };
}



        async getUserCart(userId: string): Promise<{ msg: string, carts: Cart[] }> {

        const userCarts = await this.cartModel.find({ user: userId })

        if (!userCarts || userCarts.length === 0) throw new NotFoundException(`No carts found for user with id ${userId}`);

        return {
            msg: 'User carts fetched successfully',
            carts: userCarts
        };
    }


    async removeCart(cartId:string, userId: string): Promise<{ msg: string }> {

        const cart = await this.cartModel.findOneAndDelete({ _id: cartId, user: userId });

        if (!cart) throw new NotFoundException(`Cart with id ${cartId} not found for user with id ${userId}`)

        if (cart.isPurchased) throw new NotFoundException(`Cart with id ${cartId} has already been purchased and cannot be deleted`)   

        return { msg: 'Cart removed successfully' };
    }
}