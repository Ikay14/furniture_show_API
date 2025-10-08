import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Cart, CartDocument } from "./model/carts.model";
import { Product } from "../product/model/product.model";
import { CreateCartDto } from "./dto/add.cart.dto";
import { Vendor } from "../vendor/model/vendor.model";

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private readonly cartModel: Model<Cart>,
    @InjectModel('Product') private readonly productModel: Model<Product>,
  ) {}

  async addToCart(userId: string, dto: CreateCartDto) {
  
  for (const { productId, quantity } of dto.items) {
    const product = await this.findProductWithVendor(productId);

    const cart = await this.getOrCreateCart(userId);

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId,
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        product: product._id as Types.ObjectId,
        vendor: product.vendor._id,
        quantity,
      });
    }

    await this.calculateTotalPrice(cart);
    await cart.save();
  }

  return await this.getOrCreateCart(userId);
}

async getCart(userId: string) {
    const cart = await this.cartModel
      .findOne({
        user: userId,
        isPurchased: false,
        isActive: true,
      })
      .populate({
        path: 'items.product',
        select: 'name price images description stock',
      })
      .populate({
        path: 'items.vendor',
        select: 'name email',
      })
      .lean()

    if (cart) {
      cart.totalPrice = cart.items.reduce((total, item) => {
        const product = item.product as Product;
        return total + (product.price * item.quantity);
      }, 0);
    }

    return cart;
  }


async removeFromCart(userId: string, productId: string, quantityToRemove = 1) {
  const cart = await this.cartModel.findOne({
    user: userId,
    isPurchased: false,
    isActive: true,
  });

  if (!cart) throw new NotFoundException('Cart not found');

  const item = cart.items.find(
    (i) => i.product.toString() === productId.toString()
  );

  if (!item) throw new NotFoundException('Product not found in cart');

  // Adjust quantity or remove item
  if (item.quantity > quantityToRemove) {
    item.quantity -= quantityToRemove;
  } else {
    cart.items = cart.items.filter(
      (i) => i.product.toString() !== productId.toString()
    );
  }

  // Recalculate total
  await this.calculateTotalPrice(cart);

  cart.markModified('items');
  await cart.save();

  return cart;
}

async clearCart(userId: string): Promise<void> {
    await this.cartModel.findOneAndUpdate(
      { user: userId, isPurchased: false },
      { items: [], totalPrice: 0 }
    );
  }

  // Helpers: ****************************************
  
  private async findProductWithVendor(productId: string) {
    const product = await this.productModel
      .findById(productId)
      .populate('vendor')

    if (!product) {
      throw new NotFoundException('Product not found')
    }

    if (!product.vendor) {
      throw new NotFoundException('Product vendor not found')
    }

    return product as Product
  }

  private async getOrCreateCart(userId: string): Promise<CartDocument> {
  let cart = await this.cartModel.findOne({ user: userId, isActive: true });

  if (!cart) {
    cart = new this.cartModel({
      user: userId,
      items: [],
      totalPrice: 0,
      isActive: true,
    });
  }
  
  return cart;
}


private async calculateTotalPrice(cart: CartDocument): Promise<void> {
  // Populate prices of all products
  await cart.populate('items.product', 'price');

  const total = cart.items.reduce((sum, item) => {
    const price = (item.product as any)?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  cart.totalPrice = total;
}


}

