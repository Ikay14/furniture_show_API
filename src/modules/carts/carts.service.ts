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


  // Helper: Find product with vendor
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

  
async calculateTotalPrice(cart: CartDocument) {
  let total = 0;

  for (const item of cart.items) {
    const product = await this.productModel.findById(item.product).select('price');
    if (!product) continue;
    total += product.price * item.quantity;
  }

  cart.totalPrice = total;

  await this.cartModel.findByIdAndUpdate(cart._id, { totalPrice: total });

  return total;
}


  async removeFromCart(userId: string, productId: string) {
    const cart = await this.cartModel.findOne({
      user: userId,
      isPurchased: false,
      isActive: true,
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    // Filter out the item
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    return cart
  }

  async clearCart(userId: string): Promise<void> {
    await this.cartModel.findOneAndUpdate(
      { user: userId, isPurchased: false },
      { items: [], totalPrice: 0 }
    );
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
}
