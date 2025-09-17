import { IsString } from "class-validator";

export class DeclineVendorDto {
    @IsString()
    reason: string;

    @IsString()
    adminId: string;

}