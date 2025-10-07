export class CreateCartItemDto {
  productId: string;
  quantity: number;
}

export class CreateCartDto {
  items: CreateCartItemDto[];
}
