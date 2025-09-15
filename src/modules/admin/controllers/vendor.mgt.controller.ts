import { Controller, Post, Patch, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";


@ApiTags('Vendor')
@Controller('vendor')
export class VendorManagementCore{
    constructor(){}
}