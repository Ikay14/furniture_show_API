import { Exclude } from 'class-transformer';

export class UserEntity {
  id: number;
  firstName: string;
  lastName: string;
  email: string
  role:string
  carts: string[]
  wishList: string[]
  avatar: string
  gender: string
  phone: string
  address: string
  dob: string
}

export function toUserEntity(doc: any): UserEntity {
  return {
    id: doc._id.toString(),
    email: doc.email,
    role: doc.role,
    wishList: doc.wishList,
    firstName: doc.firstName,
    lastName: doc.lastName,
    avatar: doc.avatar,
    dob: doc.dob,
    gender: doc.gender,
    phone: doc.phone,
    address: doc.address,
    carts: doc.carts,
  };
}
