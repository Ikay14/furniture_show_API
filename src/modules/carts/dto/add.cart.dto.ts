export class CreateCartItemDto {
  productId: string;
  quantity: number;
  variantSku?: string;
}

export class CreateCartDto {
  items: CreateCartItemDto[];
}
