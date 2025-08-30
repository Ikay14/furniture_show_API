import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart } from './model/carts.model';
import { User } from '../user/model/user.model';
import { Product } from '../product/model/product.model';
import { CreateCartDto } from './dto/add.cart.dto';


@Injectable()
export class CartsService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(User.name) private userModel: Model<User>
) {}

    async createCart(createCartDto: CreateCartDto, userId: string): 
    Promise<{ msg: string; cart: Cart }> {

    const { products } = createCartDto;

    const productIds = products.map(p => p.productId)
   

    const foundProducts = await this.productModel.find({ _id: { $in: productIds } })

    if (foundProducts.length !== products.length) {
    throw new NotFoundException('One or more products not found')
    }

    let totalPrice = 0

    const productMap = new Map<string, Product>()

    foundProducts.forEach(prod => {
    const idStr = (prod._id as Types.ObjectId).toString();
    productMap.set(idStr, prod);
});


    products.forEach(item => {
    const product = productMap.get(item.productId)
    if (!product) return
    totalPrice += product.price * item.quantity;
    });

    
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException(`User with id ${userId} not found`);

    const cart = await this.cartModel.create({
        products,
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