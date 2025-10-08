import { Types } from "mongoose";
import { Vendor } from "../vendor/model/vendor.model";
import { Product } from "../product/model/product.model";

export interface CartItemRaw {
    product: Types.ObjectId | Product
    vendor: Types.ObjectId | Vendor
    quantity: number
    _id?: Types.ObjectId
}

export interface OrderItemPopulated {
  product: Product;
  vendor: Types.ObjectId;
  quantity: number;
  price: number; 
  _id?: Types.ObjectId;
}