import { Injectable, NotFoundException } from "@nestjs/common";
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
    const { productId, quantity } = dto;

    // Get product with vendor
    const product = await this.findProductWithVendor(productId)
   
    //  Get or create cart (unpopulated)
    const cart = await this.getOrCreateCart(userId);

    // Update cart items
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId,
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        product: product,
        vendor: product.vendor._id,
        quantity,
      });
    }

    this.calculateCart(cart.id)

    // Save cart
    await cart.save()
  
  }

  // Helper: Find product with vendor
  private async findProductWithVendor(productId: string) {
    const product = await this.productModel
      .findById(productId)
      .populate('vendor')


    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (!product.vendor) {
      throw new NotFoundException('Product vendor not found');
    }

    return product as Product
  }

  // Helper: Get or create cart
  private async getOrCreateCart(userId: string) {
    let cart = await this.cartModel.findOne({
      user: userId,
      isPurchased: false,
      isActive: true,
    });

    if (!cart) {
      cart = new this.cartModel({
        user: userId,
        items: [],
        isActive: true,
      });
    }

    return cart;
  }

  
  // Helper: cart with total price
  private async calculateCart(cartId: string) {
    const cart = await this.cartModel
      .findById(cartId)
    if (!cart) {
      throw new NotFoundException('cart not found')
    }
    // Calculate total price
    if (cart) {
      cart.totalPrice = cart.items.reduce((total, item) => {
        const product = item.product as Product
        return total + (product.price * item.quantity);
      }, 0)
    }

    // Update total in database
    await this.cartModel.findByIdAndUpdate(cartId, {
      totalPrice: cart.totalPrice,
    });

    return cart;
  }

  // Additional cart operations
  async updateCartItemQuantity(
    userId: string,
    productId: string,
    quantity: number
  ) {
    const cart = await this.cartModel.findOne({
      user: userId,
      isPurchased: false,
      isActive: true,
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      throw new NotFoundException('Product not found in cart');
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();

    return cart
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
