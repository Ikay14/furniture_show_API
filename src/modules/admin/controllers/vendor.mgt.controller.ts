import { Controller, Body, Param, Patch, Get, Query, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Roles } from "src/decorators/roles.decorator";
import { RolesGuard } from "src/guards/roles.guard";
import { VendorManagementService } from "../services/vendor.mgt.service";
import { JwtAuthGuard } from "src/guards/jwt.guard";
import { DeclineVendorDto } from "../DTO/decline.dto";
import { GetUser } from "src/decorators/user.decorator";


@ApiTags('Vendor')
@Controller('vendor')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class VendorManagementController {
  constructor(private vendorService: VendorManagementService) {}

  @Get('application/:vendorId')
  async getVendorApplication(@Param('vendorId') vendorId: string) {
    return this.vendorService.getVendorApplication(vendorId);
  }

  @Patch('application/approve/:vendorId')
  async approveVendorApplication(@Param('vendorId') vendorId: string) {
    return this.vendorService.approveVendorApplication(vendorId);
  }

  @Get('applications')
  async getAllVendorApplications(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status: string
  ) {
    const pageNum = Math.max(Number(page), 1);
    const limitNum = Math.max(Number(limit), 1);
    return this.vendorService.getAllVendorApplications(pageNum, limitNum, status);
  }

  @Patch('application/reject/:vendorId')
  async declineVendorApplication(
    @Param('vendorId') vendorId: string,
    @Body() declineDto: DeclineVendorDto
  ) {
    return this.vendorService.declineVendorApplication(vendorId, declineDto);
  }
}
